# Test Detail Reports API

## Bước 1: Khởi động Server

### Khởi động Vercel Dev (Port 3000)
```powershell
cd C:\Users\admin\Desktop\orders-api\orders-api
$env:SUPABASE_URL = "https://gsjhsmxyxyjqovauyrp.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI"
vercel dev --listen 3000
```

### FastAPI đã chạy (Port 8000)
- Đảm bảo FastAPI đang chạy trên port 8000

---

## Bước 2: Test API

### 1. Lấy một record ID từ detail_reports

Mở browser hoặc dùng curl:
```
http://localhost:8000/detail_reports?limit=1
```

Copy `id` từ response.

### 2. Tính toán cho record đó

Thay `YOUR_RECORD_ID` bằng ID vừa lấy:
```
http://localhost:3000/api/calculate-detail-report-count?recordId=YOUR_RECORD_ID
```

**Ví dụ:**
```
http://localhost:3000/api/calculate-detail-report-count?recordId=abc-123-def-456
```

### 3. Tính toán theo ngày

```
http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08
```

### 4. Tính toán theo ngày và tên nhân viên

```
http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08&name=Nguyễn Văn A
```

### 5. Debug matching

Thay `YOUR_RECORD_ID` bằng ID thực tế:
```
http://localhost:3000/api/debug-detail-matching?recordId=YOUR_RECORD_ID
```

---

## Response Mẫu

### Calculate Response:
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 1 detail reports",
  "updated": 1,
  "errors": 0,
  "total": 1,
  "data": [
    {
      "id": "abc-123",
      "Tên": "Nguyễn Văn A",
      "Ngày": "2026-03-08",
      "ca": "Hết ca",
      "Sản_phẩm": "Kem Body",
      "Thị_trường": "US",
      "order_count": 5,
      "order_cancel_count_actual": 1,
      "revenue_actual": 10000000,
      "revenue_cancel_actual": 2000000,
      "order_success_count": 4,
      "updated_fields": ["order_count", "order_cancel_count_actual", "revenue_actual", "revenue_cancel_actual", "order_success_count"]
    }
  ]
}
```

### Debug Response:
```json
{
  "success": true,
  "detail_report": {
    "id": "abc-123",
    "Tên": "Nguyễn Văn A",
    "Ngày": "2026-03-08",
    "ca": "Hết ca",
    "Sản_phẩm": "Kem Body",
    "Thị_trường": "US"
  },
  "matching_summary": {
    "total_orders_checked": 100,
    "matches": 5,
    "non_matches": 95
  },
  "matching_orders": [...],
  "non_matching_orders": [...]
}
```

---

## Chạy Script Test Tự Động

```powershell
cd C:\Users\admin\Desktop\orders-api\orders-api
.\test_detail_reports_api.ps1
```

---

## Lưu Ý

1. **Đảm bảo server đang chạy:** Port 3000 (Vercel Dev) và Port 8000 (FastAPI)
2. **Format ngày:** YYYY-MM-DD (ví dụ: 2026-03-08)
3. **Name matching:** Fuzzy matching, có thể bỏ dấu
4. **Ca matching:** Logic đặc biệt - "Hết ca" và "Giữa ca" đều nhận cả hai
