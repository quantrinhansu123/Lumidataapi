#!/usr/bin/env python
"""Test to verify data issue"""
import sys
sys.path.insert(0, '.')

from main import get_supabase, normalize_detail_reports_row, apply_detail_reports_filters_in_memory

# Connect to database
supabase = get_supabase()

# Query all data for date range
print("=" * 60)
print("Querying ALL detail_reports for 01/02-10/02/2026...")
print("=" * 60)

query = supabase.table("detail_reports").select("*").limit(1000)
result = query.execute()

all_reports = [normalize_detail_reports_row(row) for row in result.data]
print(f"Total records: {len(all_reports)}")

# Group by ten
by_name = {}
for row in all_reports:
    ten = row.get("ten", "Unknown")
    if ten not in by_name:
        by_name[ten] = {"total": 0, "by_ca": {}}
    by_name[ten]["total"] += 1
    ca = row.get("ca", "Unknown")
    by_name[ten]["by_ca"][ca] = by_name[ten]["by_ca"].get(ca, 0) + 1

print("\nRecords by name and ca:")
for name in sorted(by_name.keys()):
    print(f"\n{name}: {by_name[name]['total']} records")
    for ca, count in sorted(by_name[name]['by_ca'].items()):
        print(f"  - {ca}: {count}")

# Check specific names
print("\n" + "=" * 60)
phạm_records = [r for r in all_reports if r.get("ten") == "Phạm Tiến Thành"]
mạnh_records = [r for r in all_reports if r.get("ten") == "Mạnh cường"]

print(f"\nPhạm Tiến Thành (ca=Hết ca): {len([r for r in phạm_records if r.get('ca') == 'Hết ca'])}")
print(f"Mạnh cường (ca=Hết ca): {len([r for r in mạnh_records if r.get('ca') == 'Hết ca'])}")
print(f"Mạnh cường (any ca): {len(mạnh_records)}")

if mạnh_records:
    print(f"\nMạnh cường's ca values: {set([r.get('ca') for r in mạnh_records])}")
