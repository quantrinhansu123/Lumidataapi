# Công thức Tính "Số đơn hoàn hủy thực tế"

## 📊 Tổng quan

**Số đơn hoàn hủy thực tế** (tên tiếng Anh: `order_cancel_count_actual`) là một trong 6 chỉ số được tính toán tự động cho `detail_reports`. Chỉ số này đếm số lượng đơn hàng đã bị hủy trong các đơn hàng phù hợp với detail report.

---

## 🔢 Công thức

```
Số đơn hoàn hủy thực tế = COUNT(orders đã match VÀ có check_result = "Hủy")
```

**Giải thích:**
- Đếm số lượng đơn hàng thỏa mãn **TẤT CẢ** điều kiện:
  1. ✅ Đã match với detail report (thỏa mãn 5 điều kiện matching)
  2. ✅ Có `check_result = "Hủy"` (sau khi normalize về lowercase)

---

## 🔍 Điều kiện Matching (Phải thỏa mãn TẤT CẢ)

Một đơn hàng chỉ được tính vào "Số đơn hoàn hủy thực tế" nếu:

### 1. Đã Match với Detail Report
Thỏa mãn **TẤT CẢ** 5 điều kiện sau:

1. **Name Matching:**
   - `order.marketing_staff` khớp với `detail_report.Tên`
   - Fuzzy matching (không phân biệt hoa thường, bỏ dấu)

2. **Date Matching:**
   - `order.order_date` khớp với `detail_report.Ngày`
   - Format: YYYY-MM-DD

3. **Shift Matching:**
   - `order.shift` khớp với `detail_report.ca`
   - Logic đặc biệt: "Hết ca" match với cả "Hết ca" và "Giữa ca"

4. **Product Matching:**
   - `order.product` khớp với `detail_report.Sản_phẩm`
   - Exact match (không phân biệt hoa thường)

5. **Market Matching:**
   - `order.country` khớp với `detail_report.Thị_trường`
   - Exact match (không phân biệt hoa thường)

### 2. Có check_result = "Hủy"
- Lấy từ trường `order.check_result`
- Sau khi normalize về lowercase: `normalizeString(order.check_result)`
- Phải bằng `"hủy"` (chữ thường)

---

## 💻 Code Implementation

### Trong `calculateDetailReportStatistics()`:

```typescript
let orderCancelCount = 0;

for (const order of orders) {
  // Kiểm tra matching
  const matches = orderMatchesDetailReport(order, detailReport, false);
  
  if (matches) {
    orderCount++; // Đếm tổng số đơn đã match
    
    // Kiểm tra check_result
    const checkResult = normalizeString(order.check_result);
    if (checkResult === 'hủy') {
      orderCancelCount++; // Đếm số đơn hủy
      revenueCancelActual += amount; // Tính doanh số hủy
    }
  }
}

return {
  order_cancel_count_actual: orderCancelCount,
  // ... các chỉ số khác
};
```

### Hàm `normalizeString()`:

```typescript
export function normalizeString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim().toLowerCase();
}
```

**Ví dụ:**
- `"Hủy"` → `"hủy"` ✅
- `"HỦY"` → `"hủy"` ✅
- `"hủy"` → `"hủy"` ✅
- `"Hủy "` (có khoảng trắng) → `"hủy"` ✅
- `null` → `""` ❌
- `"Đạt"` → `"đạt"` ❌

---

## 📝 Ví dụ Cụ Thể

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
    "check_result": null  // Không hủy
  },
  {
    "id": "order-2",
    "marketing_staff": "Dương Thị Hạnh",
    "order_date": "2026-03-10",
    "shift": "Giữa ca",
    "product": "Bonavita Coffee",
    "country": "US",
    "total_vnd": 4584000,
    "check_result": "Hủy"  // Đã hủy
  },
  {
    "id": "order-3",
    "marketing_staff": "Dương Thị Hạnh",
    "order_date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Kem Body",
    "country": "US",
    "total_vnd": 3000000,
    "check_result": "Hủy"  // Đã hủy nhưng product khác
  },
  {
    "id": "order-4",
    "marketing_staff": "Nguyễn Văn A",
    "order_date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Bonavita Coffee",
    "country": "US",
    "total_vnd": 5000000,
    "check_result": "Hủy"  // Đã hủy nhưng name khác
  }
]
```

### Bước 1: Kiểm tra Matching

**order-1:**
- ✅ Name: "Dương Thị Hạnh" = "Dương Thị Hạnh"
- ✅ Date: "2026-03-10" = "2026-03-10"
- ✅ Shift: "Hết ca" match với "Hết ca"
- ✅ Product: "Bonavita Coffee" = "Bonavita Coffee"
- ✅ Market: "US" = "US"
- ✅ **MATCH** nhưng `check_result = null` → Không hủy

**order-2:**
- ✅ Name: "Dương Thị Hạnh" = "Dương Thị Hạnh"
- ✅ Date: "2026-03-10" = "2026-03-10"
- ✅ Shift: "Giữa ca" match với "Hết ca" (logic đặc biệt)
- ✅ Product: "Bonavita Coffee" = "Bonavita Coffee"
- ✅ Market: "US" = "US"
- ✅ **MATCH** và `check_result = "Hủy"` → **ĐƯỢC TÍNH**

**order-3:**
- ✅ Name: "Dương Thị Hạnh" = "Dương Thị Hạnh"
- ✅ Date: "2026-03-10" = "2026-03-10"
- ✅ Shift: "Hết ca" match với "Hết ca"
- ❌ Product: "Kem Body" ≠ "Bonavita Coffee"
- ❌ **KHÔNG MATCH** → Không được tính (dù có hủy)

**order-4:**
- ❌ Name: "Nguyễn Văn A" ≠ "Dương Thị Hạnh"
- ❌ **KHÔNG MATCH** → Không được tính (dù có hủy)

### Bước 2: Tính toán

**Số đơn hoàn hủy thực tế:**
```
= COUNT(order-2)
= 1
```

**Giải thích:**
- Chỉ có `order-2` thỏa mãn cả 2 điều kiện:
  1. ✅ Đã match với detail report
  2. ✅ Có `check_result = "Hủy"`

---

## 🔗 Mối Quan Hệ với Các Chỉ Số Khác

### 1. **Số đơn thực tế** (order_count)
```
Số đơn thực tế = COUNT(tất cả orders đã match)
```
- Bao gồm cả đơn hủy và đơn không hủy
- Trong ví dụ trên: `order_count = 2` (order-1 và order-2)

### 2. **Số đơn hoàn hủy thực tế** (order_cancel_count_actual)
```
Số đơn hoàn hủy thực tế = COUNT(orders đã match VÀ check_result = "Hủy")
```
- Chỉ đếm các đơn hủy
- Trong ví dụ trên: `order_cancel_count_actual = 1` (chỉ order-2)

### 3. **Số đơn thành công** (order_success_count)
```
Số đơn thành công = Số đơn thực tế - Số đơn hoàn hủy thực tế
```
- Số đơn không bị hủy
- Trong ví dụ trên: `order_success_count = 2 - 1 = 1` (chỉ order-1)

### 4. **Doanh số hoàn hủy thực tế** (revenue_cancel_actual)
```
Doanh số hoàn hủy thực tế = SUM(total_vnd của các orders đã match VÀ check_result = "Hủy")
```
- Tổng tiền của các đơn hủy
- Trong ví dụ trên: `revenue_cancel_actual = 4,584,000 VNĐ` (từ order-2)

---

## ⚠️ Lưu Ý Quan Trọng

### 1. **check_result phải chính xác**
- Sau khi normalize về lowercase phải bằng `"hủy"`
- Các giá trị khác như `"Đạt"`, `"Chờ"`, `null`, `""` đều **KHÔNG** được tính

### 2. **Phải thỏa mãn TẤT CẢ điều kiện matching**
- Một đơn có `check_result = "Hủy"` nhưng không match với detail report → **KHÔNG** được tính
- Ví dụ: order-3 và order-4 trong ví dụ trên

### 3. **Case-insensitive**
- `"Hủy"`, `"HỦY"`, `"hủy"` đều được coi là giống nhau
- Hệ thống tự động normalize về lowercase trước khi so sánh

### 4. **Trim whitespace**
- `"Hủy "` (có khoảng trắng) sẽ được normalize thành `"hủy"`
- Đảm bảo không bị lỗi do khoảng trắng thừa

### 5. **Null và empty**
- `check_result = null` → **KHÔNG** được tính
- `check_result = ""` → **KHÔNG** được tính
- Chỉ tính khi có giá trị và sau khi normalize = `"hủy"`

---

## 📊 Bảng Tóm Tắt

| Điều kiện | Giá trị | Kết quả |
|-----------|---------|---------|
| Match detail report | ✅ | check_result = "Hủy" | ✅ | **ĐƯỢC TÍNH** |
| Match detail report | ✅ | check_result = "Đạt" | ❌ | Không tính |
| Match detail report | ✅ | check_result = null | ❌ | Không tính |
| Match detail report | ✅ | check_result = "" | ❌ | Không tính |
| Không match | ❌ | check_result = "Hủy" | ✅ | **KHÔNG TÍNH** |

---

## 🎯 Kết Luận

**Số đơn hoàn hủy thực tế** là chỉ số quan trọng để:
- Theo dõi số lượng đơn hàng bị hủy
- Tính toán tỷ lệ hủy đơn
- Đánh giá hiệu quả hoạt động
- Tính toán "Số đơn thành công" và "Doanh số sau hoàn hủy"

**Công thức đơn giản:**
```
Số đơn hoàn hủy thực tế = Đếm các đơn đã match VÀ có check_result = "Hủy"
```

**Điều kiện bắt buộc:**
1. ✅ Đã match với detail report (5 điều kiện)
2. ✅ `check_result` sau khi normalize = `"hủy"`
