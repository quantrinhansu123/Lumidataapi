#!/usr/bin/env python3
import requests
import json

# Test GET endpoint with nhan_su parameter
url = "http://127.0.0.1:8000/detail_reports/statistics"
params = {
    "nhan_su": "Phạm Tiến Thành,Mạnh Cường",
    "from_date": "01/01/2026",
    "to_date": "10/02/2026",
    "ca": "Hết ca"
}

print(f"Testing: {url}")
print(f"Params: {params}\n")

try:
    resp = requests.get(url, params=params)
    print(f"Status: {resp.status_code}")
    
    data = resp.json()
    stats = data.get("statistics", {})
    
    print(f"Total records analyzed: {data.get('total_records_analyzed')}")
    print(f"\nStatistics keys: {list(stats.keys())}")
    print(f"by_ten keys: {list(stats.get('by_ten', {}).keys())}")
    
    print("\n=== by_ten breakdown ===")
    by_ten = stats.get("by_ten", {})
    print(json.dumps(by_ten, indent=2, ensure_ascii=False))
    
    # Check if total_vnd exists
    if "total_vnd" in by_ten:
        print("✓ total_vnd found in by_ten")
    else:
        print("✗ total_vnd NOT found in by_ten")
        print(f"  Available keys: {list(by_ten.keys())}")
        
except Exception as e:
    print(f"Error: {e}")
    print(f"Response: {resp.text if 'resp' in locals() else 'N/A'}")
