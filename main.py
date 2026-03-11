"""
Orders API - Query orders from Subabase with GET params.
Example: GET /orders?created_at=22/12/2026&city=Carson
"""
import os
import csv
import io
from datetime import datetime
from typing import Any, Optional, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
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


def fetch_all_rows_with_pagination(
    table_name: str,
    select_columns: str = "*",
    batch_size: int = 1000,
    max_rows: int = 200000,
    cursor_column: str = "id",
) -> List[dict]:
    """Lấy dữ liệu theo cursor để tránh giới hạn 1000 rows của Supabase API."""
    supabase = get_supabase()
    all_rows: List[dict] = []
    last_cursor_value: Optional[Any] = None

    while True:
        q = (
            supabase
            .table(table_name)
            .select(select_columns)
            .order(cursor_column, desc=False)
            .limit(batch_size)
        )

        if last_cursor_value is not None:
            q = q.gt(cursor_column, last_cursor_value)

        result = q.execute()
        rows = result.data or []

        if not rows:
            break

        all_rows.extend(rows)

        # Dừng nếu không còn đủ batch, nghĩa là đã tới trang cuối.
        if len(rows) < batch_size:
            break

        last_cursor_value = rows[-1].get(cursor_column)
        if last_cursor_value is None:
            break

        # Safety guard để tránh tải quá lớn khi dữ liệu tăng đột biến.
        if len(all_rows) >= max_rows:
            break

    return all_rows[:max_rows]


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
SELECT_COLUMNS = "id, marketing_staff, sale_staff, created_at, total_vnd, order_date, country, product, total_amount_vnd, tracking_code, team, delivery_status, payment_status, delivery_staff, check_result, shift, accountant_confirm, delivery_status_nb"
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
    "shift": "shift",
    "accountant_confirm": "accountant_confirm",
    "delivery_status_nb": "delivery_status_nb"
}

# Mapping từ parameter name sang column name trong DB
# Lưu ý: team parameter map tới cột 'team' trong DB (không phải 'shift')
# Nếu muốn filter theo shift, dùng parameter 'shift' trực tiếp
PARAM_TO_COLUMN_MAPPING = {
    # Không cần mapping vì team và shift đều có cột tương ứng trong DB
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
    "Thị_trường": "thi_truong",
    # Các trường tính toán mới
    "order_count": "order_count",
    "order_cancel_count_actual": "order_cancel_count_actual",
    "revenue_actual": "revenue_actual",
    "revenue_cancel_actual": "revenue_cancel_actual",
    "order_success_count": "order_success_count",
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


async def fetch_filtered_orders(
    request: Request,
    limit: Optional[int] = None,
    offset: int = 0,
    after_id: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    date_column: str = "order_date",
) -> List[dict]:
    """Helper function để lấy dữ liệu orders đã lọc (tái sử dụng logic từ get_orders)."""
    supabase = get_supabase()
    q = supabase.table("orders").select(SELECT_COLUMNS)

    params = dict(request.query_params)
    params.pop("limit", None)
    params.pop("offset", None)
    params.pop("after_id", None)
    params.pop("from_date", None)
    params.pop("to_date", None)
    params.pop("date_column", None)
    params.pop("format", None)  # Bỏ format nếu có

    # Tách text filters (team, shift) để filter case-insensitive trong memory
    # Chỉ tách team và shift vì đây là các cột thường gặp vấn đề case-sensitive
    text_filters = {}
    non_text_params = {}
    for param_name, val in params.items():
        col = PARAM_TO_COLUMN_MAPPING.get(param_name, param_name)
        # Chỉ filter case-insensitive cho team và shift
        if param_name in ["team", "shift"]:
            if isinstance(val, str) and "," in val:
                text_filters[col] = [v.strip().lower() for v in val.split(",") if v.strip()]
            elif val:
                text_filters[col] = [str(val).strip().lower()]
        else:
            non_text_params[param_name] = val

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

    # Áp dụng các filter khác (không bao gồm text filters đã tách ra)
    q = apply_filters_to_query(q, non_text_params)

    # Lấy tất cả dữ liệu (không giới hạn) nếu không có limit
    batch_size = 10000
    
    all_data = []
    
    if limit:
        # Có limit: lấy nhiều hơn một chút để kiểm tra xem còn data không
        # Lấy limit + 1 để biết có data tiếp theo không
        fetch_limit = limit + 1
        
        if after_id:
            q_cursor = q.gt("id", after_id.strip()).order("id", desc=False).limit(fetch_limit)
            result = q_cursor.execute()
            all_data = result.data
        else:
            q_limit = q.order("id", desc=False).limit(fetch_limit).offset(offset)
            result = q_limit.execute()
            all_data = result.data
    else:
        # Không có limit: lấy TẤT CẢ bằng cursor-based pagination
        current_id = after_id.strip() if after_id else None
        max_iterations = 10000
        
        for iteration in range(max_iterations):
            q_batch = supabase.table("orders").select(SELECT_COLUMNS)
            
            # Áp dụng lại tất cả filters
            if from_date or to_date:
                if date_column in TIMESTAMP_COLUMNS:
                    if from_date:
                        parsed_from = parse_date_param(from_date)
                        if parsed_from:
                            day_start, _ = parsed_from
                            q_batch = q_batch.gte(date_column, day_start)
                    if to_date:
                        parsed_to = parse_date_param(to_date)
                        if parsed_to:
                            _, day_end = parsed_to
                            q_batch = q_batch.lte(date_column, day_end)
                elif date_column in DATE_COLUMNS:
                    if from_date:
                        date_str_from = parse_date_only(from_date)
                        if date_str_from:
                            q_batch = q_batch.gte(date_column, date_str_from)
                    if to_date:
                        date_str_to = parse_date_only(to_date)
                        if date_str_to:
                            q_batch = q_batch.lte(date_column, date_str_to)
            
            # Áp dụng lại các filter khác (không bao gồm text filters)
            q_batch = apply_filters_to_query(q_batch, non_text_params)
            
            # Thêm cursor và order
            if current_id:
                q_batch = q_batch.gt("id", current_id)
            q_batch = q_batch.order("id", desc=False).limit(batch_size)
            
            result = q_batch.execute()
            batch_data = result.data
            
            if not batch_data:
                break
            
            all_data.extend(batch_data)
            
            if len(batch_data) < batch_size:
                break
            
            last_row = batch_data[-1]
            current_id = last_row.get("id")
            if not current_id:
                break
    
    # Sắp xếp theo id để đảm bảo thứ tự
    if not after_id and not limit:
        all_data = sorted(all_data, key=lambda r: (r.get("id") or ""))
    
    # Áp dụng case-insensitive filter trong memory cho text filters
    if text_filters:
        filtered_data = []
        for row in all_data:
            match = True
            for col, filter_values in text_filters.items():
                row_value = str(row.get(col, "")).strip().lower()
                if not any(fv == row_value for fv in filter_values):
                    match = False
                    break
            if match:
                filtered_data.append(row)
        all_data = filtered_data
    
    # Áp dụng offset nếu có
    if offset > 0 and not after_id:
        all_data = all_data[offset:]
    
    # Nếu có limit và lấy nhiều hơn limit, cắt bớt và đánh dấu còn data
    has_more = False
    if limit:
        # Nếu lấy được nhiều hơn limit (từ DB hoặc sau filter), có thể còn data
        if len(all_data) > limit:
            has_more = True
            all_data = all_data[:limit]
        # Nếu lấy đúng limit và có after_id, có thể còn data (cần kiểm tra thêm)
        elif len(all_data) == limit and after_id:
            # Đã lấy đúng limit với cursor, có thể còn data
            has_more = True
    
    # Map sang response labels
    data = [
        {RESPONSE_LABELS[k]: v for k, v in row.items() if k in RESPONSE_LABELS}
        for row in all_data
    ]
    
    # Trả về tuple (data, has_more) để nhất quán
    # has_more chỉ có ý nghĩa khi có limit
    return data, has_more if limit else False


@app.get("/orders")
async def get_orders(
    request: Request,
    limit: Optional[int] = Query(None, ge=1, le=10000, description="Số bản ghi tối đa (không truyền = lấy tất cả, tối đa 10000)"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    after_id: Optional[str] = Query(None, description="Cursor: id bản ghi cuối trang trước (trang sau = after_id này)"),
    from_date: Optional[str] = Query(None, description="Ngày bắt đầu (dd/mm/yyyy)"),
    to_date: Optional[str] = Query(None, description="Ngày kết thúc (dd/mm/yyyy)"),
    date_column: str = Query("order_date", description="Cột date để filter (order_date, created_at, ...)"),
) -> Any:
    """
    Lấy danh sách orders với bộ lọc theo query params.
    Mặc định lấy TẤT CẢ dữ liệu thỏa điều kiện filter (không giới hạn).
    Nếu truyền limit thì sẽ giới hạn số lượng.
    
    Bộ lọc hỗ trợ:
    - team: Lọc theo ca làm việc (cột shift trong DB)
    - delivery_staff: Lọc theo nhân viên giao hàng (hỗ trợ nhiều giá trị: delivery_staff=Name1,Name2)
    - delivery_status: Lọc theo trạng thái giao hàng (hỗ trợ nhiều giá trị)
    - payment_status: Lọc theo trạng thái thanh toán (hỗ trợ nhiều giá trị)
    - country, product, check_result
    - marketing_staff, sale_staff, cskh
    - from_date, to_date: Khoảng thời gian (dd/mm/yyyy)
    - date_column: Cột date để lọc (mặc định: order_date)
    
    Ví dụ: 
    - /orders?delivery_staff=Nguyễn Văn A&delivery_status=Delivered
    - /orders?team=Morning&delivery_status=Delivered&payment_status=Paid&delivery_staff=Staff1,Staff2&from_date=01/01/2026&to_date=31/01/2026
    
    Response bao gồm: id, nhanvien_maketing, nhanvien_sale, ngaytao, tongtien, order_date, country, product, 
    total_amount_vnd, tracking_code, team, delivery_status, payment_status, delivery_staff, check_result, shift
    """
    try:
        result = await fetch_filtered_orders(
            request=request,
            limit=limit,
            offset=offset,
            after_id=after_id,
            from_date=from_date,
            to_date=to_date,
            date_column=date_column,
        )
        
        # Unpack result (data, has_more)
        if isinstance(result, tuple):
            data, has_more = result
        else:
            data = result
            has_more = False
        
        # Tính next_after_id: nếu có limit và (có has_more hoặc len(data) == limit)
        last_id = data[-1]["id"] if data else None
        next_after_id = None
        if limit and data:
            # Nếu có has_more hoặc len(data) == limit, có thể còn data
            if has_more or len(data) >= limit:
                next_after_id = last_id
        
        return JSONResponse(
            content={
                "data": data,
                "count": len(data),
                "next_after_id": next_after_id,
                "has_more": has_more if limit else None
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "data": []},
            status_code=500,
        )


@app.get("/orders/export")
async def export_orders(
    request: Request,
    format: str = Query("csv", description="Định dạng file export (csv, excel)"),
    from_date: Optional[str] = Query(None, description="Ngày bắt đầu (dd/mm/yyyy)"),
    to_date: Optional[str] = Query(None, description="Ngày kết thúc (dd/mm/yyyy)"),
    date_column: str = Query("order_date", description="Cột date để filter (order_date, created_at, ...)"),
) -> Response:
    """
    Export danh sách orders đã lọc ra file CSV hoặc Excel.
    Hỗ trợ tất cả các bộ lọc giống như endpoint /orders.
    
    Ví dụ:
    - /orders/export?format=csv&team=Morning&delivery_status=Delivered&from_date=01/01/2026&to_date=31/01/2026
    - /orders/export?format=csv&delivery_staff=Nguyễn Văn A,Trần Văn B&payment_status=Paid
    
    Format hỗ trợ:
    - csv: Xuất ra file CSV (mặc định)
    - excel: Xuất ra file Excel (sẽ thêm sau nếu cần)
    """
    try:
        # Lấy dữ liệu đã lọc (không giới hạn)
        result = await fetch_filtered_orders(
            request=request,
            limit=None,
            offset=0,
            after_id=None,
            from_date=from_date,
            to_date=to_date,
            date_column=date_column,
        )
        
        # Unpack result (data, has_more) - với limit=None, has_more sẽ là False
        if isinstance(result, tuple):
            data, _ = result
        else:
            data = result
        
        if not data:
            return JSONResponse(
                content={"error": "Không có dữ liệu để export", "count": 0},
                status_code=404,
            )
        
        # Tạo file CSV
        if format.lower() == "csv":
            output = io.StringIO()
            
            # Lấy tất cả các keys từ dữ liệu đầu tiên để làm header
            if data:
                fieldnames = list(data[0].keys())
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            
            csv_content = output.getvalue()
            output.close()
            
            # Tạo tên file với timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"orders_export_{timestamp}.csv"
            
            return Response(
                content=csv_content.encode('utf-8-sig'),  # UTF-8 BOM để Excel mở đúng tiếng Việt
                media_type="text/csv; charset=utf-8",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
        
        elif format.lower() == "excel":
            # TODO: Thêm hỗ trợ Excel nếu cần (cần cài thêm openpyxl)
            return JSONResponse(
                content={"error": "Excel format chưa được hỗ trợ. Vui lòng dùng format=csv"},
                status_code=400,
            )
        
        else:
            return JSONResponse(
                content={"error": f"Format '{format}' không được hỗ trợ. Chỉ hỗ trợ: csv, excel"},
                status_code=400,
            )
            
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500,
        )


@app.get("/detail_reports")
async def get_detail_reports(
    request: Request,
    limit: int = Query(100, ge=1, le=10000, description="Số bản ghi tối đa"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    after_id: Optional[str] = Query(None, description="Cursor: id bản ghi cuối trang trước"),
) -> Any:
    """
    Lấy danh sách detail_reports với bộ lọc theo query params.
    Các trường có thể filter: ten, ngay, ca, san_pham, thi_truong, team, nhan_su (danh sách tên cách nhau bởi dấu phẩy)
    Ví dụ: /detail_reports?nhan_su=Nguyễn Văn A,Trần Thị B&from_date=01/02/2026&to_date=10/02/2026
    """
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
    
    try:
        rows = fetch_all_rows_with_pagination(
            table_name="detail_reports",
            select_columns="*",
            batch_size=1000,
        )
        normalized = [normalize_detail_reports_row(row) for row in rows]
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
    limit: int = Query(100, ge=1, le=10000, description="Số bản ghi tối đa"),
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

    try:
        rows = fetch_all_rows_with_pagination(
            table_name="sales_reports",
            select_columns=SALES_REPORTS_SELECT_COLUMNS,
            batch_size=1000,
        )
        normalized = [normalize_sales_reports_row(row) for row in rows]
        filtered = apply_sales_reports_filters_in_memory(normalized, params, date_range, date_column)
        filtered = sorted(filtered, key=lambda r: (str(r.get("id") or "")))

        if after_id:
            cursor = after_id.strip()
            filtered = [row for row in filtered if str(row.get("id") or "") > cursor]
            raw = filtered[:limit]
        else:
            start = offset * limit
            raw = filtered[start : start + limit] if start < len(filtered) else []

        # Các trường cần loại bỏ khỏi response
        EXCLUDED_FIELDS = {
            "created_at", "created_by", "updated_at", "updated_by",
            "id_ns", "new_customer", "old_customer", "cross_sale",
            "customer_classification", "customer_old", "customer_new",
            "id_feedback", "id_mess_count", "firebase_id"
        }
        
        data = []
        for row in raw:
            formatted_row = {}
            for k, v in row.items():
                # Bỏ qua các trường không cần thiết
                if k in EXCLUDED_FIELDS:
                    continue
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




