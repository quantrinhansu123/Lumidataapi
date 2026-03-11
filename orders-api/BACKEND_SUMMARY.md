# Backend Tính Toán Số Đơn của Sale - Tóm Tắt

## ✅ Đã có Backend tính toán

Backend service đã được tạo và deploy, tự động tính toán các giá trị cho bảng `sales_reports`.

## API Endpoints

### 1. Tính toán số đơn và các giá trị liên quan

**Endpoint:**
```
GET/POST https://lumidataapi.vercel.app/api/calculate-order-count
```

**Query Parameters:**
- `recordId` (optional): Tính toán cho một record cụ thể
- `date` (optional): Tính toán cho tất cả records trong một ngày
- `recalculateAll` (optional): Tính toán lại tất cả records

**Ví dụ:**
```bash
# Tính toán cho một record
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=02eac5ae-721b-4e11-bfcf-351e5f4bba42"

# Tính toán cho một ngày
curl "https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-01-02"

# Tính toán lại tất cả
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recalculateAll=true"
```

### 2. Webhook tự động (Tùy chọn)

**Endpoint:**
```
POST https://lumidataapi.vercel.app/api/webhook-sales-reports
```

Tự động tính toán khi có record mới/cập nhật trong `sales_reports`.

### 3. Debug matching (Để kiểm tra logic)

**Endpoint:**
```
GET https://lumidataapi.vercel.app/api/debug-matching?recordId={id}
```

## Các Giá Trị Được Tính Toán

Backend tự động tính và **ghi vào Supabase** các giá trị sau:

### 1. `order_count`
- **Mô tả:** Tổng số đơn hàng khớp với điều kiện
- **Logic:** Đếm tất cả orders khớp (name, date, product, market) - **Bỏ qua shift**

### 2. `order_cancel_count_actual`
- **Mô tả:** Số đơn hàng bị hủy
- **Logic:** Đếm orders khớp **VÀ** có `check_result = "Hủy"`

### 3. `revenue_actual`
- **Mô tả:** Tổng doanh thu
- **Logic:** Tổng `total_amount_vnd` của tất cả orders khớp

### 4. `revenue_cancel_actual`
- **Mô tả:** Tổng doanh thu từ đơn hủy
- **Logic:** Tổng `total_amount_vnd` của orders hủy

### 5. `order_success_count`
- **Mô tả:** Số đơn thành công
- **Logic:** `order_count - order_cancel_count_actual`

## Logic Matching

Một order được đếm nếu **TẤT CẢ** điều kiện sau khớp:

1. **Name:** `name` (sales_reports) = `sale_staff` (orders)
2. **Sale Name:** (Optional) `sale_name` (sales_reports) = `sale_staff` (orders) - nếu có
3. **Date:** `date` (sales_reports) = `order_date` (orders)
4. **Shift:** ~~Bỏ qua~~ (không kiểm tra shift)
5. **Product:** (Optional) `product` (sales_reports) = `product` (orders)
6. **Market:** (Optional) `market` (sales_reports) = `country` (orders)

## Tự Động Ghi Vào Supabase

✅ **Sau khi tính toán xong, tất cả giá trị tự động được ghi vào bảng `sales_reports`**

Không cần thao tác thủ công!

## Response Format

```json
{
  "success": true,
  "message": "Successfully calculated statistics for 1 records",
  "updated": 1,
  "errors": 0,
  "total": 1,
  "data": [
    {
      "id": "02eac5ae-721b-4e11-bfcf-351e5f4bba42",
      "name": "Lê Ngọc Đài Trang",
      "date": "2026-01-02",
      "shift": "Hết ca",
      "product": "Bonavita Coffee",
      "market": "Canada",
      "order_count": 2,
      "order_cancel_count_actual": 0,
      "revenue_actual": 8400000,
      "revenue_cancel_actual": 0,
      "order_success_count": 2
    }
  ]
}
```

## Link API

- **Production:** https://lumidataapi.vercel.app/api/calculate-order-count
- **Local (nếu chạy Vercel dev):** http://localhost:3000/api/calculate-order-count

## Tài Liệu

- [README_ORDER_COUNT.md](./README_ORDER_COUNT.md) - Tài liệu đầy đủ
- [CALCULATION_FORMULAS.md](./CALCULATION_FORMULAS.md) - Công thức tính toán
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - Hướng dẫn tích hợp frontend
