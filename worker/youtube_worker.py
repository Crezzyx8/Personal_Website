import json
import math
import re
import shutil
import subprocess
import sys
import threading
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)

MAX_SIZE = 1024 * 1024 * 1024
download_lock = threading.Lock()


class YouTubeTask(BaseModel):
    url: str = Field(min_length=1, max_length=2000)
    title: str = Field(default="", max_length=120)
    brief: str = Field(default="", max_length=3000)
    clip_count: int = Field(default=3, ge=1, le=5)
    duration: int = Field(default=45, ge=15, le=180)


def normalize_url(value: str):
    parsed = urlparse(value.strip())

    if parsed.scheme != "https" or parsed.username or parsed.password:
        raise HTTPException(400, "Gunakan link HTTPS YouTube yang valid.")

    try:
        if parsed.port not in (None, 443):
            raise HTTPException(400, "Port URL tidak didukung.")
    except ValueError:
        raise HTTPException(400, "URL tidak valid.")

    host = (parsed.hostname or "").lower()
    video_id = None

    if host == "youtu.be":
        video_id = parsed.path.strip("/").split("/")[0]

    elif host in {
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
    }:
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [None])[0]
        else:
            parts = parsed.path.strip("/").split("/")

            if len(parts) == 2 and parts[0] in {"shorts", "live", "embed"}:
                video_id = parts[1]

    if not video_id or not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise HTTPException(
            400,
            "Masukkan link satu video YouTube, bukan channel atau playlist.",
        )

    return f"https://www.youtube.com/watch?v={video_id}"


def save_task(task):
    folder = DATA_DIR / task["id"]
    temporary = folder / "task.json.tmp"

    temporary.write_text(
        json.dumps(task, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    temporary.replace(folder / "task.json")


def inspect_video(path):
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_format",
            "-show_streams",
            "-of", "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
        check=False,
    )

    if result.returncode != 0:
        raise ValueError("Hasil download tidak bisa dibaca sebagai video.")

    metadata = json.loads(result.stdout)

    stream = next(
        (
            item
            for item in metadata.get("streams", [])
            if item.get("codec_type") == "video"
            and not item.get("disposition", {}).get("attached_pic")
        ),
        None,
    )

    if stream is None:
        raise ValueError("Hasil download tidak memiliki video.")

    duration = float(
        metadata.get("format", {}).get("duration")
        or stream.get("duration")
        or 0
    )

    if not math.isfinite(duration) or duration <= 0:
        raise ValueError("Durasi video tidak valid.")

    if duration > 7200:
        raise ValueError("Untuk versi awal, durasi sumber maksimal 2 jam.")

    return {
        "duration": round(duration, 2),
        "width": int(stream.get("width", 0)),
        "height": int(stream.get("height", 0)),
        "hasAudio": any(
            item.get("codec_type") == "audio"
            for item in metadata.get("streams", [])
        ),
    }


def download_video(task):
    folder = DATA_DIR / task["id"]

    try:
        task["status"] = "downloading"
        task["message"] = "Mengambil video dari YouTube."
        save_task(task)

        command = [
            sys.executable,
            "-m", "yt_dlp",
            "--ignore-config",
            "--no-playlist",
            "--no-progress",
            "--no-colors",
            "--quiet",
            "--no-warnings",
            "--socket-timeout", "30",
            "--retries", "2",
            "--fragment-retries", "2",
            "--max-filesize", "1G",
            "--match-filter", "!is_live & duration <= 7200",
            "--format",
            "bv[height<=720]+ba/b[height<=720]",
            "--merge-output-format", "mkv",
            "--output", str(folder / "source.%(ext)s"),
        ]

        # Gunakan Node yang sudah terpasang bersama lingkungan frontend.
        if shutil.which("node"):
            command.extend(["--js-runtimes", "node"])

        command.extend(["--", task["sourceUrl"]])

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=1800,
            check=False,
        )

        if result.returncode != 0:
            # Detail teknis hanya ditampilkan di terminal lokal.
            print(
                f"Download gagal untuk task {task['id']}:\n"
                f"{result.stderr[-2500:]}",
                flush=True,
            )

            raise ValueError(
                "Download gagal. Lihat terminal worker untuk detail. "
                "Video mungkin dibatasi, tidak tersedia, atau "
                "YouTube meminta autentikasi."
            )

        candidates = [
            path
            for path in folder.glob("source.*")
            if path.suffix.lower() in {".mp4", ".mkv", ".webm", ".mov"}
        ]

        if len(candidates) != 1:
            raise ValueError(
                "Tidak ada satu video final yang valid. "
                "Live stream dan sumber lebih dari 2 jam tidak didukung."
            )

        video_path = candidates[0]

        if video_path.stat().st_size > MAX_SIZE:
            raise ValueError("Ukuran video final melebihi batas 1 GB.")

        task["status"] = "inspecting"
        task["message"] = "Download selesai. Memeriksa metadata video."
        save_task(task)

        task["video"] = inspect_video(video_path)
        task["file"] = {
            "name": video_path.name,
            "size": video_path.stat().st_size,
            "type": "video/x-matroska",
        }

        task["status"] = "downloaded"
        task["message"] = (
            "Video sudah tersimpan. Transkripsi, clipping, "
            "review AI, dan publishing belum dijalankan."
        )
        save_task(task)

    except Exception as error:
        # Hapus hanya file sumber/parsial milik task yang gagal.
        for path in folder.glob("source.*"):
            if path.is_file():
                path.unlink(missing_ok=True)

        task["status"] = "failed"
        task["message"] = str(error)[:700]
        save_task(task)

    finally:
        download_lock.release()


@router.post("/youtube/tasks", status_code=202)
def create_youtube_task(request: YouTubeTask):
    source_url = normalize_url(request.url)

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise HTTPException(
            503,
            "FFmpeg atau ffprobe belum terdeteksi oleh worker.",
        )

    if not download_lock.acquire(blocking=False):
        raise HTTPException(
            409,
            "Masih ada download berjalan. Tunggu hingga selesai.",
        )

    folder = DATA_DIR / uuid4().hex

    try:
        folder.mkdir()

        task = {
            "id": folder.name,
            "title": request.title.strip() or "Video YouTube",
            "brief": request.brief.strip(),
            "clipCount": request.clip_count,
            "duration": request.duration,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "sourceType": "youtube",
            "sourceUrl": source_url,
            "status": "queued",
            "message": "Permintaan diterima. Menunggu proses download.",
            "file": {
                "name": "Menunggu download",
                "size": 0,
                "type": "",
            },
            "video": None,
        }

        save_task(task)

        # Salinan respons agar thread tidak mengubah objek respons.
        response = dict(task)

        thread = threading.Thread(
            target=download_video,
            args=(task,),
            daemon=True,
        )
        thread.start()

        return response

    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        download_lock.release()
        raise


# Tandai pekerjaan terputus ketika worker dinyalakan ulang.
for task_file in DATA_DIR.glob("*/task.json"):
    try:
        saved_task = json.loads(task_file.read_text(encoding="utf-8"))

        if (
            saved_task.get("sourceType") == "youtube"
            and saved_task.get("status")
            in {"queued", "downloading", "inspecting"}
        ):
            saved_task["status"] = "interrupted"
            saved_task["message"] = (
                "Worker berhenti sebelum download selesai. "
                "Buat task baru untuk mencoba kembali."
            )
            save_task(saved_task)

    except (OSError, ValueError, KeyError):
        continue