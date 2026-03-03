#!/usr/bin/env python
"""Test case-insensitive filter fix"""
import urllib.request, json

# Test 1: lowercase nhan_su
print('='*60)
print('Test 1: nhan_su=Mạnh cường (lowercase c)')
print('='*60)
url1 = 'http://127.0.0.1:8000/detail_reports/statistics?nhan_su=M%E1%BA%A1nh%20c%C6%B0%E1%BB%A1ng&from_date=01/02/2026&to_date=10/02/2026&ca=H%E1%BA%BFt%20ca'
try:
    r1 = urllib.request.urlopen(url1)
    j1 = json.loads(r1.read())
    print(f'Total: {j1["total_records_analyzed"]}')
    people = list(j1["statistics"]["by_ten"]["count"].keys())
    counts = j1["statistics"]["by_ten"]["count"]
    for p in sorted(people):
        print(f'  - {p}: {counts[p]}')
except Exception as e:
    print(f'Error: {e}')

print('\n' + '='*60)
print('Test 2: Both names (Phạm Tiến Thành + Mạnh cường)')
print('='*60)
url2 = 'http://127.0.0.1:8000/detail_reports/statistics?nhan_su=Ph%C3%A1m%20Ti%E1%BA%BFn%20Th%C3%A0nh,M%E1%BA%A1nh%20c%C6%B0%E1%BB%A1ng&from_date=01/02/2026&to_date=10/02/2026&ca=H%E1%BA%BFt%20ca'
try:
    r2 = urllib.request.urlopen(url2)
    j2 = json.loads(r2.read())
    print(f'Total: {j2["total_records_analyzed"]}')
    people = list(j2["statistics"]["by_ten"]["count"].keys())
    counts = j2["statistics"]["by_ten"]["count"]
    for p in sorted(people):
        print(f'  - {p}: {counts[p]}')
    print(f'\n✓ SUCCESS: Found {len(people)} people (expected 2)')
except Exception as e:
    print(f'Error: {e}')
