# Tính Toán Order Count cho Detail Reports

## Tổng Quan

API tính toán các chỉ số cho bảng `detail_reports` dựa trên việc đếm và tính tổng từ bảng `orders` theo các điều kiện matching đặc biệt.

---

## Điều Kiện Matching

Một order được tính vào `order_count` nếu **TẤT CẢ** các điều kiện sau đều khớp:

### 1. **Matching theo Nhân Viên (Bắt buộc)**

```
Tên (detail_reports) = marketing_staff (orders)
```

**Chi tiết:**
- Lấy tên từ: `detail_reports.Tên` hoặc `detail_reports.ten` hoặc `detail_reports.name`
- So sánh với: `orders.marketing_staff`
- **Fuzzy matching:** Bỏ dấu, lowercase, có thể chứa nhau

### 2. **Matching theo Ngày (Bắt buộc)**

```
Ngày (detail_reports) = order_date (orders)
```

**Chi tiết:**
- Format chuẩn: `YYYY-MM-DD` (ví dụ: `2026-03-08`)
- Tự động normalize từ các format khác nhau

### 3. **Matching theo Ca (Bắt buộc - Logic đặc biệt)**

```
ca (detail_reports) = shift (orders)
```

**Logic đặc biệt:**
- **"Hết ca"** sẽ nhận cả **"Hết ca"** và **"Giữa ca"**
- **"Giữa ca"** sẽ nhận cả **"Hết ca"** và **"Giữa ca"**
- Các ca khác: exact match hoặc contains

**Ví dụ:**
- `detail_reports.ca = "Hết ca"` → match với `orders.shift = "Hết ca"` hoặc `"Giữa ca"`
- `detail_reports.ca = "Giữa ca"` → match với `orders.shift = "Hết ca"` hoặc `"Giữa ca"`

### 4. **Matching theo Sản Phẩm (Tùy chọn - chỉ kiểm tra nếu có)**

```
Sản_phẩm (detail_reports) = product (orders)
```

**Chi tiết:**
- Nếu `detail_reports.Sản_phẩm` có giá trị → phải khớp chính xác (case-insensitive)
- Nếu `detail_reports.Sản_phẩm` = null hoặc rỗng → **BỎ QUA** điều kiện này

### 5. **Matching theo Thị Trường (Tùy chọn - chỉ kiểm tra nếu có)**

```
Thị_trường (detail_reports) = country (orders)
```

**Chi tiết:**
- Nếu `detail_reports.Thị_trường` có giá trị → phải khớp chính xác (case-insensitive)
- Nếu `detail_reports.Thị_trường` = null hoặc rỗng → **BỎ QUA** điều kiện này

---

## Công Thức Tính Toán

### 1. `order_count` - Tổng số đơn hàng

```
order_count = COUNT(orders WHERE 
  Tên matches marketing_staff AND
  Ngày = order_date AND
  ca matches shift (với logic đặc biệt) AND
  (Sản_phẩm matches OR Sản_phẩm is empty) AND
  (Thị_trường matches OR Thị_trường is empty)
)
```

### 2. `order_cancel_count_actual` - Số đơn hủy

```
order_cancel_count_actual = COUNT(orders WHERE 
  (điều kiện matching như trên) AND
  check_result = "Hủy"
)
```

### 3. `revenue_actual` - Tổng doanh thu

```
revenue_actual = SUM(total_amount_vnd) của tất cả orders đã match
```

### 4. `revenue_cancel_actual` - Doanh thu từ đơn hủy

```
revenue_cancel_actual = SUM(total_amount_vnd) của các orders đã match VÀ check_result = "Hủy"
```

### 5. `order_success_count` - Số đơn thành công

```
order_success_count = order_count - order_cancel_count_actual
```

---

## API Endpoints

### 1. Tính toán order_count

**Production:**
```
GET https://lumidataapi.vercel.app/api/calculate-detail-report-count
```

**Local:**
```
GET http://localhost:3000/api/calculate-detail-report-count
```

**Query Parameters:**
- `recordId` - Tính cho 1 record cụ thể
- `date` - Tính cho tất cả records trong ngày (format: YYYY-MM-DD)
- `name`, `ten`, hoặc `Tên` - Lọc theo tên nhân viên (fuzzy matching)
- `recalculateAll=true` - Tính lại tất cả records

**Ví dụ:**
```
https://lumidataapi.vercel.app/api/calculate-detail-report-count?recordId=abc-123
https://lumidataapi.vercel.app/api/calculate-detail-report-count?date=2026-03-08
https://lumidataapi.vercel.app/api/calculate-detail-report-count?date=2026-03-08&name=Nguyễn Văn A
```

### 2. Debug Matching

**Production:**
```
GET https://lumidataapi.vercel.app/api/debug-detail-matching?recordId=YOUR_RECORD_ID
```

**Local:**
```
GET http://localhost:3000/api/debug-detail-matching?recordId=YOUR_RECORD_ID
```

**Response:** Hiển thị chi tiết từng điều kiện matching và lý do tại sao match hoặc không match.

---

## Response Format

### Thành công:
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 10 detail reports",
  "updated": 10,
  "errors": 0,
  "total": 10,
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

---

## So Sánh với Sales Reports

| Điểm khác biệt | Sales Reports | Detail Reports |
|---------------|--------------|---------------|
| **Tên nhân viên** | `name` → `sale_staff` | `Tên` → `marketing_staff` |
| **Ngày** | `date` → `order_date` | `Ngày` → `order_date` |
| **Ca** | Bỏ qua (không kiểm tra) | **Kiểm tra với logic đặc biệt** |
| **Sản phẩm** | `product` → `product` | `Sản_phẩm` → `product` |
| **Thị trường** | `market` → `country` | `Thị_trường` → `country` |

---

## Lưu Ý Quan Trọng

1. **Name matching là fuzzy:** Bỏ dấu, lowercase, có thể chứa nhau
2. **Date phải khớp chính xác:** Format YYYY-MM-DD
3. **Ca matching có logic đặc biệt:** "Hết ca" và "Giữa ca" đều nhận cả hai
4. **Product/Market:** Chỉ kiểm tra nếu có giá trị trong detail_reports
5. **Tự động ghi vào database:** Kết quả tính toán được tự động cập nhật vào bảng `detail_reports`
