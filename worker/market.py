import json
import math
import re
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal

from us_opening_range import opening_range

router = APIRouter(prefix="/market")
ALIASES = {"BITCOIN": "BTC", "ETHEREUM": "ETH", "SOLANA": "SOL",
           "APPLE": "AAPL", "TESLA": "TSLA", "NVIDIA": "NVDA",
           "BANK CENTRAL ASIA": "BBCA"}


class AnalysisRequest(BaseModel):
    market: Literal["gate", "us", "idx"]
    symbol: str = Field(min_length=1, max_length=40)


def read_json(url):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    with urlopen(request, timeout=12) as response:
        return json.loads(response.read(2_000_000))


def get_candles(market, symbol):
    if market == "gate":
        query = urlencode({"contract": symbol, "interval": "1h", "limit": 100})
        rows = read_json("https://api.gateio.ws/api/v4/futures/usdt/candlesticks?" + query)
        return [(row["t"] + 3600, row["h"], row["l"], row["c"]) for row in rows
                if row["t"] + 3600 <= time.time()]
    url = "https://query1.finance.yahoo.com/v8/finance/chart/" + quote(symbol, safe="")
    chart = read_json(url + "?range=6mo&interval=1d")["chart"]["result"][0]
    bars = chart["indicators"]["quote"][0]
    current_session = chart["meta"]["currentTradingPeriod"]["regular"]
    return [(stamp, high, low, close)
            for stamp, high, low, close in zip(chart["timestamp"], bars["high"], bars["low"], bars["close"])
            if None not in (high, low, close)
            and (stamp < current_session["start"] or time.time() >= current_session["end"])]


def build_setup(candles, allow_short):
    bars = sorted({int(stamp): (float(high), float(low), float(close))
                   for stamp, high, low, close in candles}.items())
    if len(bars) < 21:
        raise ValueError("Butuh minimal 21 candle yang sudah tutup.")
    values = [values for _, values in bars[-21:]]
    if any(not all(math.isfinite(v) for v in (high, low, close))
           or not 0 < low <= close <= high for high, low, close in values):
        raise ValueError("Data candle tidak valid.")
    high = max(row[0] for row in values)
    low = min(row[1] for row in values)
    close = values[-1][2]
    ranges = [max(h - l, abs(h - previous[2]), abs(l - previous[2]))
              for previous, (h, l, _) in zip(values[-15:-1], values[-14:])]
    atr = sum(ranges) / len(ranges)
    if not 0 < atr < low / 3:
        raise ValueError("Rentang harga tidak memenuhi aturan setup.")
    long = {"side": "LONG", "entry": high, "sl": high - atr, "tp": high + 2 * atr}
    setups = [long]
    if allow_short:
        setups.append({"side": "SHORT", "entry": low, "sl": low + atr, "tp": low - 2 * atr})
    return bars[-1][0], close, setups


@router.post("/analyze")
def analyze(payload: AnalysisRequest):
    symbol = payload.symbol.strip().upper()
    symbol = ALIASES.get(symbol, symbol).replace("/", "_")
    if not re.fullmatch(r"[A-Z0-9][A-Z0-9._-]{0,19}", symbol):
        raise HTTPException(422, "Masukkan ticker, misalnya BTC, NVDA, atau BBCA.")
    if payload.market == "gate" and "_" not in symbol:
        symbol += "_USDT"
    if payload.market == "gate" and not re.fullmatch(r"[A-Z0-9]+_USDT", symbol):
        raise HTTPException(422, "Pilih kontrak futures USDT, misalnya BTC_USDT.")
    if payload.market == "idx" and not symbol.endswith(".JK"):
        symbol += ".JK"
    if payload.market == "us" and not re.fullmatch(r"[A-Z]{1,6}(?:[.-][A-Z])?", symbol):
        raise HTTPException(422, "Gunakan ticker saham AS seperti NVDA atau BRK.B.")
    try:
        candles = get_candles(payload.market, symbol)
        timestamp, close, setups = build_setup(candles, payload.market == "gate")
    except HTTPError as error:
        if error.code in (400, 404):
            raise HTTPException(404, "Ticker tidak ditemukan pada pasar ini.") from error
        raise HTTPException(502, "Penyedia data pasar sedang membatasi atau menolak permintaan.") from error
    except (URLError, TimeoutError, TypeError, KeyError, IndexError, ValueError) as error:
        raise HTTPException(502, "Data candle belum cukup atau gagal dibaca.") from error
    gate = payload.market == "gate"
    if time.time() - timestamp > (7200 if gate else 7 * 86400):
        raise HTTPException(422, "Candle terakhir terlalu lama untuk membuat setup.")
    result = {"symbol": symbol, "source": "Gate USDT Perpetual" if gate else "Yahoo Finance",
            "interval": "1 jam" if gate else "Harian", "timestamp": timestamp,
            "close": close, "setups": setups}
    if payload.market == "us":
        result["opening_range"] = opening_range(symbol, read_json)
    return result
