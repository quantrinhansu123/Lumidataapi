# Test Local - Hướng dẫn nhanh

## Server đang chạy tại:

```
http://localhost:8000
```

## Các API Endpoints

### 1. Sales Reports API
```
GET http://localhost:8000/sales_reports
```

**Ví dụ:**
```bash
# Lấy 10 records
curl "http://localhost:8000/sales_reports?limit=10"

# Lọc theo ngày
curl "http://localhost:8000/sales_reports?date=2026-01-02"

# Lọc theo tên
curl "http://localhost:8000/sales_reports?name=Lê Ngọc Đài Trang"
```

### 2. Calculate Order Count API (Vercel serverless)
```
GET http://localhost:3000/api/calculate-order-count?recordId={id}
```

**Lưu ý:** API này cần chạy `npm run dev` trong thư mục `orders-api` (Vercel dev server)

### 3. Swagger Documentation
```
http://localhost:8000/docs
```

## Test trong Browser

Mở trình duyệt và truy cập:

1. **Root:** http://localhost:8000/
2. **Sales Reports:** http://localhost:8000/sales_reports?limit=10
3. **Swagger Docs:** http://localhost:8000/docs

## Các Trường Mới Trong Response

API `/sales_reports` sẽ trả về các trường:

- `order_count` - Tổng số đơn
- `order_cancel_count_actual` - Số đơn hủy
- `revenue_actual` - Tổng doanh thu
- `revenue_cancel_actual` - Doanh thu từ đơn hủy
- `order_success_count` - Số đơn thành công

## Lưu ý

- Server FastAPI chạy tại port **8000**
- Server Vercel (nếu chạy) tại port **3000**
- Các trường tính toán = 0 nếu chưa được tính toán
- Cần gọi API `/api/calculate-order-count` để tính toán các giá trị
