import os
from contextlib import asynccontextmanager
from pathlib import Path
from secrets import compare_digest

from fastapi import Depends, FastAPI, HTTPException, Request, Security
from fastapi.responses import FileResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles

from digital_products import router as products_router
from market import router as market_router
from production import recover_interrupted, router as production_router

DIST = Path(__file__).resolve().parents[1] / "dist"
WEB_MODE = os.getenv("OFFICE_SERVE_WEB") == "1"
PASSWORD = os.getenv("OFFICE_WEB_PASSWORD", "")
basic = HTTPBasic(realm="Filbert AI Office")


@asynccontextmanager
async def lifespan(_app):
    if WEB_MODE:
        if len(PASSWORD) < 16 or not PASSWORD.isascii():
            raise RuntimeError("Set OFFICE_WEB_PASSWORD ke kata sandi ASCII minimal 16 karakter.")
        if not (DIST / "index.html").is_file():
            raise RuntimeError("Jalankan npm run build sebelum menyalakan mode web.")
    recover_interrupted()
    yield


def owner_only(request: Request, credentials: HTTPBasicCredentials = Security(basic)):
    is_owner = compare_digest(credentials.username.encode(), b"filbert")
    is_password = compare_digest(credentials.password.encode(), PASSWORD.encode())
    if not (is_owner and is_password):
        raise HTTPException(401, "Login AI Office diperlukan.",
                            headers={"WWW-Authenticate": 'Basic realm="Filbert AI Office"'})
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        site = request.headers.get("sec-fetch-site")
        if site is not None and site != "same-origin":
            raise HTTPException(403, "Buka dashboard dari alamat website yang sama.")


app = FastAPI(title="Filbert AI Office", lifespan=lifespan,
              docs_url=None if WEB_MODE else "/docs",
              redoc_url=None if WEB_MODE else "/redoc",
              openapi_url=None if WEB_MODE else "/openapi.json")
dependencies = [Depends(owner_only)] if WEB_MODE else []
for router in (market_router, production_router, products_router):
    app.include_router(router, prefix="/office-api", dependencies=dependencies)
    if not WEB_MODE:
        app.include_router(router)


if WEB_MODE:
    def site_page():
        return FileResponse(DIST / "index.html", headers={"Cache-Control": "no-cache"})

    def private_page():
        return FileResponse(DIST / "index.html", headers={"Cache-Control": "private, no-store"})

    app.add_api_route("/", site_page, include_in_schema=False)
    app.add_api_route("/games", site_page, include_in_schema=False)
    app.add_api_route("/ai-office", private_page, dependencies=dependencies, include_in_schema=False)
    app.mount("/", StaticFiles(directory=DIST, check_dir=False), name="site-assets")
