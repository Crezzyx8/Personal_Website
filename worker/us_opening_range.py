import json
import math
from urllib.error import URLError

from vendor.day_trader_skill import entry

STATUS = {
    "waiting": "Menunggu breakout",
    "triggered": "Breakout tercatat",
    "expired": "Jendela entry berakhir",
    "no-data": "Sesi tutup atau data belum tersedia",
}


def opening_range(symbol, read_json):
    """Evaluate today's US opening-range breakout using the upstream engine."""
    now = entry.utc_now()
    local_date = entry.to_eastern(now).date()
    result = {"session": local_date.isoformat(), "interval": "5 menit",
              "engine": "Day Trader Skill", "status": STATUS["no-data"]}
    if local_date.year not in entry.CALENDAR_YEARS:
        return {**result, "status": "Kalender bursa perlu diperbarui"}
    trading, _ = entry.trading_day(local_date)
    if not trading:
        return result
    try:
        raw = read_json("https://query1.finance.yahoo.com" +
                        entry.chart_path(symbol, "1d", "5m"))
        chart = entry.parse_chart(json.dumps(raw), symbol)
        meta = chart["meta"]
        if (chart["symbol"] != entry.yahoo_symbol(symbol)
                or meta.get("dataGranularity") != "5m"
                or meta.get("exchangeTimezoneName") != "America/New_York"
                or meta.get("instrumentType") not in {"EQUITY", "ETF"}):
            return {**result, "status": "Feed intraday saham AS tidak tersedia"}
        scan = entry.evaluate(chart, now)
    except (entry.EntryError, URLError, TimeoutError, ValueError, KeyError, TypeError, OverflowError):
        return {**result, "status": "Feed intraday sedang tidak tersedia"}

    result["status"] = STATUS[scan["status"]]
    opening = scan["opening_range"]
    if not opening or opening["bars"] != opening["of"] or not opening["complete"]:
        return result
    if scan["status"] not in {"waiting", "triggered"}:
        return result
    high, low = opening["high"], opening["low"]
    if not (math.isfinite(high) and math.isfinite(low) and 0 < low < high):
        return result
    result.update(entry=high, sl=(high + low) / 2, tp=high + (high - low))
    if scan["trigger"]:
        result["trigger"] = {"time": scan["trigger"]["close_time"],
                             "close": scan["trigger"]["price"]}
    return result
