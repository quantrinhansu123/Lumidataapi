"""
Orders API - Query orders from Subabase with GET params.
Example: GET /orders?created_at=22/12/2026&city=Carson
"""
import os
from datetime import datetime
from typing import Any, Optional, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request, Body
from fastapi.responses import JSONResponse
from supabase import create_client, Client
from pydantic import BaseModel

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


class FilterRequest(BaseModel):
    """Model cho bộ lọc từ FE"""
    filters: Dict[str, Any] = {}
    date_range: Optional[Dict[str, str]] = None  # {"from": "01/03/2026", "to": "31/03/2026"}
    date_column: str = "created_at"  # Cột date để filter

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
SELECT_COLUMNS = "id, marketing_staff, sale_staff, created_at, total_vnd, order_date, country, product, total_amount_vnd, tracking_code, team, delivery_status, payment_status, delivery_staff, check_result, shift"
RESPONSE_LABELS = {
    "id": "id",
    "marketing_staff": "nhanvien_maketing",
    "sale_staff": "nhanvien_sale",
    "created_at": "ngaytao",
    "total_vnd": "tongtien",
    "order_date": "order_date",
    "country": "country",
    "product": "product",
    "total_amount_vnd": "total_amount_vnd",
    "tracking_code": "tracking_code",
    "team": "team",
    "delivery_status": "delivery_status",
    "payment_status": "payment_status",
    "delivery_staff": "delivery_staff",
    "check_result": "check_result",
    "shift": "shift"
}


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


def apply_filters_to_query(query, filters: dict):
    """Áp dụng bộ lọc vào query Supabase."""
    for col, val in filters.items():
        if col not in ALL_ORDER_COLUMNS or not val:
            continue
        
        # Xử lý mảng (OR condition) - ví dụ: team=["Team A", "Team B"]
        if isinstance(val, list):
            if len(val) > 0:
                # Tạo OR condition: team.eq("Team A").or_("team.eq(Team B)")
                or_conditions = []
                for item in val:
                    if col in TIMESTAMP_COLUMNS:
                        parsed = parse_date_param(str(item))
                        if parsed:
                            day_start, day_end = parsed
                            or_conditions.append(f"{col}.gte.{day_start},{col}.lte.{day_end}")
                    elif col in DATE_COLUMNS:
                        date_str = parse_date_only(str(item))
                        if date_str:
                            or_conditions.append(f"{col}.eq.{date_str}")
                    else:
                        or_conditions.append(f"{col}.eq.{item}")
                if or_conditions:
                    # Supabase PostgREST: dùng .in_() cho array
                    query = query.in_(col, val)
        # Xử lý giá trị đơn
        elif col in TIMESTAMP_COLUMNS:
            parsed = parse_date_param(str(val))
            if parsed:
                day_start, day_end = parsed
                query = query.gte(col, day_start).lte(col, day_end)
        elif col in DATE_COLUMNS:
            date_str = parse_date_only(str(val))
            if date_str:
                query = query.eq(col, date_str)
        else:
            query = query.eq(col, str(val).strip())
    
    return query


def calculate_statistics(orders: list) -> dict:
    """Tính toán thống kê từ danh sách orders."""
    if not orders:
        return {
            "total_orders": 0,
            "total_revenue_vnd": 0,
            "total_amount_vnd": 0,
            "average_order_value": 0,
            "by_delivery_status": {},
            "by_payment_status": {},
            "by_team": {},
            "by_country": {},
            "by_marketing_staff": {},
            "by_sale_staff": {},
            "by_product": {},
            "by_shift": {},
            "by_check_result": {}
        }
    
    total_revenue = sum(float(row.get("total_vnd") or 0) for row in orders)
    total_amount = sum(float(row.get("total_amount_vnd") or 0) for row in orders)
    total_orders = len(orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Helper function để tính count và revenue
    def calculate_group_stats(orders_list, group_key):
        count = {}
        revenue = {}
        for row in orders_list:
            key = row.get(group_key) or "Unknown"
            count[key] = count.get(key, 0) + 1
            rev = float(row.get("total_vnd") or 0)
            revenue[key] = revenue.get(key, 0) + rev
        return count, revenue
    
    # Thống kê theo delivery_status
    delivery_status_count = {}
    for row in orders:
        status = row.get("delivery_status") or "Unknown"
        delivery_status_count[status] = delivery_status_count.get(status, 0) + 1
    
    # Thống kê theo payment_status
    payment_status_count = {}
    for row in orders:
        status = row.get("payment_status") or "Unknown"
        payment_status_count[status] = payment_status_count.get(status, 0) + 1
    
    # Thống kê theo team
    team_count, team_revenue = calculate_group_stats(orders, "team")
    
    # Thống kê theo country
    country_count, country_revenue = calculate_group_stats(orders, "country")
    
    # Thống kê theo marketing_staff
    marketing_count, marketing_revenue = calculate_group_stats(orders, "marketing_staff")
    
    # Thống kê theo sale_staff
    sale_count, sale_revenue = calculate_group_stats(orders, "sale_staff")
    
    # Thống kê theo product
    product_count, product_revenue = calculate_group_stats(orders, "product")
    
    # Thống kê theo shift
    shift_count, shift_revenue = calculate_group_stats(orders, "shift")
    
    # Thống kê theo check_result
    check_result_count, check_result_revenue = calculate_group_stats(orders, "check_result")
    
    return {
        "total_orders": total_orders,
        "total_revenue_vnd": round(total_revenue, 2),
        "total_amount_vnd": round(total_amount, 2),
        "average_order_value": round(avg_order_value, 2),
        "by_delivery_status": {
            "count": delivery_status_count,
            "percentage": {
                k: round((v / total_orders * 100), 2) if total_orders > 0 else 0
                for k, v in delivery_status_count.items()
            }
        },
        "by_payment_status": {
            "count": payment_status_count,
            "percentage": {
                k: round((v / total_orders * 100), 2) if total_orders > 0 else 0
                for k, v in payment_status_count.items()
            }
        },
        "by_team": {
            "count": team_count,
            "revenue": {k: round(v, 2) for k, v in team_revenue.items()}
        },
        "by_country": {
            "count": country_count,
            "revenue": {k: round(v, 2) for k, v in country_revenue.items()}
        },
        "by_marketing_staff": {
            "count": marketing_count,
            "revenue": {k: round(v, 2) for k, v in marketing_revenue.items()}
        },
        "by_sale_staff": {
            "count": sale_count,
            "revenue": {k: round(v, 2) for k, v in sale_revenue.items()}
        },
        "by_product": {
            "count": product_count,
            "revenue": {k: round(v, 2) for k, v in product_revenue.items()}
        },
        "by_shift": {
            "count": shift_count,
            "revenue": {k: round(v, 2) for k, v in shift_revenue.items()}
        },
        "by_check_result": {
            "count": check_result_count,
            "revenue": {k: round(v, 2) for k, v in check_result_revenue.items()}
        }
    }


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
        # Query riêng để lấy toàn bộ dữ liệu cho statistics (chỉ các cột cần thiết)
        stats_query = supabase.table("orders").select("total_vnd, total_amount_vnd, delivery_status, payment_status, team, country")
        stats_params = dict(request.query_params)
        stats_params.pop("limit", None)
        stats_params.pop("offset", None)
        stats_params.pop("after_id", None)
        
        for col, val in stats_params.items():
            if col not in ALL_ORDER_COLUMNS or not val:
                continue
            if col in TIMESTAMP_COLUMNS:
                parsed = parse_date_param(val)
                if parsed:
                    day_start, day_end = parsed
                    stats_query = stats_query.gte(col, day_start).lte(col, day_end)
            elif col in DATE_COLUMNS:
                date_str = parse_date_only(val)
                if date_str:
                    stats_query = stats_query.eq(col, date_str)
            else:
                stats_query = stats_query.eq(col, val.strip())
        
        # Lấy toàn bộ dữ liệu cho statistics (giới hạn 10000 để tránh quá tải)
        stats_result = stats_query.limit(10000).execute()
        statistics = calculate_statistics(stats_result.data)
        
        # Query dữ liệu để trả về (có phân trang)
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
            content={
                "data": data,
                "count": len(data),
                "next_after_id": last_id,
                "statistics": statistics
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "data": []},
            status_code=500,
        )


@app.post("/orders/statistics")
async def get_statistics_by_filter(filter_request: FilterRequest = Body(...)) -> Any:
    """
    Tính toán thống kê dựa trên bộ lọc từ FE.
    
    Body example:
    {
        "filters": {
            "team": ["Team A", "Team B"],
            "delivery_status": "Delivered",
            "country": "US"
        },
        "date_range": {
            "from": "01/03/2026",
            "to": "31/03/2026"
        },
        "date_column": "created_at"
    }
    """
    supabase = get_supabase()
    
    # Query để lấy dữ liệu cho statistics
    stats_query = supabase.table("orders").select("total_vnd, total_amount_vnd, delivery_status, payment_status, team, country, marketing_staff, sale_staff, product, shift, check_result")
    
    # Áp dụng date range nếu có
    if filter_request.date_range:
        from_date = filter_request.date_range.get("from")
        to_date = filter_request.date_range.get("to")
        date_col = filter_request.date_column or "created_at"
        
        if from_date:
            if date_col in TIMESTAMP_COLUMNS:
                parsed_from = parse_date_param(from_date)
                if parsed_from:
                    day_start, _ = parsed_from
                    stats_query = stats_query.gte(date_col, day_start)
            elif date_col in DATE_COLUMNS:
                date_str_from = parse_date_only(from_date)
                if date_str_from:
                    stats_query = stats_query.gte(date_col, date_str_from)
        
        if to_date:
            if date_col in TIMESTAMP_COLUMNS:
                parsed_to = parse_date_param(to_date)
                if parsed_to:
                    _, day_end = parsed_to
                    stats_query = stats_query.lte(date_col, day_end)
            elif date_col in DATE_COLUMNS:
                date_str_to = parse_date_only(to_date)
                if date_str_to:
                    stats_query = stats_query.lte(date_col, date_str_to)
    
    # Áp dụng các filter khác
    stats_query = apply_filters_to_query(stats_query, filter_request.filters)
    
    try:
        # Lấy toàn bộ dữ liệu (giới hạn 50000 để tránh quá tải)
        stats_result = stats_query.limit(50000).execute()
        statistics = calculate_statistics(stats_result.data)
        
        return JSONResponse(
            content={
                "statistics": statistics,
                "filters_applied": filter_request.filters,
                "date_range": filter_request.date_range,
                "total_records_analyzed": len(stats_result.data)
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "statistics": {}},
            status_code=500,
        )


@app.get("/orders/statistics")
async def get_statistics_by_query_params(request: Request) -> Any:
    """
    Tính toán thống kê dựa trên query params (tương tự endpoint /orders).
    Ví dụ: /orders/statistics?created_at=01/03/2026&team=Team%20A&delivery_status=Delivered
    """
    supabase = get_supabase()
    
    # Query để lấy dữ liệu cho statistics
    stats_query = supabase.table("orders").select("total_vnd, total_amount_vnd, delivery_status, payment_status, team, country, marketing_staff, sale_staff, product, shift, check_result")
    
    params = dict(request.query_params)
    
    for col, val in params.items():
        if col not in ALL_ORDER_COLUMNS or not val:
            continue
        if col in TIMESTAMP_COLUMNS:
            parsed = parse_date_param(val)
            if parsed:
                day_start, day_end = parsed
                stats_query = stats_query.gte(col, day_start).lte(col, day_end)
        elif col in DATE_COLUMNS:
            date_str = parse_date_only(val)
            if date_str:
                stats_query = stats_query.eq(col, date_str)
        else:
            stats_query = stats_query.eq(col, val.strip())
    
    try:
        # Lấy toàn bộ dữ liệu (giới hạn 50000 để tránh quá tải)
        stats_result = stats_query.limit(50000).execute()
        statistics = calculate_statistics(stats_result.data)
        
        return JSONResponse(
            content={
                "statistics": statistics,
                "filters_applied": params,
                "total_records_analyzed": len(stats_result.data)
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "statistics": {}},
            status_code=500,
        )


@app.get("/")
def root():
    return {
        "message": "Orders API",
        "docs": "/docs",
        "orders": "GET /orders?created_at=22/12/2026&city=Carson",
        "statistics_get": "GET /orders/statistics?created_at=01/03/2026&team=Team%20A",
        "statistics_post": "POST /orders/statistics với body JSON"
    }
