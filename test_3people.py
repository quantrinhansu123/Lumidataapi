import urllib.request, json

# Test with the exact URL
url = 'http://127.0.0.1:8000/detail_reports/statistics?nhan_su=Ph%E1%BA%A1m%20Ti%E1%BA%BFn%20Th%C3%A0nh,M%E1%BA%A1nh%20c%C6%B0%E1%BB%9Dng,Nguy%E1%BB%85n%20Danh%20Nam&from_date=01/01/2026&to_date=10/02/2026&ca=H%E1%BA%BFt%20ca'

print('Testing 3 people with date range 01/01-10/02')
print('='*60)

try:
    r = urllib.request.urlopen(url) 
    j = json.loads(r.read())
    print(f'✓ Status: OK')
    print(f'Total analyzed: {j["total_records_analyzed"]}')
    
    if j["total_records_analyzed"] > 0:
        people = list(j["statistics"]["by_ten"]["count"].keys())
        print(f'\n✓ People found: {len(people)} (expected 3)')
        for p in sorted(people):
            cnt = j["statistics"]["by_ten"]["count"][p]
            print(f'  - {p}: {cnt}')
        
        if len(people) < 3:
            print('\n⚠️  Missing people:')
            expected = ['Phạm Tiến Thành', 'Mạnh Cương', 'Nguyễn Danh Nam']
            for e in expected:
                if e not in people:
                    print(f'  - {e}')
    else:
        print('⚠️  No records found!')
        print('Response:', json.dumps(j, indent=2, ensure_ascii=False)[:500])
        
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
