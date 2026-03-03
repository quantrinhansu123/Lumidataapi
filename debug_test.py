import urllib.request
import json

# Test /orders with created_at filter
url = 'http://127.0.0.1:8000/orders?created_at=01/01/2026&limit=10'
with urllib.request.urlopen(url) as r:
    data = json.loads(r.read().decode())
    print(f"orders count={data['count']}")
    if data['count'] > 0:
        print(f"first order date: {data['data'][0].get('order_date')}")

# Test detail_reports/statistics
url2 = 'http://127.0.0.1:8000/detail_reports/statistics?from_date=01/01/2026&to_date=10/02/2026'
with urllib.request.urlopen(url2) as r2:
    data2 = json.loads(r2.read().decode())
    print(f"\ndetail_reports total_count={data2['statistics']['total_count']}")
