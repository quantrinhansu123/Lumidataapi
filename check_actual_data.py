"""Check actual data in database for the date range"""
import sys
sys.path.insert(0, '.')

from main import get_supabase, normalize_detail_reports_row, parse_date_only

supabase = get_supabase()

# Query all records
print("Querying detail_reports for 01/01-10/02/2026 with ca=Hết ca...")
print("="*60)

query = supabase.table("detail_reports").select("*").limit(5000)
result = query.execute()

all_reports = [normalize_detail_reports_row(row) for row in result.data]

# Filter for date range
from_date_str = parse_date_only("01/01/2026")
to_date_str = parse_date_only("10/02/2026")

print(f"Date range: {from_date_str} to {to_date_str}")

def normalize_date(date_val):
    if date_val is None:
        return None
    from datetime import datetime
    if isinstance(date_val, datetime):
        return date_val.strftime("%Y-%m-%d")
    raw = str(date_val).strip()
    if "T" in raw:
        raw = raw.split("T", 1)[0]
    return raw

in_date_range = [
    r for r in all_reports
    if from_date_str <= normalize_date(r.get("ngay")) <= to_date_str
]

print(f"Total records in date range: {len(in_date_range)}")

# Filter for ca=Hết ca
in_range_with_ca = [
    r for r in in_date_range
    if (r.get("ca") or "").lower() == "hết ca"
]

print(f"Records with ca=Hết ca: {len(in_range_with_ca)}")

# Check the 3 people
target_names = ["Phạm Tiến Thành", "Mạnh Cường", "Nguyễn Danh Nam", "Mạnh cường"]

print("\nData for target people:")
for target in target_names:
    found = [r for r in in_range_with_ca if r.get("ten", "").lower() == target.lower()]
    if found:
        print(f"  {target}: {len(found)} records")
    else:
        print(f"  {target}: NOT FOUND")

# Show unique people in this range
unique_people = set(r.get("ten") for r in in_range_with_ca if r.get("ten"))
print(f"\nTotal unique people in range: {len(unique_people)}")
for p in sorted(unique_people):
    cnt = len([r for r in in_range_with_ca if (r.get("ten") or "").lower() == (p or "").lower()])
    print(f"  - {p}: {cnt}")
