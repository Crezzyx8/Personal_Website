from contextlib import asynccontextmanager

from fastapi import FastAPI

from digital_products import router as products_router
from market import router as market_router
from production import recover_interrupted, router as production_router


@asynccontextmanager
async def lifespan(_app):
    recover_interrupted()
    yield


app = FastAPI(title="Filbert AI Office", lifespan=lifespan)
app.include_router(market_router)
app.include_router(production_router)
app.include_router(products_router)
