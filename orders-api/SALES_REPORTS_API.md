# Sales Reports API - Link và Các Trường Mới

## Link API

### Local (FastAPI):
```
http://localhost:8000/sales_reports
```

### Production (Vercel):
```
https://lumidataapi.vercel.app/sales_reports
```

## Các Trường Mới Đã Thêm

API `/sales_reports` hiện đã trả về các trường tính toán tự động:

1. **`order_count`** - Tổng số đơn hàng khớp
2. **`order_cancel_count_actual`** - Số đơn hàng bị hủy (check_result="Hủy")
3. **`revenue_actual`** - Tổng doanh thu (total_amount_vnd)
4. **`revenue_cancel_actual`** - Tổng doanh thu từ đơn hủy
5. **`order_success_count`** - Số đơn thành công (order_count - order_cancel_count_actual)

## Ví dụ Request

### Local:
```bash
# Lấy tất cả sales_reports
curl "http://localhost:8000/sales_reports"

# Lấy với limit
curl "http://localhost:8000/sales_reports?limit=10"

# Lọc theo ngày
curl "http://localhost:8000/sales_reports?date=2026-01-02"

# Lọc theo tên nhân viên
curl "http://localhost:8000/sales_reports?name=Lê Ngọc Đài Trang"
```

### Production:
```bash
curl "https://lumidataapi.vercel.app/sales_reports?limit=10"
```

## Response Format

```json
{
  "data": [
    {
      "id": "02eac5ae-721b-4e11-bfcf-351e5f4bba42",
      "ten": "Lê Ngọc Đài Trang",
      "date": "2026-01-02",
      "ca": "Hết ca",
      "san_pham": "Bonavita Coffee",
      "thi_truong": "Canada",
      "team": "Team A",
      "order_count": 2,
      "order_cancel_count_actual": 0,
      "revenue_actual": 8400000,
      "revenue_cancel_actual": 0,
      "order_success_count": 2
    }
  ],
  "count": 1,
  "next_after_id": "02eac5ae-721b-4e11-bfcf-351e5f4bba42"
}
```

## Các Trường Có Sẵn

- `id` - ID bản ghi
- `ten` / `name` - Tên nhân viên
- `date` / `ngay` - Ngày báo cáo
- `ca` / `shift` - Ca làm việc
- `san_pham` / `product` - Sản phẩm
- `thi_truong` / `market` - Thị trường
- `team` - Team
- `cpqc` - CPQC
- `so_mess_cmt` - Số Mess/Cmt

## Các Trường Tính Toán (Mới)

- `order_count` - Tổng số đơn
- `order_cancel_count_actual` - Số đơn hủy
- `revenue_actual` - Tổng doanh thu
- `revenue_cancel_actual` - Doanh thu từ đơn hủy
- `order_success_count` - Số đơn thành công

## Lưu ý

1. **Các trường tính toán** được tự động tính và lưu vào database khi gọi API `/api/calculate-order-count`
2. **API `/sales_reports`** chỉ đọc dữ liệu từ database, không tính toán
3. Nếu các trường tính toán = `null` hoặc `0`, cần gọi API tính toán trước:
   ```
   GET /api/calculate-order-count?recordId={id}
   ```

## Chạy Local

```bash
cd orders-api
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Sau đó test:
```
http://localhost:8000/sales_reports?limit=10
```
