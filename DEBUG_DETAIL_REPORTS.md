# Debug - Tại sao số vẫn bằng 0?

## Cách Debug

### 1. Sử dụng Debug Endpoint

Test với record ID cụ thể:
```
http://localhost:3000/api/debug-detail-matching?recordId=0000cb03-95e0-4683-bd48-326a048b4382
```

Response sẽ hiển thị:
- Chi tiết từng điều kiện matching (name, date, shift, product, market)
- Orders nào match và không match
- Lý do tại sao không match

### 2. Kiểm tra các điều kiện matching

Một order được tính nếu **TẤT CẢ** điều kiện sau đều khớp:

#### ✅ Điều kiện 1: Tên (Bắt buộc)
```
Tên (detail_reports) = marketing_staff (orders)
```
**Kiểm tra:**
- Tên trong detail_reports có khớp với `marketing_staff` trong orders không?
- Fuzzy matching: bỏ dấu, lowercase, có thể chứa nhau
- Ví dụ: "Lục Trần Minh Trí" khớp với "luc tran minh tri"

#### ✅ Điều kiện 2: Ngày (Bắt buộc)
```
Ngày (detail_reports) = order_date (orders)
```
**Kiểm tra:**
- Format: YYYY-MM-DD (ví dụ: 2026-01-23)
- Phải khớp chính xác

#### ✅ Điều kiện 3: Ca (Bắt buộc)
```
ca (detail_reports) = shift (orders)
```
**Logic đặc biệt:**
- "Hết ca" → nhận cả "Hết ca" và "Giữa ca"
- "Giữa ca" → chỉ nhận "Giữa ca"

**Kiểm tra:**
- `detail_reports.ca` có giá trị không?
- `orders.shift` có giá trị không?
- Logic matching có đúng không?

#### ⚠️ Điều kiện 4: Sản phẩm (Tùy chọn)
```
Sản_phẩm (detail_reports) = product (orders)
```
**Kiểm tra:**
- Nếu `detail_reports.Sản_phẩm` có giá trị → phải khớp chính xác
- Nếu `detail_reports.Sản_phẩm` = null/empty → bỏ qua điều kiện này

#### ⚠️ Điều kiện 5: Thị trường (Tùy chọn)
```
Thị_trường (detail_reports) = country (orders)
```
**Kiểm tra:**
- Nếu `detail_reports.Thị_trường` có giá trị → phải khớp chính xác
- Nếu `detail_reports.Thị_trường` = null/empty → bỏ qua điều kiện này

## Các nguyên nhân phổ biến

### 1. Tên không khớp
- **Nguyên nhân:** Tên trong `detail_reports.Tên` khác với `orders.marketing_staff`
- **Giải pháp:** Kiểm tra xem có orders nào có `marketing_staff` khớp với tên trong detail_reports không

### 2. Ngày không khớp
- **Nguyên nhân:** Không có orders nào có `order_date` = ngày trong detail_reports
- **Giải pháp:** Kiểm tra xem có orders nào trong ngày đó không

### 3. Ca không khớp
- **Nguyên nhân:** `orders.shift` không khớp với `detail_reports.ca` theo logic
- **Giải pháp:** Kiểm tra logic ca matching

### 4. Sản phẩm/Thị trường không khớp
- **Nguyên nhân:** Nếu detail_reports có sản phẩm/thị trường, phải khớp chính xác
- **Giải pháp:** Kiểm tra xem orders có sản phẩm/thị trường khớp không

## Ví dụ Debug

### Record mẫu:
```json
{
  "id": "0000cb03-95e0-4683-bd48-326a048b4382",
  "ten": "Lục Trần Minh Trí",
  "ngay": "2026-01-23",
  "ca": "Giữa ca",
  "san_pham": "Bonavita Coffee",
  "thi_truong": "US"
}
```

### Debug URL:
```
http://localhost:3000/api/debug-detail-matching?recordId=0000cb03-95e0-4683-bd48-326a048b4382
```

### Response sẽ hiển thị:
- Tổng số orders đã kiểm tra
- Số orders match
- Chi tiết từng order và lý do match/không match

## Kiểm tra Orders tương ứng

Xem orders có thể match:
```
http://localhost:8000/orders?marketing_staff=Lục Trần Minh Trí&from_date=23/01/2026&to_date=23/01/2026
```

Xem tất cả orders trong ngày:
```
http://localhost:8000/orders?from_date=23/01/2026&to_date=23/01/2026
```
