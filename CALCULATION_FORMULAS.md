# Công Thức Tính Toán - Theo Nhân Viên và Ngày

## Tổng Quan

Hệ thống tính toán các chỉ số cho mỗi record trong `sales_reports` dựa trên việc đếm và tính tổng từ bảng `orders` theo các điều kiện matching.

---

## Điều Kiện Matching (Bắt Buộc)

Một order được tính vào `order_count` nếu **TẤT CẢ** các điều kiện sau đều khớp:

### 1. **Matching theo Nhân Viên (Bắt buộc)**

```
name (sales_reports) = sale_staff (orders)
```

**Chi tiết:**
- Lấy tên từ: `sales_reports.name` hoặc `sales_reports.ten` hoặc `sales_reports.Tên`
- So sánh với: `orders.sale_staff`
- **Fuzzy matching:** Bỏ dấu, lowercase, có thể chứa nhau
  - Ví dụ: "Nguyễn Văn A" khớp với "nguyen van a"
  - Ví dụ: "Phan Nhân" khớp với "phan nhan"

**Nếu có `sale_name` trong sales_reports:**
- Thêm điều kiện: `sale_name` (sales_reports) phải khớp với `sale_staff` (orders)
- Nếu `sale_name` không có → bỏ qua điều kiện này

### 2. **Matching theo Ngày (Bắt buộc)**

```
date (sales_reports) = order_date (orders)
```

**Chi tiết:**
- Format chuẩn: `YYYY-MM-DD` (ví dụ: `2026-03-08`)
- Tự động normalize từ các format:
  - `08/03/2026` → `2026-03-08`
  - `2026-03-08T10:00:00` → `2026-03-08`
  - `2026-03-08` → `2026-03-08`

### 3. **Matching theo Sản Phẩm (Tùy chọn - chỉ kiểm tra nếu có)**

```
product (sales_reports) = product (orders)
```

**Chi tiết:**
- Nếu `sales_reports.product` có giá trị → phải khớp chính xác (case-insensitive)
- Nếu `sales_reports.product` = null hoặc rỗng → **BỎ QUA** điều kiện này

### 4. **Matching theo Thị Trường (Tùy chọn - chỉ kiểm tra nếu có)**

```
market (sales_reports) = country (orders)
```

**Chi tiết:**
- Nếu `sales_reports.market` có giá trị → phải khớp chính xác (case-insensitive)
- Nếu `sales_reports.market` = null hoặc rỗng → **BỎ QUA** điều kiện này

### 5. **Matching theo Ca (Đã BỎ QUA)**

- **Không kiểm tra** điều kiện shift/ca
- Bất kỳ ca nào đều được tính

---

## Công Thức Tính Toán

### 1. `order_count` - Tổng số đơn hàng

```
order_count = COUNT(orders WHERE 
  name matches sale_staff AND
  date = order_date AND
  (product matches OR product is empty) AND
  (market matches OR market is empty)
)
```

**Ví dụ:**
- Sales report: name="Nguyễn Văn A", date="2026-03-08", product="Kem Body", market="US"
- Tìm tất cả orders có:
  - `sale_staff` khớp với "Nguyễn Văn A"
  - `order_date` = "2026-03-08"
  - `product` = "Kem Body"
  - `country` = "US"
- Đếm số lượng → `order_count`

### 2. `order_cancel_count_actual` - Số đơn hủy

```
order_cancel_count_actual = COUNT(orders WHERE 
  (điều kiện matching như trên) AND
  check_result = "Hủy"
)
```

**Ví dụ:**
- Trong số các orders đã match ở trên
- Đếm những orders có `check_result` = "Hủy" (case-insensitive)
- → `order_cancel_count_actual`

### 3. `revenue_actual` - Tổng doanh thu

```
revenue_actual = SUM(total_amount_vnd) của tất cả orders đã match
```

**Chi tiết:**
- Lấy từ `orders.total_amount_vnd` (ưu tiên)
- Nếu không có → lấy từ `orders.total_vnd`
- Cộng tổng tất cả orders đã match

**Ví dụ:**
- Order 1: total_amount_vnd = 1,000,000
- Order 2: total_amount_vnd = 2,000,000
- Order 3: total_amount_vnd = 500,000
- → `revenue_actual` = 3,500,000

### 4. `revenue_cancel_actual` - Doanh thu từ đơn hủy

```
revenue_cancel_actual = SUM(total_amount_vnd) của các orders đã match VÀ check_result = "Hủy"
```

**Ví dụ:**
- Order 1: total_amount_vnd = 1,000,000, check_result = "Hủy"
- Order 2: total_amount_vnd = 2,000,000, check_result = "Thành công"
- Order 3: total_amount_vnd = 500,000, check_result = "Hủy"
- → `revenue_cancel_actual` = 1,500,000 (chỉ tính order 1 và 3)

### 5. `order_success_count` - Số đơn thành công

```
order_success_count = order_count - order_cancel_count_actual
```

**Ví dụ:**
- `order_count` = 10
- `order_cancel_count_actual` = 2
- → `order_success_count` = 8

---

## Ví Dụ Cụ Thể

### Ví dụ 1: Tính cho một nhân viên trong một ngày

**Sales Report:**
```json
{
  "id": "abc-123",
  "name": "Nguyễn Văn A",
  "date": "2026-03-08",
  "product": "Kem Body",
  "market": "US"
}
```

**Orders trong database:**
```
Order 1: sale_staff="Nguyễn Văn A", order_date="2026-03-08", product="Kem Body", country="US", total_amount_vnd=1000000, check_result="Thành công"
Order 2: sale_staff="Nguyễn Văn A", order_date="2026-03-08", product="Kem Body", country="US", total_amount_vnd=2000000, check_result="Hủy"
Order 3: sale_staff="Nguyễn Văn B", order_date="2026-03-08", product="Kem Body", country="US", total_amount_vnd=500000, check_result="Thành công"
Order 4: sale_staff="Nguyễn Văn A", order_date="2026-03-09", product="Kem Body", country="US", total_amount_vnd=3000000, check_result="Thành công"
```

**Kết quả tính toán:**
- ✅ Order 1: Match (name, date, product, market đều khớp)
- ✅ Order 2: Match (name, date, product, market đều khớp)
- ❌ Order 3: Không match (name khác)
- ❌ Order 4: Không match (date khác)

**Kết quả:**
```json
{
  "order_count": 2,
  "order_cancel_count_actual": 1,
  "revenue_actual": 3000000,
  "revenue_cancel_actual": 2000000,
  "order_success_count": 1
}
```

### Ví dụ 2: Không có product/market (bỏ qua điều kiện)

**Sales Report:**
```json
{
  "name": "Nguyễn Văn A",
  "date": "2026-03-08",
  "product": null,
  "market": null
}
```

**Orders:**
```
Order 1: sale_staff="Nguyễn Văn A", order_date="2026-03-08", product="Kem Body", country="US"
Order 2: sale_staff="Nguyễn Văn A", order_date="2026-03-08", product="Fitgum", country="Canada"
```

**Kết quả:**
- ✅ Order 1: Match (chỉ cần name và date khớp)
- ✅ Order 2: Match (chỉ cần name và date khớp)
- → `order_count` = 2

---

## Tóm Tắt Công Thức

```
Điều kiện matching:
1. name (sales_reports) MATCHES sale_staff (orders) [BẮT BUỘC]
2. date (sales_reports) = order_date (orders) [BẮT BUỘC]
3. product (sales_reports) = product (orders) [TÙY CHỌN - chỉ nếu có]
4. market (sales_reports) = country (orders) [TÙY CHỌN - chỉ nếu có]
5. shift - BỎ QUA

Công thức tính:
order_count = COUNT(matched_orders)
order_cancel_count_actual = COUNT(matched_orders WHERE check_result="Hủy")
revenue_actual = SUM(total_amount_vnd của matched_orders)
revenue_cancel_actual = SUM(total_amount_vnd của matched_orders WHERE check_result="Hủy")
order_success_count = order_count - order_cancel_count_actual
```

---

## Lưu Ý Quan Trọng

1. **Name matching là fuzzy:** Bỏ dấu, lowercase, có thể chứa nhau
2. **Date phải khớp chính xác:** Format YYYY-MM-DD
3. **Product/Market:** Chỉ kiểm tra nếu có giá trị trong sales_reports
4. **Shift:** Đã bỏ qua, không kiểm tra
5. **Sale name:** Nếu có `sale_name` trong sales_reports, phải khớp thêm điều kiện này
