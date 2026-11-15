import json
import math
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
app = FastAPI(title="Filbert AI Office Worker")
from ai_agents import router as agents_router
app.include_router(agents_router)
from youtube_worker import router as youtube_router

app.include_router(youtube_router)
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 1024 * 1024 * 1024  # 1 GB
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".mkv", ".webm"}


def read_task(task_id: str):
    try:
        if uuid4_format(task_id) is False:
            raise HTTPException(404, "Task tidak ditemukan.")

        task_path = DATA_DIR / task_id / "task.json"

        if not task_path.is_file():
            raise HTTPException(404, "Task tidak ditemukan.")

        return json.loads(task_path.read_text(encoding="utf-8"))

    except (json.JSONDecodeError, OSError):
        raise HTTPException(500, "Data task tidak bisa dibaca.")


def uuid4_format(value: str):
    return len(value) == 32 and all(
        character in "0123456789abcdef"
        for character in value
    )


def inspect_video(video_path: Path):
    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        str(video_path),
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=45,
            check=False,
        )
    except FileNotFoundError:
        raise HTTPException(503, "ffprobe belum terdeteksi oleh worker.")
    except subprocess.TimeoutExpired:
        raise HTTPException(422, "Pemeriksaan video terlalu lama.")

    if result.returncode != 0:
        raise HTTPException(
            422,
            "Video tidak bisa dibaca. Periksa apakah file rusak.",
        )

    try:
        metadata = json.loads(result.stdout)

        video_stream = next(
            (
                stream
                for stream in metadata.get("streams", [])
                if stream.get("codec_type") == "video"
                and not stream.get("disposition", {}).get("attached_pic")
            ),
            None,
        )

        if video_stream is None:
            raise ValueError("Tidak ada stream video.")

        duration = float(
            metadata.get("format", {}).get("duration")
            or video_stream.get("duration")
            or 0
        )

        if not math.isfinite(duration) or duration <= 0:
            raise ValueError("Durasi tidak valid.")

        return {
            "duration": round(duration, 2),
            "width": int(video_stream.get("width", 0)),
            "height": int(video_stream.get("height", 0)),
            "hasAudio": any(
                stream.get("codec_type") == "audio"
                for stream in metadata.get("streams", [])
            ),
        }

    except (ValueError, TypeError, KeyError):
        raise HTTPException(422, "Metadata video tidak valid.")


@app.get("/health")
def health():
    ffmpeg_ready = shutil.which("ffmpeg") is not None
    ffprobe_ready = shutil.which("ffprobe") is not None

    return {
        "status": "online",
        "ready": ffmpeg_ready and ffprobe_ready,
        "ffmpeg": ffmpeg_ready,
        "ffprobe": ffprobe_ready,
        "capabilities": {
            "upload": ffprobe_ready,
            "transcription": False,
            "render": False,
            "publishing": False,
        },
    }


@app.get("/tasks")
def list_tasks():
    tasks = []

    for task_path in DATA_DIR.glob("*/task.json"):
        try:
            task = json.loads(task_path.read_text(encoding="utf-8"))
            tasks.append(task)
        except (OSError, json.JSONDecodeError):
            continue

    return {
        "tasks": sorted(
            tasks,
            key=lambda task: task.get("createdAt", ""),
            reverse=True,
        )
    }


@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    return read_task(task_id)


@app.post("/tasks", status_code=201)
def create_task(
    file: Annotated[UploadFile, File()],
    title: Annotated[str, Form(min_length=1, max_length=120)],
    brief: Annotated[str, Form(max_length=3000)] = "",
    clip_count: Annotated[int, Form(ge=1, le=5)] = 3,
    duration: Annotated[int, Form(ge=15, le=180)] = 45,
):
    if not title.strip():
        raise HTTPException(400, "Nama pekerjaan wajib diisi.")

    if not shutil.which("ffprobe"):
        raise HTTPException(503, "ffprobe belum terdeteksi oleh worker.")

    original_name = (file.filename or "video").replace("\\", "/")
    original_name = original_name.rsplit("/", 1)[-1]

    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            "Gunakan video MP4, MOV, MKV, atau WEBM.",
        )

    task_id = uuid4().hex
    task_dir = DATA_DIR / task_id
    task_dir.mkdir()

    video_path = task_dir / f"source{extension}"
    total_size = 0

    try:
        with video_path.open("wb") as output:
            while chunk := file.file.read(1024 * 1024):
                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        413,
                        "Ukuran video maksimal 1 GB.",
                    )

                output.write(chunk)

        if total_size == 0:
            raise HTTPException(400, "File video kosong.")

        video_info = inspect_video(video_path)

        task = {
            "id": task_id,
            "title": title.strip(),
            "brief": brief.strip(),
            "clipCount": clip_count,
            "duration": duration,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "status": "uploaded",
            "message": (
                "Video sudah tersimpan di worker. "
                "Transkripsi dan render belum dijalankan."
            ),
            "file": {
                "name": original_name,
                "size": total_size,
                "type": file.content_type,
            },
            "video": video_info,
        }

        temporary_path = task_dir / "task.json.tmp"
        temporary_path.write_text(
            json.dumps(task, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary_path.replace(task_dir / "task.json")

        return task

    except HTTPException:
        shutil.rmtree(task_dir, ignore_errors=True)
        raise

    except OSError:
        shutil.rmtree(task_dir, ignore_errors=True)
        raise HTTPException(
            500,
            "Gagal menyimpan video. Periksa ruang penyimpanan.",
        )

    finally:
        file.file.close()