# Công thức tính toán các giá trị

## Các giá trị được tính tự động

### 1. `order_count`
**Mô tả:** Tổng số đơn hàng khớp với điều kiện

**Logic:**
- Đếm tất cả orders khớp với sales report theo các điều kiện:
  - Name matching
  - Date matching
  - Shift matching
  - Product matching (optional)
  - Market matching (optional)

---

### 2. `order_cancel_count_actual`
**Mô tả:** Số đơn hàng bị hủy (check_result = "Hủy")

**Logic:**
- Đếm các orders khớp với sales report **VÀ** có `check_result = "Hủy"`
- So sánh `check_result` sau khi normalize (trim, lowercase)
- Match nếu `check_result` normalized = `"hủy"`

**Công thức:**
```
order_cancel_count_actual = COUNT(orders WHERE match conditions AND check_result = "Hủy")
```

---

### 3. `revenue_actual`
**Mô tả:** Tổng doanh thu từ các đơn hàng khớp

**Logic:**
- Tính tổng cột `total_amount_vnd` của tất cả orders khớp với sales report

**Công thức:**
```
revenue_actual = SUM(total_amount_vnd) WHERE match conditions
```

---

### 4. `revenue_cancel_actual`
**Mô tả:** Tổng doanh thu từ các đơn hàng bị hủy

**Logic:**
- Tính tổng cột `total_amount_vnd` của các orders khớp **VÀ** có `check_result = "Hủy"`

**Công thức:**
```
revenue_cancel_actual = SUM(total_amount_vnd) WHERE match conditions AND check_result = "Hủy"
```

---

### 5. `order_success_count`
**Mô tả:** Số đơn hàng thành công (không bị hủy)

**Logic:**
- Tính bằng cách lấy tổng số đơn trừ đi số đơn hủy

**Công thức:**
```
order_success_count = order_count - order_cancel_count_actual
```

---

## Ví dụ

### Sales Report:
```json
{
  "id": "02eac5ae-721b-4e11-bfcf-351e5f4bba42",
  "name": "Lê Ngọc Đài Trang",
  "date": "2026-01-02",
  "shift": "Hết ca",
  "product": "Bonavita Coffee",
  "market": "Canada"
}
```

### Orders khớp:
1. Order 1: `check_result = null`, `total_amount_vnd = 500000`
2. Order 2: `check_result = "Hủy"`, `total_amount_vnd = 300000`
3. Order 3: `check_result = null`, `total_amount_vnd = 400000`

### Kết quả tính toán:
```json
{
  "order_count": 3,
  "order_cancel_count_actual": 1,
  "revenue_actual": 1200000,
  "revenue_cancel_actual": 300000,
  "order_success_count": 2
}
```

---

## Response Format

API sẽ trả về tất cả các giá trị:

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
      "order_count": 3,
      "order_cancel_count_actual": 1,
      "revenue_actual": 1200000,
      "revenue_cancel_actual": 300000,
      "order_success_count": 2
    }
  ]
}
```

---

## Lưu ý

1. **check_result matching:**
   - So sánh sau khi normalize (trim, lowercase)
   - `"Hủy"` → normalize → `"hủy"`
   - `"HỦY"` → normalize → `"hủy"` ✅
   - `"hủy"` → normalize → `"hủy"` ✅

2. **total_amount_vnd:**
   - Nếu giá trị là `null` hoặc không phải số → tính là `0`
   - Sử dụng `parseFloat()` để chuyển đổi

3. **Tất cả giá trị được tự động ghi vào Supabase:**
   - Khi gọi API, tất cả 5 giá trị sẽ được cập nhật vào bảng `sales_reports`
   - Không cần thao tác thủ công

---

## API Endpoints

### Tính toán cho một record:
```
GET https://lumidataapi.vercel.app/api/calculate-order-count?recordId={id}
```

### Tính toán theo ngày:
```
GET https://lumidataapi.vercel.app/api/calculate-order-count?date=YYYY-MM-DD
```

### Tính toán tất cả:
```
GET https://lumidataapi.vercel.app/api/calculate-order-count?recalculateAll=true
```
