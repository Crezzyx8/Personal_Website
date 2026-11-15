@echo off
setlocal
cd /d "%~dp0"

if not exist "worker\.venv\Scripts\python.exe" (
    echo Python worker belum ditemukan.
    echo Pastikan folder worker dan virtual environment sudah dibuat.
    pause
    exit /b 1
)

if not exist "worker\app.py" (
    echo File worker\app.py belum ditemukan.
    pause
    exit /b 1
)

where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo Node.js atau npm belum terdeteksi.
    pause
    exit /b 1
)

where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo FFmpeg belum terdeteksi.
    echo Tutup dan buka lagi aplikasi setelah instalasi FFmpeg.
    pause
    exit /b 1
)

where ffprobe >nul 2>&1
if errorlevel 1 (
    echo FFprobe belum terdeteksi.
    pause
    exit /b 1
)

echo Menyalakan worker lokal...
start "Filbert Office - Worker" cmd /k ""%~dp0worker\.venv\Scripts\python.exe" -m uvicorn app:app --app-dir worker --host 127.0.0.1 --port 8765"

echo Menyalakan dashboard...
start "Filbert Office - Website" cmd /k "npm.cmd run dev -- --open /ai-office"

endlocal