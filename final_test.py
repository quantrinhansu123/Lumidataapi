import urllib.request
import json

# Test with date range that includes 2026-03-01 when orders were created
url = 'http://127.0.0.1:8000/detail_reports/statistics?from_date=01/03/2026&to_date=10/03/2026'
try:
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read().decode())
        print(f"total_count={data['statistics']['total_count']}")
        print(f"total_cpqc={data['statistics']['total_cpqc']}")
        print(f"gia_mess={data['statistics']['gia_mess']}")
except Exception as e:
    print(f"Error: {e}")
