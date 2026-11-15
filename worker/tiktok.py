import json
import os
from urllib.request import Request, urlopen

MAX_SINGLE_CHUNK = 64 * 1024 * 1024


def upload_draft(path):
    token = os.environ["OFFICE_TIKTOK_ACCESS_TOKEN"]
    size = path.stat().st_size
    if not 0 < size <= MAX_SINGLE_CHUNK:
        raise ValueError("Ukuran klip untuk draft TikTok harus paling banyak 64 MB.")
    payload = {
        "source_info": {
            "source": "FILE_UPLOAD",
            "video_size": size,
            "chunk_size": size,
            "total_chunk_count": 1,
        }
    }
    request = Request(
        "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
        json.dumps(payload).encode(),
        {"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"},
    )
    with urlopen(request, timeout=25) as response:
        result = json.load(response)
    if result["error"]["code"] != "ok":
        raise ValueError("TikTok menolak permintaan. Cek token dan scope video.upload.")
    draft = result["data"]
    request = Request(
        draft["upload_url"],
        path.read_bytes(),
        {
            "Content-Type": "video/mp4",
            "Content-Length": str(size),
            "Content-Range": f"bytes 0-{size - 1}/{size}",
        },
        method="PUT",
    )
    with urlopen(request, timeout=120) as response:
        if response.status != 201:
            raise ValueError("TikTok belum mengonfirmasi penerimaan file.")
    return draft["publish_id"]
