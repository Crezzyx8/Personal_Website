import json
import logging
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from threading import Lock, Thread
from time import monotonic
from typing import Literal
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from clipping_personas import REVIEW_CLIP, SELECT_CLIP
from tiktok import upload_draft

router = APIRouter(prefix="/production")
ROOT = Path(__file__).resolve().parent
JOBS = ROOT / "data" / "production"
TOKEN = ROOT / "youtube-token.json"
MODEL = ROOT / "models" / "ggml-base.bin"
LOCK = Lock()
ACTIVE = {"queued", "download", "transcribe", "review", "render", "upload"}


class ProductionRequest(BaseModel):
    url: str = Field(max_length=2000)
    rights_confirmed: Literal[True]


def video_id(url):
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.username or parsed.password:
        raise ValueError("Gunakan link YouTube HTTPS.")
    parts = parsed.path.strip("/").split("/")
    candidate = ""
    if parsed.netloc == "youtu.be":
        candidate = parts[0]
    if parsed.netloc in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if parsed.path == "/watch":
            candidate = parse_qs(parsed.query).get("v", [""])[0]
        elif len(parts) == 2 and parts[0] in {"shorts", "live", "embed"}:
            candidate = parts[1]
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", candidate):
        raise ValueError("Link video YouTube tidak valid.")
    return candidate


def change(job, status, message):
    job.update(status=status, message=message)
    folder = JOBS / job["id"]
    path = folder / "job.tmp"
    path.write_text(json.dumps(job, ensure_ascii=False), encoding="utf-8")
    path.replace(folder / "job.json")


def read_jobs():
    jobs = []
    for path in JOBS.glob("*/job.json"):
        try:
            job = json.loads(path.read_text(encoding="utf-8"))
            jobs.append(job)
        except (ValueError, OSError):
            continue
    return sorted(jobs, key=lambda job: job["created"], reverse=True)


def recover_interrupted():
    for job in read_jobs():
        if job["status"] in ACTIVE:
            message = "Worker berhenti sebelum proses selesai."
            if job["status"] == "upload":
                message = "Upload terputus. Cek YouTube Studio sebelum kirim ulang."
            change(job, "failed", message)


def run(folder, args, timeout=1800):
    return subprocess.run(args, cwd=folder, capture_output=True, encoding="utf-8",
                          errors="replace", check=True, timeout=timeout).stdout


def ollama_model():
    return os.getenv("OFFICE_OLLAMA_MODEL", "qwen3:4b")


@lru_cache(maxsize=1)
def check_ollama(model, _window):
    try:
        with urlopen("http://127.0.0.1:11434/api/tags", timeout=1) as response:
            models = json.load(response).get("models", [])
        return any(item.get("name") == model for item in models)
    except (OSError, ValueError):
        return False


def ollama_ready():
    return check_ollama(ollama_model(), int(monotonic() // 10))


def chat(system, data, *, max_tokens=400):
    payload = {
        "model": ollama_model(),
        "stream": False, "think": False, "format": "json", "keep_alive": 0,
        "options": {"temperature": 0, "num_ctx": 8192, "num_predict": max_tokens},
        "messages": [{"role": "system", "content": system},
                     {"role": "user", "content": json.dumps(data, ensure_ascii=False)}],
    }
    request = Request("http://127.0.0.1:11434/api/chat", json.dumps(payload).encode(),
                      {"Content-Type": "application/json"})
    with urlopen(request, timeout=300) as response:
        answer = json.load(response)
    return json.loads(answer["message"]["content"])


def parse_srt(path):
    segments = []
    for block in re.split(r"\n\s*\n", path.read_text(encoding="utf-8-sig").strip()):
        lines = block.splitlines()
        if len(lines) < 3 or " --> " not in lines[1]:
            continue
        start, end = lines[1].split(" --> ", 1)
        segments.append((seconds(start), seconds(end), " ".join(lines[2:])))
    return segments


def seconds(stamp):
    hours, minutes, sec = stamp.replace(",", ".").split(":")
    return 3600 * int(hours) + 60 * int(minutes) + float(sec)


def srt_stamp(value):
    minutes, remainder = divmod(round(value * 1000), 60_000)
    hours, minutes = divmod(minutes, 60)
    seconds, ms = divmod(remainder, 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02},{ms:03}"


def choose_clip(segments):
    candidates = []
    cursor = 0
    for start, _, _ in segments:
        if start < cursor:
            continue
        group = [(end, text) for begin, end, text in segments
                 if start <= begin and end <= start + 55]
        if not group or group[-1][0] - start < 20:
            continue
        candidates.append({"start": start, "end": group[-1][0],
                           "text": " ".join(text for _, text in group)})
        cursor = group[-1][0]
    if not candidates:
        raise ValueError("Tidak ada potongan ucapan utuh berdurasi 20–55 detik.")
    stride = max(1, (len(candidates) + 11) // 12)
    shortlist = candidates[::stride][:12]
    for _ in range(min(3, len(shortlist))):
        data = [{"id": i, "transcript": row["text"][:800]}
                for i, row in enumerate(shortlist)]
        choice = chat(SELECT_CLIP, data)
        index = choice.get("id")
        title = choice.get("title")
        if type(index) is not int or not 0 <= index < len(shortlist) or not isinstance(title, str):
            raise ValueError("Strategist mengembalikan pilihan klip yang tidak valid.")
        clip = shortlist.pop(index)
        title = " ".join(title.split())[:95]
        if not title or "<" in title or ">" in title:
            continue
        review = chat(REVIEW_CLIP, {"title": title, "transcript": clip["text"][:2500]})
        if review.get("pass") is True:
            return clip, title
    raise ValueError("Klip tidak lolos review konten dalam tiga percobaan.")


def render(folder, source, segments, clip):
    start, end = clip["start"], clip["end"]
    cues = []
    for begin, finish, line in segments:
        if begin >= start and finish <= end:
            cues.append(f"{len(cues)+1}\n{srt_stamp(begin-start)} --> "
                        f"{srt_stamp(finish-start)}\n{line}\n")
    (folder / "clip.srt").write_text("\n".join(cues), encoding="utf-8")
    filters = ("scale=720:1280:force_original_aspect_ratio=decrease:force_divisible_by=2,"
               "pad=720:1280:(ow-iw)/2:(oh-ih)/2:black,setsar=1,subtitles=clip.srt")
    run(folder, ["ffmpeg", "-nostdin", "-y", "-ss", str(start), "-i", source.name,
                 "-t", str(end-start), "-vf", filters, "-pix_fmt", "yuv420p",
                 "-c:v", "libx264", "-preset", "veryfast", "-threads", "2",
                 "-c:a", "aac", "-movflags", "+faststart", "clip.mp4"])
    probe = json.loads(run(folder, ["ffprobe", "-v", "error", "-show_streams",
                                   "-show_format", "-of", "json", "clip.mp4"], 30))
    video = next(row for row in probe["streams"] if row["codec_type"] == "video")
    if ((video["width"], video["height"]) != (720, 1280)
            or not any(row["codec_type"] == "audio" for row in probe["streams"])
            or abs(float(probe["format"]["duration"]) - (end-start)) > 1):
        raise ValueError("Klip gagal review teknis ukuran, audio, atau durasi.")
    run(folder, ["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-i", "clip.mp4",
                 "-f", "null", "-"], 120)


def upload(path, title):
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    credentials = Credentials.from_authorized_user_file(
        str(TOKEN), ["https://www.googleapis.com/auth/youtube.upload"])
    youtube = build("youtube", "v3", credentials=credentials, cache_discovery=False)
    privacy = os.getenv("OFFICE_YOUTUBE_PRIVACY", "private")
    if privacy not in {"private", "unlisted", "public"}:
        raise ValueError("OFFICE_YOUTUBE_PRIVACY tidak valid.")
    with youtube:
        result = youtube.videos().insert(
            part="snippet,status",
            body={"snippet": {"title": title, "description": "#Shorts", "categoryId": "22"},
                  "status": {"privacyStatus": privacy}},
            media_body=MediaFileUpload(str(path), mimetype="video/mp4",
                                       chunksize=4 * 1024 * 1024, resumable=True),
        ).execute(num_retries=0)
    return result["id"]


def process(job):
    folder = JOBS / job["id"]
    try:
        change(job, "download", "Mengambil video sumber.")
        run(folder, [sys.executable, "-m", "yt_dlp", "--ignore-config", "--no-playlist",
                     "--socket-timeout", "30", "--max-filesize", "750M", "--match-filter",
                     "!is_live & duration <= 1200", "-f", "bv[height<=720]+ba/b[height<=720]",
                     "--merge-output-format", "mkv", "-o", "source.%(ext)s", "--", job["url"]])
        source = next(p for p in folder.glob("source.*") if p.suffix in {".mkv", ".mp4", ".webm"})
        if source.stat().st_size > 750 * 1024 * 1024:
            raise ValueError("Ukuran video melebihi 750 MB.")
        change(job, "transcribe", "Whisper membuat transkrip.")
        shutil.copyfile(MODEL, folder / "model.bin")
        try:
            run(folder, ["ffmpeg", "-nostdin", "-i", source.name, "-vn", "-af",
                         "whisper=model=model.bin:language=auto:queue=15:destination=transcript.srt:format=srt",
                         "-f", "null", "-"])
        finally:
            (folder / "model.bin").unlink(missing_ok=True)
        segments = parse_srt(folder / "transcript.srt")
        change(job, "review", "Strategist memilih klip dan reviewer mengecek transkrip.")
        clip, title = choose_clip(segments)
        change(job, "render", "Merender dan menjalankan review teknis.")
        render(folder, source, segments, clip)
        job["clip_title"] = title
        job["clip_ready"] = True
        if TOKEN.is_file():
            change(job, "upload", "Mengunggah ke channel YouTube yang terhubung.")
            job["youtube_id"] = upload(folder / "clip.mp4", title)
            change(job, "completed", "YouTube menerima upload.")
        else:
            change(job, "rendered", "Klip siap. Hubungkan OAuth YouTube untuk upload otomatis.")
    except Exception as error:
        logging.getLogger(__name__).warning("Production job %s failed (%s)", job["id"], type(error).__name__)
        if job["status"] == "upload":
            message = "YouTube gagal mengonfirmasi upload. Cek YouTube Studio sebelum mengulang."
        elif isinstance(error, ValueError):
            message = str(error)
        else:
            message = f"Tahap {job['status']} gagal. Periksa dependensi dan koneksi worker."
        change(job, "failed", message)
    finally:
        LOCK.release()


@router.get("/jobs")
def list_jobs():
    return {
        "jobs": read_jobs(),
        "youtube_configured": TOKEN.is_file(),
        "tiktok_configured": bool(os.getenv("OFFICE_TIKTOK_ACCESS_TOKEN")),
        "whisper_configured": MODEL.is_file(),
        "ffmpeg_available": bool(shutil.which("ffmpeg") and shutil.which("ffprobe")),
        "ollama_model": ollama_model(),
        "ollama_ready": ollama_ready(),
    }


@router.get("/jobs/{job_id}/clip")
def get_clip(job_id: str):
    if not re.fullmatch(r"[0-9a-f]{32}", job_id):
        raise HTTPException(404, "Klip tidak ditemukan.")
    folder = JOBS / job_id
    try:
        ready = json.loads((folder / "job.json").read_text(encoding="utf-8")).get("clip_ready")
    except (OSError, ValueError):
        ready = False
    if not ready or not (folder / "clip.mp4").is_file():
        raise HTTPException(404, "Klip belum tersedia.")
    return FileResponse(folder / "clip.mp4", media_type="video/mp4")



@router.post("/jobs/{job_id}/tiktok")
def send_tiktok_draft(job_id: str):
    if not os.getenv("OFFICE_TIKTOK_ACCESS_TOKEN"):
        raise HTTPException(503, "Token TikTok belum dikonfigurasi di worker.")
    if not re.fullmatch(r"[0-9a-f]{32}", job_id):
        raise HTTPException(404, "Klip tidak ditemukan.")
    if not LOCK.acquire(blocking=False):
        raise HTTPException(409, "Worker sedang memproses tugas lain.")
    try:
        folder = JOBS / job_id
        path = folder / "clip.mp4"
        try:
            job = json.loads((folder / "job.json").read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            raise HTTPException(404, "Klip tidak ditemukan.") from error
        if not job.get("clip_ready") or not path.is_file():
            raise HTTPException(404, "Klip belum tersedia.")
        if job.get("tiktok_publish_id"):
            return {"publish_id": job["tiktok_publish_id"]}
        try:
            publish_id = upload_draft(path)
        except ValueError as error:
            raise HTTPException(502, str(error)) from error
        except (OSError, KeyError) as error:
            raise HTTPException(502, "TikTok gagal mengonfirmasi upload. Cek inbox TikTok sebelum mengulang.") from error
        job["tiktok_publish_id"] = publish_id
        change(job, job["status"], job["message"])
        return {"publish_id": publish_id}
    finally:
        LOCK.release()

@router.post("/jobs", status_code=202)
def start(payload: ProductionRequest):
    try:
        identifier = video_id(payload.url)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    if not MODEL.is_file() or not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise HTTPException(503, "Siapkan FFmpeg, FFprobe, dan worker/models/ggml-base.bin.")
    if not ollama_ready():
        raise HTTPException(503, f"Jalankan Ollama dan siapkan model {ollama_model()}.")
    if not LOCK.acquire(blocking=False):
        raise HTTPException(409, "Satu video sedang diproses. Coba lagi setelah selesai.")
    try:
        url = f"https://www.youtube.com/watch?v={identifier}"
        if any(job["url"] == url and (job.get("youtube_id") or job["status"] == "failed"
                                     and job.get("clip_ready") and not job.get("youtube_id"))
               for job in read_jobs()):
            raise HTTPException(409, "Sumber ini sudah punya riwayat upload. Cek hasil sebelumnya.")
        job = {"id": uuid4().hex, "url": url, "created": datetime.now(timezone.utc).isoformat()}
        (JOBS / job["id"]).mkdir(parents=True)
        change(job, "queued", "Video masuk antrean.")
        accepted = job.copy()
        Thread(target=process, args=(job,), daemon=True).start()
        return accepted
    except Exception:
        LOCK.release()
        raise
