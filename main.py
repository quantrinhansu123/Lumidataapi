"""
Orders API - Query orders from Subabase with GET params.
Example: GET /orders?created_at=22/12/2026&city=Carson
"""
import os
from datetime import datetime
from typing import Any, Optional, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request, Body
from fastapi.middleware.cors import CORSMiddleware
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


app = FastAPI(title="Orders API", description="Query orders and detail_reports from Subabase by GET params")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    "ngay",  # detail_reports
    "date",  # detail_reports
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

# Mapping từ parameter name sang column name trong DB
# Ví dụ: ?team=xxx sẽ filter cột shift trong DB
PARAM_TO_COLUMN_MAPPING = {
    "team": "shift",  # Parameter 'team' map to column 'shift'
}

# Các cột của bảng detail_reports
ALL_DETAIL_REPORTS_COLUMNS = {
    "id", "ten", "ngay", "ca", "san_pham", "thi_truong", "team", "cpqc", "so_mess_cmt",
    # Các tên có thể khác
    "name", "date", "shift", "product", "market", "so_mess_cmt",
    # Tên với dấu gạch dưới
    "Tên", "Ngày", "ca", "Sản_phẩm", "Thị_trường", "Team", "CPQC", "Số_Mess_Cmt"
}

# Cột trả về từ detail_reports API - lấy tất cả các cột có thể
DETAIL_REPORTS_SELECT_COLUMNS = "*"
DETAIL_REPORTS_RESPONSE_LABELS = {
    "id": "id",
    "ten": "ten",
    "ngay": "ngay",
    "ca": "ca",
    "san_pham": "san_pham",
    "thi_truong": "thi_truong",
    "team": "team",
    "cpqc": "cpqc",
    "so_mess_cmt": "so_mess_cmt",
    # Các tên có thể khác
    "name": "ten",
    "date": "ngay",
    "shift": "ca",
    "product": "san_pham",
    "market": "thi_truong",
    "Team": "team",
    "CPQC": "cpqc",
    "Số_Mess_Cmt": "so_mess_cmt",
    "Tên": "ten",
    "Ngày": "ngay",
    "Sản_phẩm": "san_pham",
    "Thị_trường": "thi_truong"
}

DETAIL_REPORTS_CANONICAL_COLUMNS = {
    "ten", "ngay", "ca", "san_pham", "thi_truong", "team"
}

DETAIL_REPORTS_PARAM_MAPPING = {
    "teammkt": "team",
    "nhan_su": "ten",
    "nhansu": "ten",
    "marketing_staff": "ten",
    "staff": "ten",
    "tennhanvien": "ten",
    "camkt": "ca",
    "shift": "ca",
    "product": "san_pham",
    "productmkt": "san_pham",
    "sanpham": "san_pham",
    "market": "thi_truong",
    "marketmkt": "thi_truong",
    "thitruong": "thi_truong",
    "date": "ngay",
    "report_date": "ngay",
}

# Cấu hình cho bảng sales_reports (tương tự detail_reports)
SALES_REPORTS_SELECT_COLUMNS = "*"
SALES_REPORTS_RESPONSE_LABELS = {
    "id": "id",
    "ten": "ten",
    "ngay": "date",
    "ca": "ca",
    "san_pham": "san_pham",
    "thi_truong": "thi_truong",
    "team": "team",
    "cpqc": "cpqc",
    "so_mess_cmt": "so_mess_cmt",
    "name": "ten",
    "date": "date",
    "shift": "ca",
    "product": "san_pham",
    "market": "thi_truong",
    "Team": "team",
    "CPQC": "cpqc",
    "Số_Mess_Cmt": "so_mess_cmt",
    "Tên": "ten",
    "Ngày": "date",
    "Sản_phẩm": "san_pham",
    "Thị_trường": "thi_truong"
}

SALES_REPORTS_CANONICAL_COLUMNS = {
    "ten", "date", "ca", "san_pham", "thi_truong", "team"
}

SALES_REPORTS_PARAM_MAPPING = {
    "teamsale": "team",
    "teammkt": "team",
    "nhan_su": "ten",
    "nhansu": "ten",
    "marketing_staff": "ten",
    "staff": "ten",
    "tennhanvien": "ten",
    "casle": "ca",
    "camkt": "ca",
    "shift": "ca",
    "product": "san_pham",
    "productsale": "san_pham",
    "productmkt": "san_pham",
    "sanpham": "san_pham",
    "market": "thi_truong",
    "marketsale": "thi_truong",
    "marketmkt": "thi_truong",
    "thitruong": "thi_truong",
    "ngay": "date",
    "date": "date",
    "report_date": "date",
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


def normalize_detail_reports_row(row: dict) -> dict:
    """Chuẩn hóa key từ detail_reports về bộ key chuẩn để xử lý thống kê ổn định."""
    normalized = {}
    for raw_key, value in row.items():
        key_str = str(raw_key).strip()
        mapped_key = DETAIL_REPORTS_RESPONSE_LABELS.get(key_str)

        if mapped_key is None:
            lowered_key = key_str.lower()
            for alias, canonical in DETAIL_REPORTS_RESPONSE_LABELS.items():
                if str(alias).strip().lower() == lowered_key:
                    mapped_key = canonical
                    break

        if mapped_key is None:
            mapped_key = key_str

        if mapped_key in normalized and normalized[mapped_key] not in (None, ""):
            continue
        normalized[mapped_key] = value

    return normalized


def normalize_date_value(value: Any) -> Optional[str]:
    """Chuẩn hóa giá trị ngày về yyyy-mm-dd để so sánh."""
    if value is None:
        return None

    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")

    raw = str(value).strip()
    if not raw:
        return None

    if "T" in raw:
        raw = raw.split("T", 1)[0]
    elif " " in raw and len(raw) >= 10 and raw[4] == "-":
        raw = raw.split(" ", 1)[0]

    return parse_date_only(raw)


def apply_detail_reports_filters_in_memory(
    reports: List[dict],
    filters: Dict[str, Any],
    date_range: Optional[Dict[str, str]] = None,
    date_column: str = "ngay",
) -> List[dict]:
    """Lọc detail_reports trong Python theo key chuẩn, không phụ thuộc tên cột vật lý trong DB."""
    filtered = reports

    normalized_filters: Dict[str, Any] = {}
    for col, val in (filters or {}).items():
        if val is None:
            continue
        if isinstance(val, str) and not val.strip():
            continue
        if isinstance(val, list):
            cleaned_list = [item for item in val if str(item).strip()]
            if not cleaned_list:
                continue
            val = cleaned_list
        mapped_col = DETAIL_REPORTS_RESPONSE_LABELS.get(col, col)
        if mapped_col in DETAIL_REPORTS_CANONICAL_COLUMNS:
            normalized_filters[mapped_col] = val

    for col, val in normalized_filters.items():
        if isinstance(val, list):
            if col == "ngay":
                allowed_dates = {
                    parse_date_only(str(item))
                    for item in val
                    if str(item).strip()
                }
                allowed_dates = {d for d in allowed_dates if d}
                if not allowed_dates:
                    continue
                filtered = [
                    row for row in filtered
                    if normalize_date_value(row.get("ngay")) in allowed_dates
                ]
            else:
                # Build allowed values with case-insensitive lookup
                allowed_values = [
                    str(item).strip()
                    for item in val
                    if str(item).strip()
                ]
                if not allowed_values:
                    continue
                # Create a dict for case-insensitive lookup: {"value_lower": "original_value", ...}
                allowed_values_lower = {v.lower(): v for v in allowed_values}
                filtered = [
                    row for row in filtered
                    if str(row.get(col) or "").strip().lower() in allowed_values_lower
                ]
        elif col == "ngay":
            date_str = parse_date_only(str(val))
            if date_str:
                filtered = [
                    row for row in filtered
                    if normalize_date_value(row.get("ngay")) == date_str
                ]
        else:
            target = str(val).strip().lower()
            filtered = [
                row for row in filtered
                if str(row.get(col) or "").strip().lower() == target
            ]

    if date_range:
        from_date = parse_date_only(str(date_range.get("from") or "")) if date_range.get("from") else None
        to_date = parse_date_only(str(date_range.get("to") or "")) if date_range.get("to") else None

        if from_date or to_date:
            normalized_date_col = DETAIL_REPORTS_RESPONSE_LABELS.get(date_column, date_column)
            if normalized_date_col not in DETAIL_REPORTS_CANONICAL_COLUMNS:
                normalized_date_col = "date"

            range_filtered = []
            for row in filtered:
                row_date = normalize_date_value(row.get(normalized_date_col))
                if not row_date:
                    continue
                if from_date and row_date < from_date:
                    continue
                if to_date and row_date > to_date:
                    continue
                range_filtered.append(row)
            filtered = range_filtered

    return filtered


def normalize_detail_reports_filters(filters: Dict[str, Any]) -> Dict[str, Any]:
    """Chuẩn hóa filters cho detail_reports: map param và hỗ trợ nhiều giá trị cách nhau bởi dấu phẩy."""
    normalized: Dict[str, Any] = {}

    for raw_key, raw_value in (filters or {}).items():
        if raw_value is None:
            continue

        mapped_key = DETAIL_REPORTS_PARAM_MAPPING.get(raw_key, raw_key)

        values: List[str] = []
        if isinstance(raw_value, list):
            for item in raw_value:
                item_str = str(item).strip()
                if not item_str:
                    continue
                values.extend([part.strip() for part in item_str.split(",") if part.strip()])
        else:
            value_str = str(raw_value).strip()
            if value_str:
                values = [part.strip() for part in value_str.split(",") if part.strip()]

        if not values:
            continue

        value_to_set: Any = values if len(values) > 1 else values[0]

        if mapped_key in normalized:
            existing = normalized[mapped_key]
            existing_list = existing if isinstance(existing, list) else [existing]
            new_list = value_to_set if isinstance(value_to_set, list) else [value_to_set]
            merged = [str(item).strip() for item in (existing_list + new_list) if str(item).strip()]
            normalized[mapped_key] = merged if len(merged) > 1 else merged[0]
        else:
            normalized[mapped_key] = value_to_set

    return normalized


def normalize_sales_reports_row(row: dict) -> dict:
    """Chuẩn hóa key từ sales_reports về bộ key chuẩn."""
    normalized = {}
    for raw_key, value in row.items():
        key_str = str(raw_key).strip()
        mapped_key = SALES_REPORTS_RESPONSE_LABELS.get(key_str)

        if mapped_key is None:
            lowered_key = key_str.lower()
            for alias, canonical in SALES_REPORTS_RESPONSE_LABELS.items():
                if str(alias).strip().lower() == lowered_key:
                    mapped_key = canonical
                    break

        if mapped_key is None:
            mapped_key = key_str

        if mapped_key in normalized and normalized[mapped_key] not in (None, ""):
            continue
        normalized[mapped_key] = value

    return normalized


def normalize_sales_reports_filters(filters: Dict[str, Any]) -> Dict[str, Any]:
    """Chuẩn hóa filters cho sales_reports: map param và hỗ trợ a,b,c."""
    normalized: Dict[str, Any] = {}

    for raw_key, raw_value in (filters or {}).items():
        if raw_value is None:
            continue

        mapped_key = SALES_REPORTS_PARAM_MAPPING.get(raw_key, raw_key)

        values: List[str] = []
        if isinstance(raw_value, list):
            for item in raw_value:
                item_str = str(item).strip()
                if not item_str:
                    continue
                values.extend([part.strip() for part in item_str.split(",") if part.strip()])
        else:
            value_str = str(raw_value).strip()
            if value_str:
                values = [part.strip() for part in value_str.split(",") if part.strip()]

        if not values:
            continue

        value_to_set: Any = values if len(values) > 1 else values[0]

        if mapped_key in normalized:
            existing = normalized[mapped_key]
            existing_list = existing if isinstance(existing, list) else [existing]
            new_list = value_to_set if isinstance(value_to_set, list) else [value_to_set]
            merged = [str(item).strip() for item in (existing_list + new_list) if str(item).strip()]
            normalized[mapped_key] = merged if len(merged) > 1 else merged[0]
        else:
            normalized[mapped_key] = value_to_set

    return normalized


def apply_sales_reports_filters_in_memory(
    reports: List[dict],
    filters: Dict[str, Any],
    date_range: Optional[Dict[str, str]] = None,
    date_column: str = "date",
) -> List[dict]:
    """Lọc sales_reports trong Python theo key chuẩn."""
    filtered = reports

    normalized_filters: Dict[str, Any] = {}
    for col, val in (filters or {}).items():
        if val is None:
            continue
        if isinstance(val, str) and not val.strip():
            continue
        if isinstance(val, list):
            cleaned_list = [item for item in val if str(item).strip()]
            if not cleaned_list:
                continue
            val = cleaned_list
        mapped_col = SALES_REPORTS_RESPONSE_LABELS.get(col, col)
        if mapped_col in SALES_REPORTS_CANONICAL_COLUMNS:
            normalized_filters[mapped_col] = val

    for col, val in normalized_filters.items():
        if isinstance(val, list):
            if col == "date":
                allowed_dates = {
                    parse_date_only(str(item))
                    for item in val
                    if str(item).strip()
                }
                allowed_dates = {d for d in allowed_dates if d}
                if not allowed_dates:
                    continue
                filtered = [
                    row for row in filtered
                    if normalize_date_value(row.get("date")) in allowed_dates
                ]
            else:
                allowed_values = [
                    str(item).strip()
                    for item in val
                    if str(item).strip()
                ]
                if not allowed_values:
                    continue
                allowed_values_lower = {v.lower(): v for v in allowed_values}
                filtered = [
                    row for row in filtered
                    if str(row.get(col) or "").strip().lower() in allowed_values_lower
                ]
        elif col == "date":
            date_str = parse_date_only(str(val))
            if date_str:
                filtered = [
                    row for row in filtered
                    if normalize_date_value(row.get("date")) == date_str
                ]
        else:
            target = str(val).strip().lower()
            filtered = [
                row for row in filtered
                if str(row.get(col) or "").strip().lower() == target
            ]

    if date_range:
        from_date = parse_date_only(str(date_range.get("from") or "")) if date_range.get("from") else None
        to_date = parse_date_only(str(date_range.get("to") or "")) if date_range.get("to") else None

        if from_date or to_date:
            normalized_date_col = SALES_REPORTS_RESPONSE_LABELS.get(date_column, date_column)
            if normalized_date_col not in SALES_REPORTS_CANONICAL_COLUMNS:
                normalized_date_col = "date"

            range_filtered = []
            for row in filtered:
                row_date = normalize_date_value(row.get(normalized_date_col))
                if not row_date:
                    continue
                if from_date and row_date < from_date:
                    continue
                if to_date and row_date > to_date:
                    continue
                range_filtered.append(row)
            filtered = range_filtered

    return filtered


def apply_filters_to_query(query, filters: dict):
    """Áp dụng bộ lọc vào query Supabase."""
    for param_name, val in filters.items():
        # Map parameter name sang column name (vd: team -> shift)
        col = PARAM_TO_COLUMN_MAPPING.get(param_name, param_name)

        raw_values: List[Any]
        if isinstance(val, list):
            raw_values = [item for item in val if str(item).strip()]
        elif isinstance(val, str) and "," in val:
            raw_values = [item.strip() for item in val.split(",") if item.strip()]
        else:
            raw_values = [val] if str(val).strip() else []

        if not raw_values:
            continue

        val = raw_values if len(raw_values) > 1 else raw_values[0]
        
        if col not in ALL_ORDER_COLUMNS or not val:
            continue
        
        # Xử lý mảng (OR condition) - ví dụ: team=["Team A", "Team B"]
        if isinstance(val, list):
            if col in TIMESTAMP_COLUMNS:
                or_conditions = []
                for item in val:
                    parsed = parse_date_param(str(item))
                    if parsed:
                        day_start, day_end = parsed
                        or_conditions.append(f"and({col}.gte.{day_start},{col}.lte.{day_end})")
                if or_conditions:
                    query = query.or_(",".join(or_conditions))
                continue

            if col in DATE_COLUMNS:
                parsed_dates = []
                for item in val:
                    date_str = parse_date_only(str(item))
                    if date_str:
                        parsed_dates.append(date_str)
                if parsed_dates:
                    query = query.in_(col, parsed_dates)
                continue

            # Cột text/khác: dùng in_ cho nhiều giá trị
            query = query.in_(col, [str(item).strip() for item in val if str(item).strip()])
            continue
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


@app.get("/orders")
async def get_orders(
    request: Request,
    limit: int = Query(100, ge=1, le=1000, description="Số bản ghi tối đa"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    after_id: Optional[str] = Query(None, description="Cursor: id bản ghi cuối trang trước (trang sau = after_id này)"),
    from_date: Optional[str] = Query(None, description="Ngày bắt đầu (dd/mm/yyyy)"),
    to_date: Optional[str] = Query(None, description="Ngày kết thúc (dd/mm/yyyy)"),
    date_column: str = Query("order_date", description="Cột date để filter (order_date, created_at, ...)"),
) -> Any:
    """
    Lấy danh sách orders với bộ lọc theo query params.
    Phân trang: dùng after_id (cursor) để tránh trùng/thiếu. Trang 1 không truyền after_id;
    trang sau truyền after_id=id của bản ghi cuối trong trang trước.
    
    Bộ lọc hỗ trợ:
    - team: Lọc theo ca làm việc (cột shift trong DB)
    - delivery_status, payment_status, country, product, check_result
    - marketing_staff, sale_staff, delivery_staff, cskh
    - from_date, to_date: Khoảng thời gian (dd/mm/yyyy)
    - date_column: Cột date để lọc (mặc định: order_date)
    
    Ví dụ: /orders?team=Morning&delivery_status=Delivered&product=Product%20A&from_date=01/01/2026&to_date=31/01/2026
    """
    supabase = get_supabase()
    q = supabase.table("orders").select(SELECT_COLUMNS)

    params = dict(request.query_params)
    params.pop("limit", None)
    params.pop("offset", None)
    params.pop("after_id", None)
    params.pop("from_date", None)
    params.pop("to_date", None)
    params.pop("date_column", None)

    # Áp dụng date range nếu có
    if from_date or to_date:
        if date_column in TIMESTAMP_COLUMNS:
            if from_date:
                parsed_from = parse_date_param(from_date)
                if parsed_from:
                    day_start, _ = parsed_from
                    q = q.gte(date_column, day_start)
            if to_date:
                parsed_to = parse_date_param(to_date)
                if parsed_to:
                    _, day_end = parsed_to
                    q = q.lte(date_column, day_end)
        elif date_column in DATE_COLUMNS:
            if from_date:
                date_str_from = parse_date_only(from_date)
                if date_str_from:
                    q = q.gte(date_column, date_str_from)
            if to_date:
                date_str_to = parse_date_only(to_date)
                if date_str_to:
                    q = q.lte(date_column, date_str_to)

    # Áp dụng các filter khác (hỗ trợ nhiều giá trị: a,b,c)
    q = apply_filters_to_query(q, params)

    # PostgREST/Supabase không đảm bảo thứ tự → luôn lấy tối đa 1000 bản ghi (offset=0),
    # sắp xếp theo id trong Python rồi cắt [offset:offset+limit].
    if after_id:
        q = q.gt("id", after_id.strip()).order("id", desc=False).limit(limit)
        fetch_all_then_slice = False
    else:
        q = q.limit(1000).offset(0)
        fetch_all_then_slice = True

    try:
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
                "next_after_id": last_id
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "data": []},
            status_code=500,
        )


@app.get("/detail_reports")
async def get_detail_reports(
    request: Request,
    limit: int = Query(100, ge=1, le=1000, description="Số bản ghi tối đa"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    after_id: Optional[str] = Query(None, description="Cursor: id bản ghi cuối trang trước"),
) -> Any:
    """
    Lấy danh sách detail_reports với bộ lọc theo query params.
    Các trường có thể filter: ten, ngay, ca, san_pham, thi_truong, team, nhan_su (danh sách tên cách nhau bởi dấu phẩy)
    Ví dụ: /detail_reports?nhan_su=Nguyễn Văn A,Trần Thị B&from_date=01/02/2026&to_date=10/02/2026
    """
    supabase = get_supabase()
    q = supabase.table("detail_reports").select("*")

    params = dict(request.query_params)
    params.pop("limit", None)
    params.pop("offset", None)
    params.pop("after_id", None)
    params = normalize_detail_reports_filters(params)
    
    # Extract date_range từ params
    from_date = params.pop("from_date", None)
    to_date = params.pop("to_date", None)
    date_column = params.pop("date_column", "date")
    
    date_range = None
    if from_date or to_date:
        date_range = {}
        if from_date:
            date_range["from"] = from_date
        if to_date:
            date_range["to"] = to_date
    
    q = q.limit(50000)

    try:
        result = q.execute()
        normalized = [normalize_detail_reports_row(row) for row in result.data]
        filtered = apply_detail_reports_filters_in_memory(normalized, params, date_range, date_column)
        filtered = sorted(filtered, key=lambda r: (str(r.get("id") or "")))

        if after_id:
            cursor = after_id.strip()
            filtered = [row for row in filtered if str(row.get("id") or "") > cursor]
            raw = filtered[:limit]
        else:
            start = offset * limit
            raw = filtered[start : start + limit] if start < len(filtered) else []

        data = []
        for row in raw:
            formatted_row = {}
            for k, v in row.items():
                # Map tên cột về tên chuẩn
                mapped_key = DETAIL_REPORTS_RESPONSE_LABELS.get(k, k)
                formatted_row[mapped_key] = v
            data.append(formatted_row)
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


@app.get("/sales_reports")
async def get_sales_reports(
    request: Request,
    limit: int = Query(100, ge=1, le=1000, description="Số bản ghi tối đa"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    after_id: Optional[str] = Query(None, description="Cursor: id bản ghi cuối trang trước"),
) -> Any:
    """
    Lấy danh sách sales_reports với bộ lọc theo query params.

    Hỗ trợ các alias filter tương tự detail_reports:
    - team: team/teamsale/teammkt
    - nhân sự: ten/nhan_su/nhansu/marketing_staff/staff
    - ca: ca/casle/camkt/shift
    - sản phẩm: san_pham/product/productsale/productmkt/sanpham
    - thị trường: thi_truong/market/marketsale/marketmkt/thitruong
    - ngày: date/ngay/report_date
    """
    supabase = get_supabase()
    q = supabase.table("sales_reports").select(SALES_REPORTS_SELECT_COLUMNS)

    params = dict(request.query_params)
    params.pop("limit", None)
    params.pop("offset", None)
    params.pop("after_id", None)
    params = normalize_sales_reports_filters(params)

    from_date = params.pop("from_date", None)
    to_date = params.pop("to_date", None)
    date_column = params.pop("date_column", "ngay")

    date_range = None
    if from_date or to_date:
        date_range = {}
        if from_date:
            date_range["from"] = from_date
        if to_date:
            date_range["to"] = to_date

    q = q.limit(50000)

    try:
        result = q.execute()
        normalized = [normalize_sales_reports_row(row) for row in result.data]
        filtered = apply_sales_reports_filters_in_memory(normalized, params, date_range, date_column)
        filtered = sorted(filtered, key=lambda r: (str(r.get("id") or "")))

        if after_id:
            cursor = after_id.strip()
            filtered = [row for row in filtered if str(row.get("id") or "") > cursor]
            raw = filtered[:limit]
        else:
            start = offset * limit
            raw = filtered[start : start + limit] if start < len(filtered) else []

        data = []
        for row in raw:
            formatted_row = {}
            for k, v in row.items():
                mapped_key = SALES_REPORTS_RESPONSE_LABELS.get(k, k)
                formatted_row[mapped_key] = v
            data.append(formatted_row)

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
    return {
        "message": "Orders API",
        "docs": "/docs",
        "orders": "GET /orders?created_at=22/12/2026&city=Carson",
        "detail_reports": "GET /detail_reports?nhan_su=Nguyễn Văn A,Trần Thị B&ngay=01/02/2026",
        "sales_reports": "GET /sales_reports?teamsale=Team%20A&from_date=01/02/2026&to_date=10/02/2026&date_column=date"
    }




