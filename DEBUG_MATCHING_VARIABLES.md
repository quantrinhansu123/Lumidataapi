# Debug Matching Variables - Kiểm tra các biến matching

## 🔍 Vấn đề được báo cáo

Detail report có các trường:
```json
{
  "id": "0000cb03-95e0-4683-bd48-326a048b4382",
  "ten": "Lục Trần Minh Trí",
  "Email": "Minhtri050401@gmail.com",
  "ngay": "2026-01-23",
  "ca": "Giữa ca",
  "san_pham": "Bonavita Coffee",
  "thi_truong": "US"
}
```

## 📋 Các biến đang được sử dụng trong code

### 1. Name Matching (Tên nhân viên)

**Detail Report:**
```typescript
const reportName = detailReport.Tên || detailReport.ten || detailReport.name || detailReport.nhanvien || detailReport.nhan_vien;
```
- Ưu tiên: `Tên` → `ten` → `name` → `nhanvien` → `nhan_vien`
- Trong ví dụ: `reportName = "Lục Trần Minh Trí"` (từ `ten`)

**Order:**
```typescript
const orderMarketingStaff = order.marketing_staff || order.marketing || order.staff;
```
- Ưu tiên: `marketing_staff` → `marketing` → `staff`
- **CẦN KIỂM TRA:** Trường `marketing_staff` có được fetch từ orders không?

### 2. Date Matching (Ngày)

**Detail Report:**
```typescript
const reportDate = normalizeDate(detailReport.Ngày || detailReport.ngay || detailReport.date);
```
- Ưu tiên: `Ngày` → `ngay` → `date`
- Trong ví dụ: `reportDate = "2026-01-23"` (từ `ngay`)

**Order:**
```typescript
const orderDate = normalizeDate(order.order_date || order.ngay || order.date);
```
- Ưu tiên: `order_date` → `ngay` → `date`

### 3. Shift Matching (Ca)

**Detail Report:**
```typescript
const reportShift = detailReport.ca || detailReport.shift || detailReport.camkt;
```
- Ưu tiên: `ca` → `shift` → `camkt`
- Trong ví dụ: `reportShift = "Giữa ca"` (từ `ca`)

**Order:**
```typescript
const orderShift = order.shift || order.ca;
```
- Ưu tiên: `shift` → `ca`

### 4. Product Matching (Sản phẩm)

**Detail Report:**
```typescript
const reportProduct = normalizeString(detailReport.Sản_phẩm || detailReport.san_pham || detailReport.product || detailReport.productmkt);
```
- Ưu tiên: `Sản_phẩm` → `san_pham` → `product` → `productmkt`
- Trong ví dụ: `reportProduct = "bonavita coffee"` (từ `san_pham`, sau normalize)

**Order:**
```typescript
const orderProduct = normalizeString(order.product || order.san_pham);
```
- Ưu tiên: `product` → `san_pham`

### 5. Market Matching (Thị trường)

**Detail Report:**
```typescript
const reportMarket = normalizeString(detailReport.Thị_trường || detailReport.thi_truong || detailReport.market || detailReport.marketmkt);
```
- Ưu tiên: `Thị_trường` → `thi_truong` → `market` → `marketmkt`
- Trong ví dụ: `reportMarket = "us"` (từ `thi_truong`, sau normalize)

**Order:**
```typescript
const orderCountry = normalizeString(order.country || order.thi_truong || order.market);
```
- Ưu tiên: `country` → `thi_truong` → `market`

## ⚠️ Vấn đề có thể xảy ra

### 1. Trường `marketing_staff` không được fetch từ orders

Trong `fetchAllOrders()`, các trường được fetch:
```typescript
.select('id, sale_staff, order_date, shift, product, country, check_result, total_amount_vnd, total_vnd, delivery_status, delivery_status_nb, tracking_code, marketing_staff');
```

**✅ CÓ** `marketing_staff` trong select - OK

### 2. Tên cột trong database có thể khác

Có thể trong database:
- Detail report có trường `ten` (chữ thường) thay vì `Tên`
- Orders có trường khác thay vì `marketing_staff`

### 3. Logic matching có thể sai

Cần kiểm tra:
- `namesMatch()` có hoạt động đúng không?
- `normalizeDate()` có parse đúng format không?
- `matchesShiftForDetailReport()` có logic đúng không?

## 🔧 Cách debug

### Sử dụng debug endpoint:

```
GET http://localhost:3001/api/debug-detail-matching?recordId=0000cb03-95e0-4683-bd48-326a048b4382
```

Endpoint này sẽ trả về:
- Chi tiết từng điều kiện matching
- Giá trị thực tế của các biến
- Lý do tại sao match hoặc không match

### Kiểm tra trong code:

Thêm debug logging:
```typescript
console.log('Detail Report:', {
  Tên: detailReport.Tên,
  ten: detailReport.ten,
  name: detailReport.name,
  Ngày: detailReport.Ngày,
  ngay: detailReport.ngay,
  ca: detailReport.ca,
  san_pham: detailReport.san_pham,
  thi_truong: detailReport.thi_truong
});

console.log('Order:', {
  marketing_staff: order.marketing_staff,
  order_date: order.order_date,
  shift: order.shift,
  product: order.product,
  country: order.country
});
```

## 📝 Checklist kiểm tra

- [ ] `marketing_staff` có được fetch từ orders không?
- [ ] Tên cột trong database có đúng không?
- [ ] `namesMatch()` có match được "Lục Trần Minh Trí" không?
- [ ] `normalizeDate()` có parse "2026-01-23" đúng không?
- [ ] `matchesShiftForDetailReport("Giữa ca", ...)` có logic đúng không?
- [ ] `normalizeString()` có normalize "Bonavita Coffee" và "US" đúng không?

## 🎯 Giải pháp đề xuất

1. **Kiểm tra dữ liệu thực tế:** Sử dụng debug endpoint để xem giá trị thực tế
2. **Kiểm tra tên cột:** Xác nhận tên cột trong database
3. **Kiểm tra logic matching:** Xem từng điều kiện có đúng không
4. **Cập nhật code nếu cần:** Sửa các biến hoặc logic nếu phát hiện sai
