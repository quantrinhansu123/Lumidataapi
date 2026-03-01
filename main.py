"""
Orders API - Query orders from Subabase with GET params.
Example: GET /orders?created_at=22/12/2026&city=Carson
"""
import os
from datetime import datetime
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://gsjhsmxyxjyiqovauyrp.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_vXBSa3eP8cvjIK2qLWI6Ug_FoYm4CNy")

# Client dùng chung, tránh tạo mới mỗi request
_supabase: Optional[Client] = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase


app = FastAPI(title="Orders API", description="Query orders from Subabase by GET params")

# Cột date (type date trong DB) - dùng eq với yyyy-mm-dd
DATE_COLUMNS = {
    "order_date",
    "postponed_date",
    "accounting_check_date",
    "estimated_delivery_date",
}

# Cột timestamp - filter theo ngày (gte 00:00, lte 23:59:59)
TIMESTAMP_COLUMNS = {
    "created_at",
    "updated_at",
    "order_time",
    "time_dayon",
}

# Tất cả cột text/khác có thể filter exact
ALL_ORDER_COLUMNS = {
    "id", "order_code", "order_date", "customer_name", "customer_phone", "customer_address",
    "city", "state", "zipcode", "country", "product", "total_amount_vnd", "payment_method",
    "tracking_code", "shipping_fee", "marketing_staff", "sale_staff", "team", "delivery_status",
    "payment_status", "note", "created_at", "updated_at", "cskh", "delivery_staff", "goods_amount",
    "reconciled_amount", "general_fee", "flight_fee", "account_rental_fee", "cutoff_time",
    "shipping_unit", "accountant_confirm", "payment_status_detail", "reason", "order_time",
    "area", "product_main", "product_name_1", "quantity_1", "product_name_2", "quantity_2",
    "gift", "gift_quantity", "sale_price", "payment_type", "exchange_rate", "total_vnd",
    "payment_method_text", "shipping_cost", "base_price", "reconciled_vnd", "creator_name",
    "check_result", "delivery_status_nb", "carrier", "postponed_date", "shift", "cskh_status",
    "feedback_pos", "feedback_neg", "customer_type", "blacklist_status", "note_sale", "note_ffm",
    "note_delivery", "created_by", "page_name", "vandon_note", "item_name_1", "item_qty_1",
    "item_name_2", "item_qty_2", "gift_item", "gift_qty", "payment_currency",
    "estimated_delivery_date", "warehouse_fee", "note_caps", "accounting_check_date",
    "last_modified_by", "time_dayon",
}

# Cột trả về từ API và label tương ứng
SELECT_COLUMNS = "id, marketing_staff, sale_staff, created_at, total_vnd"
RESPONSE_LABELS = {"id": "id", "marketing_staff": "nhanvien_maketing", "sale_staff": "nhanvien_sale", "created_at": "ngaytao", "total_vnd": "tongtien"}


def parse_date_param(value: str) -> Optional[tuple[str, str]]:
    """Parse dd/mm/yyyy hoặc d/m/yyyy -> (yyyy-mm-dd 00:00:00, yyyy-mm-dd 23:59:59)."""
    value = value.strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            d = datetime.strptime(value, fmt)
            day_start = d.strftime("%Y-%m-%d") + "T00:00:00"
            day_end = d.strftime("%Y-%m-%d") + "T23:59:59.999999"
            return (day_start, day_end)
        except ValueError:
            continue
    return None


def parse_date_only(value: str) -> Optional[str]:
    """Parse dd/mm/yyyy -> yyyy-mm-dd cho cột type date."""
    value = value.strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            d = datetime.strptime(value, fmt)
            return d.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


@app.get("/orders")
async def get_orders(
    request: Request,
    limit: int = Query(100, ge=1, le=1000, description="Số bản ghi tối đa"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    after_id: Optional[str] = Query(None, description="Cursor: id bản ghi cuối trang trước (trang sau = after_id này)"),
) -> Any:
    """
    Lấy danh sách orders với bộ lọc theo query params.
    Phân trang: dùng after_id (cursor) để tránh trùng/thiếu. Trang 1 không truyền after_id;
    trang sau truyền after_id=id của bản ghi cuối trong trang trước.
    Ví dụ: /orders?city=Ewa%20Beach&limit=2 rồi /orders?city=Ewa%20Beach&limit=2&after_id=<id_cuoi_trang_1>
    """
    supabase = get_supabase()
    q = supabase.table("orders").select(SELECT_COLUMNS)

    params = dict(request.query_params)
    params.pop("limit", None)
    params.pop("offset", None)
    params.pop("after_id", None)

    for col, val in params.items():
        if col not in ALL_ORDER_COLUMNS or not val:
            continue
        if col in TIMESTAMP_COLUMNS:
            parsed = parse_date_param(val)
            if parsed:
                day_start, day_end = parsed
                q = q.gte(col, day_start).lte(col, day_end)
        elif col in DATE_COLUMNS:
            date_str = parse_date_only(val)
            if date_str:
                q = q.eq(col, date_str)
        else:
            q = q.eq(col, val.strip())

    # PostgREST/Supabase không đảm bảo thứ tự → luôn lấy tối đa 1000 bản ghi (offset=0),
    # sắp xếp theo id trong Python rồi cắt [offset:offset+limit].
    if after_id:
        q = q.gt("id", after_id.strip()).order("id", desc=False).limit(limit)
        fetch_all_then_slice = False
    else:
        q = q.limit(1000).offset(0)
        fetch_all_then_slice = True

    try:
        result = q.execute()
        raw = result.data
        if fetch_all_then_slice:
            raw = sorted(raw, key=lambda r: (r.get("id") or ""))
            start = offset * limit  # offset = số trang (0=trang đầu, 1=trang 2, ...)
            raw = raw[start : start + limit] if start < len(raw) else []
        data = [
            {RESPONSE_LABELS[k]: v for k, v in row.items() if k in RESPONSE_LABELS}
            for row in raw
        ]
        last_id = data[-1]["id"] if data else None
        return JSONResponse(
            content={"data": data, "count": len(data), "next_after_id": last_id},
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "data": []},
            status_code=500,
        )


@app.get("/")
def root():
    return {"message": "Orders API", "docs": "/docs", "orders": "GET /orders?created_at=22/12/2026&city=Carson"}
