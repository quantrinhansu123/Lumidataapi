# Cách Tính Toán - Chi Tiết

## 📋 Tổng quan

Hệ thống tính toán tự động các chỉ số thống kê cho `sales_reports` và `detail_reports` dựa trên dữ liệu từ bảng `orders`. Quá trình bao gồm:
1. **Matching:** Tìm các đơn hàng phù hợp với từng báo cáo
2. **Tính toán:** Tính các chỉ số từ các đơn hàng đã match
3. **Cập nhật:** Lưu kết quả vào database

---

## 🔍 Logic Matching

### Sales Reports Matching

Một đơn hàng (`order`) được coi là **phù hợp** với một `sales_report` nếu thỏa mãn **TẤT CẢ** các điều kiện sau:

#### 1. **Name Matching (Tên nhân viên)**
- **Điều kiện:** `order.sale_staff` khớp với `sales_report.name` (hoặc `ten`, `Tên`, `nhanvien`, `nhan_vien`)
- **Cách khớp:** Fuzzy matching (không phân biệt hoa thường, bỏ dấu)
- **Ví dụ:**
  - `"Dương Thị Hạnh"` khớp với `"Duong Thi Hanh"`
  - `"Nguyễn Văn A"` khớp với `"nguyen van a"`
  - `"Trần Thị B"` khớp với `"Tran Thi B"`

#### 2. **Date Matching (Ngày)**
- **Điều kiện:** `order.order_date` khớp với `sales_report.date` (hoặc `ngay`, `Ngày`)
- **Format:** YYYY-MM-DD
- **Ví dụ:**
  - `order.order_date = "2026-03-10"` khớp với `sales_report.date = "2026-03-10"`

#### 3. **Shift Matching (Ca làm việc)**
- **Điều kiện:** `order.shift` khớp với `sales_report.shift` (hoặc `ca`, `casle`)
- **Logic đặc biệt:**
  - Nếu `sales_report.shift = "Hết ca"` → khớp với `order.shift = "Hết ca"` HOẶC `"Giữa ca"`
  - Nếu `sales_report.shift = "Giữa ca"` → chỉ khớp với `order.shift = "Giữa ca"`
  - Các trường hợp khác: exact match hoặc contains
- **Ví dụ:**
  - `sales_report.shift = "Hết ca"` khớp với `order.shift = "Hết ca"` ✅
  - `sales_report.shift = "Hết ca"` khớp với `order.shift = "Giữa ca"` ✅
  - `sales_report.shift = "Giữa ca"` khớp với `order.shift = "Giữa ca"` ✅
  - `sales_report.shift = "Giữa ca"` khớp với `order.shift = "Hết ca"` ❌

#### 4. **Product Matching (Sản phẩm)**
- **Điều kiện:** `order.product` khớp với `sales_report.product` (hoặc `san_pham`, `Sản_phẩm`)
- **Cách khớp:** Exact match (không phân biệt hoa thường)
- **Ví dụ:**
  - `order.product = "Bonavita Coffee"` khớp với `sales_report.product = "Bonavita Coffee"` ✅
  - `order.product = "Kem Body"` khớp với `sales_report.product = "kem body"` ✅

#### 5. **Market Matching (Thị trường)**
- **Điều kiện:** `order.country` khớp với `sales_report.market` (hoặc `thi_truong`, `Thị_trường`)
- **Cách khớp:** Exact match (không phân biệt hoa thường)
- **Ví dụ:**
  - `order.country = "US"` khớp với `sales_report.market = "US"` ✅
  - `order.country = "VN"` khớp với `sales_report.market = "vn"` ✅

---

### Detail Reports Matching

Một đơn hàng (`order`) được coi là **phù hợp** với một `detail_report` nếu thỏa mãn **TẤT CẢ** các điều kiện sau:

#### 1. **Name Matching (Tên nhân viên)**
- **Điều kiện:** `order.marketing_staff` khớp với `detail_report.Tên` (hoặc `ten`, `name`, `nhanvien`, `nhan_vien`)
- **Cách khớp:** Fuzzy matching (không phân biệt hoa thường, bỏ dấu)
- **Lưu ý:** Detail reports dùng `marketing_staff`, khác với sales reports dùng `sale_staff`

#### 2. **Date Matching (Ngày)**
- **Điều kiện:** `order.order_date` khớp với `detail_report.Ngày` (hoặc `ngay`, `date`)
- **Format:** YYYY-MM-DD

#### 3. **Shift Matching (Ca làm việc)**
- **Điều kiện:** `order.shift` khớp với `detail_report.ca` (hoặc `shift`)
- **Logic đặc biệt:**
  - Nếu `detail_report.ca = "Hết ca"` → khớp với `order.shift = "Hết ca"` HOẶC `"Giữa ca"`
  - Nếu `detail_report.ca = "Giữa ca"` → chỉ khớp với `order.shift = "Giữa ca"`
- **Ví dụ:** Tương tự như sales reports

#### 4. **Product Matching (Sản phẩm)**
- **Điều kiện:** `order.product` khớp với `detail_report.Sản_phẩm` (hoặc `san_pham`, `product`)

#### 5. **Market Matching (Thị trường)**
- **Điều kiện:** `order.country` khớp với `detail_report.Thị_trường` (hoặc `thi_truong`, `market`)

---

## 📊 Công thức Tính Toán

### Sales Reports

#### 1. **order_count** (Số đơn thực tế)
```
order_count = COUNT(orders WHERE tất cả điều kiện matching đều đúng)
```
- Đếm số lượng đơn hàng thỏa mãn tất cả điều kiện matching

#### 2. **revenue_actual** (Doanh thu chốt thực tế)
```
revenue_actual = SUM(total_vnd của tất cả orders đã match)
```
- Tổng tiền VNĐ của tất cả đơn hàng đã match
- Ưu tiên lấy từ `total_vnd`, fallback sang `total_amount_vnd`

#### 3. **revenue_cancel_actual** (Doanh số hoàn hủy thực tế)
```
revenue_cancel_actual = SUM(total_vnd của các orders đã match VÀ có check_result = "Hủy")
```
- Chỉ tính các đơn có trạng thái hủy

#### 4. **order_cancel_count_actual** (Số đơn hoàn hủy thực tế)
```
order_cancel_count_actual = COUNT(orders đã match VÀ có check_result = "Hủy")
```
- Đếm số đơn có trạng thái hủy

#### 5. **order_success_count** (Số đơn thành công)
```
order_success_count = order_count - order_cancel_count_actual
```
- Số đơn thành công = Tổng số đơn - Số đơn hủy

---

### Detail Reports

#### 1. **Số đơn thực tế** (order_count)
```
Số đơn thực tế = COUNT(orders WHERE tất cả điều kiện matching đều đúng)
```
- Tương tự như sales reports

#### 2. **Doanh thu chốt thực tế** (revenue_actual)
```
Doanh thu chốt thực tế = SUM(total_vnd của tất cả orders đã match)
```
- Tổng tiền VNĐ của tất cả đơn hàng đã match

#### 3. **Doanh số hoàn hủy thực tế** (revenue_cancel_actual)
```
Doanh số hoàn hủy thực tế = SUM(total_vnd của các orders đã match VÀ có check_result = "Hủy")
```
- Chỉ tính các đơn có trạng thái hủy

#### 4. **Số đơn hoàn hủy thực tế** (order_cancel_count_actual)
```
Số đơn hoàn hủy thực tế = COUNT(orders đã match VÀ có check_result = "Hủy")
```
- Đếm số đơn có trạng thái hủy

#### 5. **Doanh số sau hoàn hủy thực tế** (revenue_after_cancel_actual)
```
Doanh số sau hoàn hủy thực tế = Doanh thu chốt thực tế - Doanh số hoàn hủy thực tế
```
- Doanh thu sau khi trừ đi các đơn hủy

#### 6. **Doanh số đi thực tế** (revenue_shipped_actual)
```
Doanh số đi thực tế = SUM(total_vnd của các orders đã match VÀ (delivery_status = "Delivered" HOẶC có tracking_code))
```
- Chỉ tính các đơn đã được giao (có tracking code hoặc trạng thái "Delivered")

---

## 💡 Ví dụ Cụ Thể

### Ví dụ 1: Sales Report

**Sales Report:**
```json
{
  "id": "abc-123",
  "name": "Dương Thị Hạnh",
  "date": "2026-03-10",
  "shift": "Hết ca",
  "product": "Bonavita Coffee",
  "market": "US"
}
```

**Orders trong database:**
```json
[
  {
    "id": "order-1",
    "sale_staff": "Dương Thị Hạnh",
    "order_date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Bonavita Coffee",
    "country": "US",
    "total_vnd": 4584000,
    "check_result": null
  },
  {
    "id": "order-2",
    "sale_staff": "Dương Thị Hạnh",
    "order_date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Bonavita Coffee",
    "country": "US",
    "total_vnd": 4584000,
    "check_result": "Hủy"
  },
  {
    "id": "order-3",
    "sale_staff": "Nguyễn Văn A",
    "order_date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Bonavita Coffee",
    "country": "US",
    "total_vnd": 5000000,
    "check_result": null
  }
]
```

**Kết quả tính toán:**
- **order_count:** 2 (order-1 và order-2 match)
- **revenue_actual:** 9,168,000 VNĐ (4,584,000 + 4,584,000)
- **revenue_cancel_actual:** 4,584,000 VNĐ (chỉ order-2)
- **order_cancel_count_actual:** 1 (order-2)
- **order_success_count:** 1 (2 - 1)

**Lý do:**
- order-1: ✅ Match (name, date, shift, product, market đều đúng)
- order-2: ✅ Match (name, date, shift, product, market đều đúng, nhưng bị hủy)
- order-3: ❌ Không match (name khác: "Nguyễn Văn A" ≠ "Dương Thị Hạnh")

---

### Ví dụ 2: Detail Report

**Detail Report:**
```json
{
  "id": "def-456",
  "Tên": "Dương Thị Hạnh",
  "Ngày": "2026-03-10",
  "ca": "Hết ca",
  "Sản_phẩm": "Bonavita Coffee",
  "Thị_trường": "US"
}
```

**Orders trong database:**
```json
[
  {
    "id": "order-1",
    "marketing_staff": "Dương Thị Hạnh",
    "order_date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Bonavita Coffee",
    "country": "US",
    "total_vnd": 4584000,
    "check_result": null,
    "delivery_status": "Delivered",
    "tracking_code": "TRACK123"
  },
  {
    "id": "order-2",
    "marketing_staff": "Dương Thị Hạnh",
    "order_date": "2026-03-10",
    "shift": "Giữa ca",
    "product": "Bonavita Coffee",
    "country": "US",
    "total_vnd": 4584000,
    "check_result": "Hủy",
    "delivery_status": null,
    "tracking_code": null
  },
  {
    "id": "order-3",
    "marketing_staff": "Dương Thị Hạnh",
    "order_date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Kem Body",
    "country": "US",
    "total_vnd": 3000000,
    "check_result": null,
    "delivery_status": "Delivered",
    "tracking_code": "TRACK456"
  }
]
```

**Kết quả tính toán:**
- **Số đơn thực tế:** 2 (order-1 và order-2 match)
- **Doanh thu chốt thực tế:** 9,168,000 VNĐ (4,584,000 + 4,584,000)
- **Doanh số hoàn hủy thực tế:** 4,584,000 VNĐ (order-2)
- **Số đơn hoàn hủy thực tế:** 1 (order-2)
- **Doanh số sau hoàn hủy thực tế:** 4,584,000 VNĐ (9,168,000 - 4,584,000)
- **Doanh số đi thực tế:** 4,584,000 VNĐ (chỉ order-1 có delivery_status = "Delivered")

**Lý do:**
- order-1: ✅ Match (name, date, shift="Hết ca" match với ca="Hết ca", product, market đều đúng) + Đã giao
- order-2: ✅ Match (name, date, shift="Giữa ca" match với ca="Hết ca" vì logic đặc biệt, product, market đều đúng) + Bị hủy
- order-3: ❌ Không match (product khác: "Kem Body" ≠ "Bonavita Coffee")

---

## 🔧 Các Hàm Hỗ Trợ

### 1. **normalizeString(value)**
- Trim và chuyển về lowercase
- Dùng cho shift, product, market matching

### 2. **normalizeNameForMatch(value)**
- Bỏ dấu tiếng Việt
- Chuyển về lowercase
- Xử lý khoảng trắng
- Dùng cho name matching

### 3. **normalizeDate(value)**
- Chuyển về format YYYY-MM-DD
- Hỗ trợ nhiều format đầu vào: DD/MM/YYYY, YYYY-MM-DD, timestamp

### 4. **getOrderRevenue(order)**
- Lấy giá trị doanh thu từ order
- Ưu tiên: `total_vnd` → `total_amount_vnd` → 0

### 5. **matchesShift(salesReportShift, orderShift)**
- Logic đặc biệt cho shift matching
- "Hết ca" match với cả "Hết ca" và "Giữa ca"
- "Giữa ca" chỉ match với "Giữa ca"

### 6. **matchesShiftForDetailReport(detailReportShift, orderShift)**
- Tương tự như `matchesShift` nhưng cho detail reports

---

## ⚠️ Lưu ý Quan Trọng

1. **Tất cả điều kiện phải đúng:** Một đơn chỉ được tính nếu thỏa mãn TẤT CẢ 5 điều kiện (name, date, shift, product, market)

2. **Fuzzy matching cho name:** Name matching không phân biệt hoa thường và bỏ dấu, nhưng các trường khác (product, market) thì exact match

3. **Shift matching đặc biệt:** "Hết ca" có thể nhận cả "Giữa ca", nhưng "Giữa ca" chỉ nhận "Giữa ca"

4. **check_result = "Hủy":** Chỉ tính vào `revenue_cancel_actual` và `order_cancel_count_actual` khi `check_result` (sau khi normalize) = "hủy"

5. **delivery_status cho "Doanh số đi thực tế":** Chỉ tính các đơn có `delivery_status = "Delivered"` HOẶC có `tracking_code` không rỗng

6. **Performance:** Hệ thống fetch tất cả orders một lần và filter trong memory để tối ưu performance

7. **Date filtering:** Có thể filter orders theo date range để giảm số lượng orders cần xử lý

---

## 📝 Tóm Tắt

### Sales Reports:
- **5 điều kiện matching:** name (sale_staff), date, shift, product, market
- **5 chỉ số tính:** order_count, revenue_actual, revenue_cancel_actual, order_cancel_count_actual, order_success_count

### Detail Reports:
- **5 điều kiện matching:** name (marketing_staff), date, shift, product, market
- **6 chỉ số tính:** Số đơn thực tế, Doanh thu chốt thực tế, Doanh số hoàn hủy thực tế, Số đơn hoàn hủy thực tế, Doanh số sau hoàn hủy thực tế, Doanh số đi thực tế

### Điểm khác biệt chính:
- Sales reports dùng `sale_staff`, Detail reports dùng `marketing_staff`
- Detail reports có thêm trường "Doanh số đi thực tế" (tính các đơn đã giao)
- Detail reports có tên cột tiếng Việt trong response
