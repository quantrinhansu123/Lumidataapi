import urllib.request
import json

url = 'http://127.0.0.1:8000/detail_reports/statistics?from_date=01/03/2026&to_date=10/03/2026'
with urllib.request.urlopen(url) as r:
    data = json.loads(r.read().decode())
    
by_ten = data['statistics'].get('by_ten', {})
print('by_ten keys:', list(by_ten.keys()))

if by_ten.get('count'):
    first_staff = list(by_ten['count'].keys())[0]
    print(f'\nFirst staff: {first_staff}')
    print(f'  total_vnd: {by_ten.get("total_vnd", {}).get(first_staff)}')
    print(f'  total_sodon: {by_ten.get("total_sodon", {}).get(first_staff)}')
    print(f'  count (detail_reports): {by_ten.get("count", {}).get(first_staff)}')

# Check nested by_ngay -> by_ten
by_ngay = data['statistics'].get('by_ngay', {})
if by_ngay:
    first_day = list(by_ngay.keys())[0]
    day_by_ten = by_ngay[first_day].get('by_ten', {})
    print(f'\nDay {first_day} by_ten keys: {list(day_by_ten.keys())}')
    if day_by_ten.get('total_sodon'):
        print('  Has total_sodon: YES')
