import requests
import json

# Test 1: chỉ Phạm Tiến Thành
url1 = "http://127.0.0.1:8000/detail_reports/statistics?nhan_su=Phạm Tiến Thành&from_date=01/02/2026&to_date=10/02/2026&ca=Hết ca"
print("Test 1: Chỉ Phạm Tiến Thành")
r1 = requests.get(url1)
d1 = r1.json()
print(f"Total: {d1['total_records_analyzed']}")
print(f"People: {list(d1['statistics']['by_ten']['count'].keys())}")

# Test 2: cả 2 người
url2 = "http://127.0.0.1:8000/detail_reports/statistics?nhan_su=Phạm Tiến Thành,Mạnh cường&from_date=01/02/2026&to_date=10/02/2026&ca=Hết ca"
print("\nTest 2: Cả 2 người (Phạm Tiến Thành, Mạnh cường)")
r2 = requests.get(url2)
d2 = r2.json()
print(f"Total: {d2['total_records_analyzed']}")
print(f"People: {list(d2['statistics']['by_ten']['count'].keys())}")

# Test 3: không filter ca
url3 = "http://127.0.0.1:8000/detail_reports/statistics?nhan_su=Phạm Tiến Thành,Mạnh cường&from_date=01/02/2026&to_date=10/02/2026"
print("\nTest 3: Cả 2 người (KHÔNG filter ca)")
r3 = requests.get(url3)
d3 = r3.json()
print(f"Total: {d3['total_records_analyzed']}")
print(f"People: {list(d3['statistics']['by_ten']['count'].keys())}")

print("\n" + "="*50)
print("SUMMARY:")
print(f"- Test 2 people WITH ca filter: {d2['total_records_analyzed']} records")
print(f"- People found: {list(d2['statistics']['by_ten']['count'].keys())}")
if d2['total_records_analyzed'] > 0 and len(d2['statistics']['by_ten']['count']) < 2:
    print("⚠️  BUG: Expected 2 people but got 1!")
