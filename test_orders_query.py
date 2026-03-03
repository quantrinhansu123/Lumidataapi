#!/usr/bin/env python3
import sys
sys.path.insert(0, '.')

from main import get_supabase, parse_date_param

# Test query orders without filter
print("Testing orders query...")
supabase = get_supabase()

try:
    orders_no_filter = supabase.table("orders").select("marketing_staff, total_vnd, created_at").limit(5).execute()
    print(f"✓ Orders without filter: {len(orders_no_filter.data)} records")
    for row in orders_no_filter.data[:3]:
        print(f"  - {row.get('marketing_staff')}: {row.get('total_vnd')}, created_at: {row.get('created_at')}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test with date filter
print("\nTesting orders query with date range...")
try:
    from_date = "01/01/2026"
    to_date = "10/02/2026"
    
    parsed_from = parse_date_param(from_date)
    parsed_to = parse_date_param(to_date)
    
    print(f"from_date: {from_date} → {parsed_from}")
    print(f"to_date: {to_date} → {parsed_to}")
    
    if parsed_from and parsed_to:
        day_start, _ = parsed_from
        _, day_end = parsed_to
        
        query = supabase.table("orders").select("marketing_staff, total_vnd, created_at")
        query = query.gte("created_at", day_start)
        query = query.lte("created_at", day_end)
        
        result = query.limit(5).execute()
        print(f"✓ Orders with date filter: {len(result.data)} records")
        for row in result.data[:3]:
            print(f"  - {row.get('marketing_staff')}: {row.get('total_vnd')}, created_at: {row.get('created_at')}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
