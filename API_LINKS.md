# Link API - Đã Deploy Thành Công! 🎉

## Base URL
```
https://lumidataapi.vercel.app
```

## API Endpoints

### 1. Tính toán order_count
```
GET/POST https://lumidataapi.vercel.app/api/calculate-order-count
```

**Ví dụ sử dụng:**
```bash
# Tính toán cho một record cụ thể
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=123"

# Tính toán cho tất cả records trong một ngày
curl "https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-01-15"

# Tính toán cho các records chưa có order_count
curl "https://lumidataapi.vercel.app/api/calculate-order-count"

# Tính toán lại tất cả records
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recalculateAll=true"
```

### 2. Webhook handler
```
POST https://lumidataapi.vercel.app/api/webhook-sales-reports
```

**Ví dụ sử dụng:**
```bash
curl -X POST "https://lumidataapi.vercel.app/api/webhook-sales-reports" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "record": {
      "id": "123",
      "name": "Nguyễn Văn A",
      "date": "2026-01-15",
      "shift": "Hết ca",
      "product": "SP1",
      "market": "VN"
    }
  }'
```

### 3. API cũ (FastAPI - vẫn hoạt động)
```
GET https://lumidataapi.vercel.app/orders
GET https://lumidataapi.vercel.app/detail_reports
GET https://lumidataapi.vercel.app/sales_reports
```

---

## Test API ngay

### Test trong Browser:
Mở trình duyệt và truy cập:
```
https://lumidataapi.vercel.app/api/calculate-order-count?recordId=123
```

### Test bằng curl:
```bash
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=123"
```

### Test bằng Postman/Insomnia:
- **Method:** GET
- **URL:** `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=123`

---

## Cấu hình Webhook trong Supabase

Nếu muốn tự động tính toán khi có record mới:

1. Vào Supabase Dashboard → Database → Webhooks
2. Tạo webhook mới:
   - **Table:** `sales_reports`
   - **Events:** `INSERT`, `UPDATE`
   - **URL:** `https://lumidataapi.vercel.app/api/webhook-sales-reports`
   - **Method:** `POST`

---

## Lưu ý

1. **Environment Variables:** Đảm bảo đã set `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` trong Vercel Dashboard
2. **Nếu API báo lỗi:** Kiểm tra environment variables và redeploy
3. **Timeout:** Vercel có timeout 10s (Hobby) hoặc 60s (Pro), nếu có quá nhiều records có thể bị timeout

---

## Response Format

### Thành công:
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 10 records",
  "updated": 10,
  "errors": 0,
  "total": 10,
  "data": [
    {
      "id": "123",
      "name": "Nguyễn Văn A",
      "date": "2026-01-15",
      "order_count": 5
    }
  ]
}
```

### Lỗi:
```json
{
  "success": false,
  "message": "Missing Supabase configuration",
  "error": "Configuration error"
}
```
