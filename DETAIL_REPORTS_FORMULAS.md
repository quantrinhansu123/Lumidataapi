# Công thức Tính Toán cho Detail Reports

## 📊 Tổng quan

Detail Reports có **6 chỉ số** được tính toán tự động dựa trên dữ liệu từ bảng `orders`. Tất cả các chỉ số đều được tính từ các đơn hàng **thỏa mãn tất cả điều kiện matching**.

---

## 🔍 Điều kiện Matching

Một đơn hàng (`order`) được tính vào detail report nếu thỏa mãn **TẤT CẢ** 5 điều kiện sau:

1. **Name:** `order.marketing_staff` khớp với `detail_report.Tên` (fuzzy matching)
2. **Date:** `order.order_date` khớp với `detail_report.Ngày` (YYYY-MM-DD)
3. **Shift:** `order.shift` khớp với `detail_report.ca` (logic đặc biệt)
4. **Product:** `order.product` khớp với `detail_report.Sản_phẩm`
5. **Market:** `order.country` khớp với `detail_report.Thị_trường`

---

## 📐 Công thức Tính Toán

### 1. **Số đơn thực tế** (order_count)

```
Số đơn thực tế = COUNT(orders WHERE tất cả 5 điều kiện matching đều đúng)
```

**Giải thích:**
- Đếm số lượng đơn hàng thỏa mãn tất cả điều kiện matching
- Mỗi đơn chỉ được đếm 1 lần

**Code:**
```typescript
if (matches) {
  orderCount++;
}
```

---

### 2. **Doanh thu chốt thực tế** (revenue_actual)

```
Doanh thu chốt thực tế = SUM(total_vnd của TẤT CẢ orders đã match)
```

**Giải thích:**
- Tổng tiền VNĐ của tất cả đơn hàng đã match
- Lấy từ `order.total_vnd` hoặc `order.total_amount_vnd`
- Tính cho TẤT CẢ đơn đã match (bao gồm cả đơn hủy)

**Code:**
```typescript
if (matches) {
  const amount = getOrderRevenue(order); // Lấy từ total_vnd hoặc total_amount_vnd
  revenueActual += amount;
}
```

---

### 3. **Doanh số hoàn hủy thực tế** (revenue_cancel_actual)

```
Doanh số hoàn hủy thực tế = SUM(total_vnd của các orders đã match VÀ có check_result = "Hủy")
```

**Giải thích:**
- Chỉ tính các đơn đã match VÀ có trạng thái hủy
- Lấy từ `order.check_result` (sau khi normalize về lowercase)
- Nếu `check_result = "hủy"` → tính vào doanh số hủy

**Code:**
```typescript
if (matches) {
  const amount = getOrderRevenue(order);
  const checkResult = normalizeString(order.check_result);
  if (checkResult === 'hủy') {
    revenueCancelActual += amount;
  }
}
```

---

### 4. **Số đơn hoàn hủy thực tế** (order_cancel_count_actual)

```
Số đơn hoàn hủy thực tế = COUNT(orders đã match VÀ có check_result = "Hủy")
```

**Giải thích:**
- Đếm số đơn đã match VÀ có trạng thái hủy
- Tương tự như "Doanh số hoàn hủy thực tế" nhưng là COUNT thay vì SUM

**Code:**
```typescript
if (matches) {
  const checkResult = normalizeString(order.check_result);
  if (checkResult === 'hủy') {
    orderCancelCount++;
  }
}
```

---

### 5. **Doanh số sau hoàn hủy thực tế** (revenue_after_cancel_actual)

```
Doanh số sau hoàn hủy thực tế = Doanh thu chốt thực tế - Doanh số hoàn hủy thực tế
```

**Giải thích:**
- Doanh thu sau khi trừ đi các đơn hủy
- Công thức: `revenue_actual - revenue_cancel_actual`
- Đây là doanh thu thực tế sau khi loại bỏ các đơn hủy

**Code:**
```typescript
const revenueAfterCancelActual = revenueActual - revenueCancelActual;
```

---

### 6. **Doanh số đi thực tế** (revenue_shipped_actual)

```
Doanh số đi thực tế = SUM(total_vnd của các orders đã match VÀ (delivery_status = "Delivered" HOẶC có tracking_code))
```

**Giải thích:**
- Chỉ tính các đơn đã match VÀ đã được giao
- Điều kiện: `delivery_status = "Delivered"` HOẶC `tracking_code` không rỗng
- Đây là doanh thu của các đơn đã thực sự được giao đi

**Code:**
```typescript
if (matches) {
  const amount = getOrderRevenue(order);
  const deliveryStatus = normalizeString(order.delivery_status || order.delivery_status_nb || '');
  const hasTracking = order.tracking_code && String(order.tracking_code).trim() !== '';
  if (deliveryStatus === 'delivered' || hasTracking) {
    revenueShippedActual += amount;
  }
}
```

---

## 💡 Ví dụ Cụ Thể

### Input: Detail Report
```json
{
  "id": "detail-123",
  "Tên": "Dương Thị Hạnh",
  "Ngày": "2026-03-10",
  "ca": "Hết ca",
  "Sản_phẩm": "Bonavita Coffee",
  "Thị_trường": "US"
}
```

### Input: Orders trong database
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

### Kết quả Tính toán:

#### Bước 1: Matching
- **order-1:** ✅ Match (name, date, shift="Hết ca" match với ca="Hết ca", product, market đều đúng)
- **order-2:** ✅ Match (name, date, shift="Giữa ca" match với ca="Hết ca" vì logic đặc biệt, product, market đều đúng)
- **order-3:** ❌ Không match (product khác: "Kem Body" ≠ "Bonavita Coffee")

#### Bước 2: Tính toán các chỉ số

**1. Số đơn thực tế:**
```
= COUNT(order-1, order-2)
= 2
```

**2. Doanh thu chốt thực tế:**
```
= SUM(order-1.total_vnd, order-2.total_vnd)
= 4,584,000 + 4,584,000
= 9,168,000 VNĐ
```

**3. Doanh số hoàn hủy thực tế:**
```
= SUM(order-2.total_vnd)  // vì order-2 có check_result = "Hủy"
= 4,584,000 VNĐ
```

**4. Số đơn hoàn hủy thực tế:**
```
= COUNT(order-2)  // vì order-2 có check_result = "Hủy"
= 1
```

**5. Doanh số sau hoàn hủy thực tế:**
```
= Doanh thu chốt thực tế - Doanh số hoàn hủy thực tế
= 9,168,000 - 4,584,000
= 4,584,000 VNĐ
```

**6. Doanh số đi thực tế:**
```
= SUM(order-1.total_vnd)  // vì order-1 có delivery_status = "Delivered"
= 4,584,000 VNĐ
```

### Output: Kết quả cuối cùng
```json
{
  "Số đơn thực tế": 2,
  "Doanh thu chốt thực tế": 9168000,
  "Doanh số hoàn hủy thực tế": 4584000,
  "Số đơn hoàn hủy thực tế": 1,
  "Doanh số sau hoàn hủy thực tế": 4584000,
  "Doanh số đi thực tế": 4584000
}
```

---

## 📋 Tóm Tắt Công thức

| Chỉ số | Công thức | Mô tả |
|--------|-----------|-------|
| **Số đơn thực tế** | `COUNT(orders đã match)` | Đếm tất cả đơn đã match |
| **Doanh thu chốt thực tế** | `SUM(total_vnd của tất cả orders đã match)` | Tổng tiền tất cả đơn đã match |
| **Doanh số hoàn hủy thực tế** | `SUM(total_vnd của orders đã match VÀ check_result = "Hủy")` | Tổng tiền các đơn hủy |
| **Số đơn hoàn hủy thực tế** | `COUNT(orders đã match VÀ check_result = "Hủy")` | Đếm số đơn hủy |
| **Doanh số sau hoàn hủy thực tế** | `Doanh thu chốt thực tế - Doanh số hoàn hủy thực tế` | Doanh thu sau khi trừ hủy |
| **Doanh số đi thực tế** | `SUM(total_vnd của orders đã match VÀ (delivery_status = "Delivered" HOẶC có tracking_code))` | Tổng tiền các đơn đã giao |

---

## ⚠️ Lưu Ý Quan Trọng

1. **Tất cả điều kiện phải đúng:** Một đơn chỉ được tính nếu thỏa mãn TẤT CẢ 5 điều kiện matching

2. **check_result = "Hủy":** 
   - Sau khi normalize về lowercase
   - Chỉ tính vào `revenue_cancel_actual` và `order_cancel_count_actual` khi `check_result = "hủy"`

3. **delivery_status cho "Doanh số đi thực tế":**
   - Kiểm tra `delivery_status` hoặc `delivery_status_nb`
   - Hoặc kiểm tra `tracking_code` không rỗng
   - Chỉ cần một trong hai điều kiện là đủ

4. **getOrderRevenue(order):**
   - Ưu tiên: `total_vnd` → `total_amount_vnd` → `tongtien` → 0
   - Tự động parse các format số (1,000,000 hoặc 1.000.000)

5. **Shift Matching đặc biệt:**
   - "Hết ca" trong detail_report khớp với cả "Hết ca" và "Giữa ca" trong order
   - "Giữa ca" trong detail_report chỉ khớp với "Giữa ca" trong order

---

## 🔄 Quy trình Tính Toán

1. **Fetch Detail Reports:** Lấy các detail reports cần tính toán (theo recordId, date, hoặc recalculateAll)

2. **Filter by Name (nếu có):** Lọc theo tên nhân viên nếu có tham số `name`/`ten`/`Tên`

3. **Calculate Date Range:** Tính khoảng ngày từ các detail reports để tối ưu fetch orders

4. **Fetch Orders:** Lấy tất cả orders trong khoảng ngày (hoặc tất cả nếu không có date range)

5. **Loop qua từng Detail Report:**
   - Với mỗi detail report, loop qua tất cả orders
   - Kiểm tra matching với `orderMatchesDetailReport()`
   - Nếu match → tính toán các chỉ số
   - Cập nhật vào database với `updateDetailReportStatistics()`

6. **Return Results:** Trả về danh sách các detail reports đã được cập nhật

---

## 📝 Mapping Tên Cột trong Database

Khi cập nhật vào database, hệ thống sẽ thử các tên cột sau (theo thứ tự ưu tiên):

### Tên tiếng Việt (ưu tiên):
- `"Số đơn thực tế"`
- `"Doanh thu chốt thực tế"`
- `"Doanh số hoàn hủy thực tế"`
- `"Số đơn hoàn hủy thực tế"`
- `"Doanh số sau hoàn hủy thực tế"`
- `"Doanh số đi thực tế"`

### Tên tiếng Anh (fallback):
- `order_count`
- `revenue_actual`
- `revenue_cancel_actual`
- `order_cancel_count_actual`
- `revenue_after_cancel_actual`
- `revenue_shipped_actual`
