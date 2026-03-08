"""
Script de debug filter team/shift
Kiem tra du lieu thuc te trong DB
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://gsjhsmxyxjyiqovauyrp.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_vXBSa3eP8cvjIK2qLWI6Ug_FoYm4CNy")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 60)
print("DEBUG: Kiem tra du lieu orders voi filter team/shift")
print("=" * 60)

# 1. Kiem tra co du lieu trong khoang thoi gian khong
print("\n1. Kiem tra du lieu trong khoang 01/01/2026 - 31/01/2026 (khong filter team):")
try:
    result = supabase.table("orders").select("id, order_date, shift, team").gte("order_date", "2026-01-01").lte("order_date", "2026-01-31").limit(10).execute()
    print(f"   So ban ghi tim thay: {len(result.data)}")
    if result.data:
        print("   Mau du lieu:")
        for i, row in enumerate(result.data[:5], 1):
            print(f"   {i}. id={row.get('id')}, order_date={row.get('order_date')}, shift={repr(row.get('shift'))}, team={repr(row.get('team'))}")
    else:
        print("   WARNING: Khong co du lieu trong khoang thoi gian nay!")
except Exception as e:
    print(f"   ERROR: {e}")

# 2. Kiem tra cac gia tri unique cua shift
print("\n2. Kiem tra cac gia tri unique cua cot 'shift':")
try:
    # Lấy một số bản ghi để xem các giá trị shift
    result = supabase.table("orders").select("shift").limit(1000).execute()
    shifts = set()
    for row in result.data:
        shift_val = row.get('shift')
        if shift_val:
            shifts.add(str(shift_val).strip())
    
    print(f"   Tim thay {len(shifts)} gia tri unique cua shift:")
    sorted_shifts = sorted(shifts)
    for i, shift in enumerate(sorted_shifts[:20], 1):  # Hien thi 20 gia tri dau
        print(f"   {i}. {repr(shift)}")
    
    # Kiem tra xem co gia tri nao chua "HCM" khong
    hcm_shifts = [s for s in shifts if 'HCM' in s.upper() or 'hcm' in s.lower()]
    if hcm_shifts:
        print(f"\n   OK: Tim thay {len(hcm_shifts)} gia tri chua 'HCM':")
        for shift in hcm_shifts:
            print(f"      - {repr(shift)}")
    else:
        print(f"\n   WARNING: Khong tim thay gia tri nao chua 'HCM'")
        
except Exception as e:
    print(f"   ERROR: {e}")

# 3. Kiem tra cac gia tri unique cua team
print("\n3. Kiem tra cac gia tri unique cua cot 'team':")
try:
    result = supabase.table("orders").select("team").limit(1000).execute()
    teams = set()
    for row in result.data:
        team_val = row.get('team')
        if team_val:
            teams.add(str(team_val).strip())
    
    print(f"   Tim thay {len(teams)} gia tri unique cua team:")
    sorted_teams = sorted(teams)
    for i, team in enumerate(sorted_teams[:20], 1):
        print(f"   {i}. {repr(team)}")
        
except Exception as e:
    print(f"   ERROR: {e}")

# 4. Test filter voi cac gia tri shift khac nhau
print("\n4. Test filter voi cac gia tri shift khac nhau:")
test_shifts = ["HCM", "hcm", "Hcm", "Morning", "Evening"]
for test_shift in test_shifts:
    try:
        result = supabase.table("orders").select("id, order_date, shift").gte("order_date", "2026-01-01").lte("order_date", "2026-01-31").eq("shift", test_shift).limit(5).execute()
        print(f"   shift='{test_shift}': {len(result.data)} ban ghi")
    except Exception as e:
        print(f"   shift='{test_shift}': ERROR - {e}")

# 5. Kiem tra du lieu gan day nhat
print("\n5. Kiem tra du lieu gan day nhat (khong filter date):")
try:
    result = supabase.table("orders").select("id, order_date, shift, team").order("order_date", desc=True).limit(10).execute()
    print(f"   So ban ghi: {len(result.data)}")
    if result.data:
        print("   Du lieu gan day nhat:")
        for i, row in enumerate(result.data[:5], 1):
            print(f"   {i}. order_date={row.get('order_date')}, shift={repr(row.get('shift'))}, team={repr(row.get('team'))}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "=" * 60)
print("Hoan thanh debug!")
print("=" * 60)
