# 📋 Tổng Hợp Link API

## 🌐 Production (Vercel - Đã Deploy)

### Base URL
```
https://lumidataapi.vercel.app
```

### 1. Tính toán order_count và các chỉ số
```
GET https://lumidataapi.vercel.app/api/calculate-order-count
```

**Query Parameters:**
- `recordId` - Tính cho 1 record cụ thể
- `date` - Tính cho tất cả records trong ngày (format: YYYY-MM-DD)
- `name` hoặc `sale_staff` - Lọc theo tên nhân viên (fuzzy matching)
- `recalculateAll=true` - Tính lại tất cả records

**Ví dụ:**
```
https://lumidataapi.vercel.app/api/calculate-order-count?recordId=0000323c-53c0-44c0-a6c1-93d62dd499c0
https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-03-08
https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-03-08&name=Nguyễn Văn A
https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-03-08&name=Nguyễn Văn A&recalculateAll=true
```

### 2. Sales Reports API
```
GET https://lumidataapi.vercel.app/sales_reports
```

**Query Parameters:**
- `date` - Lọc theo ngày (format: DD/MM/YYYY)
- `from_date` - Từ ngày (format: DD/MM/YYYY)
- `to_date` - Đến ngày (format: DD/MM/YYYY)
- `product` - Lọc theo sản phẩm
- `market` - Lọc theo thị trường
- `sale_staff` - Lọc theo tên nhân viên

**Ví dụ:**
```
https://lumidataapi.vercel.app/sales_reports?from_date=08/03/2026&to_date=10/03/2026
https://lumidataapi.vercel.app/sales_reports?date=08/03/2026&product=Kem Body&market=US
```

### 3. Orders API
```
GET https://lumidataapi.vercel.app/orders
```

**Query Parameters:**
- `date` - Lọc theo ngày (format: DD/MM/YYYY)
- `from_date` - Từ ngày
- `to_date` - Đến ngày
- `sale_staff` - Lọc theo tên nhân viên
- `product` - Lọc theo sản phẩm
- `country` - Lọc theo thị trường

**Ví dụ:**
```
https://lumidataapi.vercel.app/orders?from_date=08/03/2026&to_date=10/03/2026
https://lumidataapi.vercel.app/orders?date=08/03/2026&sale_staff=Nguyễn Văn A
```

### 4. Debug Matching (Kiểm tra logic matching cho sales_reports)
```
GET https://lumidataapi.vercel.app/api/debug-matching?recordId=YOUR_RECORD_ID
```

### 5. Tính toán order_count cho detail_reports
```
GET https://lumidataapi.vercel.app/api/calculate-detail-report-count
```

**Query Parameters:**
- `recordId` - Tính cho 1 record cụ thể
- `date` - Tính cho tất cả records trong ngày (format: YYYY-MM-DD)
- `name`, `ten`, hoặc `Tên` - Lọc theo tên nhân viên (fuzzy matching)
- `recalculateAll=true` - Tính lại tất cả records

**Ví dụ:**
```
https://lumidataapi.vercel.app/api/calculate-detail-report-count?recordId=YOUR_RECORD_ID
https://lumidataapi.vercel.app/api/calculate-detail-report-count?date=2026-03-08
https://lumidataapi.vercel.app/api/calculate-detail-report-count?date=2026-03-08&name=Nguyễn Văn A
```

### 6. Debug Matching cho detail_reports
```
GET https://lumidataapi.vercel.app/api/debug-detail-matching?recordId=YOUR_RECORD_ID
```

---

## 💻 Local Development

### Base URL
```
http://localhost:3000  (Vercel Dev - TypeScript functions)
http://localhost:8000  (FastAPI - Python)
```

### 1. Tính toán order_count (Local)
```
GET http://localhost:3000/api/calculate-order-count?recordId=YOUR_RECORD_ID
GET http://localhost:3000/api/calculate-order-count?date=2026-03-08
```

### 2. Sales Reports API (Local)
```
GET http://localhost:8000/sales_reports?from_date=08/03/2026&to_date=10/03/2026
GET http://localhost:8000/sales_reports?date=08/03/2026
```

### 3. Orders API (Local)
```
GET http://localhost:8000/orders?from_date=08/03/2026&to_date=10/03/2026
GET http://localhost:8000/orders?date=08/03/2026
```

### 4. Debug Matching cho sales_reports (Local)
```
GET http://localhost:3000/api/debug-matching?recordId=YOUR_RECORD_ID
```

### 5. Tính toán order_count cho detail_reports (Local)
```
GET http://localhost:3000/api/calculate-detail-report-count?recordId=YOUR_RECORD_ID
GET http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08
GET http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08&name=Nguyễn Văn A
```

### 6. Debug Matching cho detail_reports (Local)
```
GET http://localhost:3000/api/debug-detail-matching?recordId=YOUR_RECORD_ID
```

---

## 📊 Các Link Thường Dùng

### Tính toán theo ngày hàng loạt
```
Production: https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-03-08
Local:      http://localhost:3000/api/calculate-order-count?date=2026-03-08
```

### Tính toán theo ngày và tên nhân viên
```
Production: https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-03-08&name=Nguyễn Văn A
Local:      http://localhost:3000/api/calculate-order-count?date=2026-03-08&name=Nguyễn Văn A
```

### Xem sales reports theo ngày
```
Production: https://lumidataapi.vercel.app/sales_reports?from_date=08/03/2026&to_date=10/03/2026
Local:      http://localhost:8000/sales_reports?from_date=08/03/2026&to_date=10/03/2026
```

### Xem orders theo ngày
```
Production: https://lumidataapi.vercel.app/orders?from_date=08/03/2026&to_date=10/03/2026
Local:      http://localhost:8000/orders?from_date=08/03/2026&to_date=10/03/2026
```

### Debug tại sao tính sai (sales_reports)
```
Production: https://lumidataapi.vercel.app/api/debug-matching?recordId=YOUR_RECORD_ID
Local:      http://localhost:3000/api/debug-matching?recordId=YOUR_RECORD_ID
```

### Tính toán cho detail_reports theo ngày
```
Production: https://lumidataapi.vercel.app/api/calculate-detail-report-count?date=2026-03-08
Local:      http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08
```

### Debug tại sao tính sai (detail_reports)
```
Production: https://lumidataapi.vercel.app/api/debug-detail-matching?recordId=YOUR_RECORD_ID
Local:      http://localhost:3000/api/debug-detail-matching?recordId=YOUR_RECORD_ID
```

---

## ⚙️ Khởi động Local Server

### Khởi động Vercel Dev (Port 3000)
```bash
cd orders-api
npm run start
```

### Khởi động FastAPI (Port 8000)
```bash
cd orders-api
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📝 Response Format

### Calculate Order Count Response
```json
{
  "success": true,
  "message": "Successfully calculated",
  "updated": 1,
  "data": [
    {
      "id": "abc-123",
      "name": "Nguyễn Văn A",
      "date": "2026-03-08",
      "product": "Kem Body",
      "market": "US",
      "shift": "Hết ca",
      "order_count": 5,
      "order_cancel_count_actual": 1,
      "revenue_actual": 10000000,
      "revenue_cancel_actual": 2000000,
      "order_success_count": 4
    }
  ]
}
```
