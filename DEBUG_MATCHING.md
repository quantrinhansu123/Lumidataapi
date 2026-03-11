# Debug Logic Matching - Tại sao order_count = 0?

## Record cần kiểm tra:
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

## Logic Matching (TẤT CẢ điều kiện phải khớp):

### 1. Name Matching (BẮT BUỘC)
- `name` (sales_reports) = `sale_staff` (orders)
- So sánh sau khi normalize (trim, lowercase)
- **Phải khớp chính xác**

**Ví dụ:**
- Sales report: `"Lê Ngọc Đài Trang"` → normalize → `"lê ngọc đài trang"`
- Order: `"Lê Ngọc Đài Trang"` → normalize → `"lê ngọc đài trang"` ✅
- Order: `"Le Ngoc Dai Trang"` → normalize → `"le ngoc dai trang"` ❌ (không khớp)

### 2. Sale Name Matching (TẦNG LỌC BỔ SUNG - TÙY CHỌN)
- Nếu `sale_name` hoặc `sale` hoặc `ten_sale` hoặc `Tên_Sale` (sales_reports) có giá trị:
  - Phải khớp với `sale_staff` (orders)
  - So sánh sau khi normalize (trim, lowercase, remove accents)
  - Match nếu exact match hoặc một tên chứa tên kia
- **Nếu `sale_name` (sales_reports) = empty/null → bỏ qua điều kiện này**

**Ví dụ:**
- Sales report có `sale_name: "Lê Ngọc Đài Trang"` → normalize → `"le ngoc dai trang"`
- Order có `sale_staff: "Lê Ngọc Đài Trang"` → normalize → `"le ngoc dai trang"` ✅
- Order có `sale_staff: "Le Ngoc Dai Trang"` → normalize → `"le ngoc dai trang"` ✅
- Order có `sale_staff: "Nguyễn Văn A"` → normalize → `"nguyen van a"` ❌ (không khớp)

**Nếu sales report không có sale_name:**
- Điều kiện này được bỏ qua, chỉ cần khớp các điều kiện khác

### 3. Date Matching (BẮT BUỘC)
- `date` (sales_reports) = `order_date` (orders)
- Format: YYYY-MM-DD
- **Phải khớp chính xác**

**Ví dụ:**
- Sales report: `"2026-01-02"`
- Order: `"2026-01-02"` ✅
- Order: `"2026-01-03"` ❌

### 4. Shift Matching - BỎ QUA
- **Điều kiện shift đã được bỏ qua theo yêu cầu**
- Orders sẽ được đếm bất kể shift có khớp hay không
- Không kiểm tra shift trong logic matching

### 5. Product Matching (TÙY CHỌN - bỏ qua nếu empty)
- `product` (sales_reports) = `product` (orders)
- So sánh sau khi normalize (trim, lowercase)
- **Nếu `product` (sales_reports) = empty/null → bỏ qua điều kiện này**

**Ví dụ:**
- Sales report: `"Bonavita Coffee"` → normalize → `"bonavita coffee"`
- Order: `"Bonavita Coffee"` → normalize → `"bonavita coffee"` ✅
- Order: `"BONAVITA COFFEE"` → normalize → `"bonavita coffee"` ✅
- Order: `"Bonavita"` → normalize → `"bonavita"` ❌ (không khớp)

**Nếu sales report không có product:**
- Sales report: `product = null` hoặc `product = ""` → **Bỏ qua điều kiện này** ✅

### 6. Market Matching (TÙY CHỌN - bỏ qua nếu empty)
- `market` (sales_reports) = `country` (orders)
- So sánh sau khi normalize (trim, lowercase)
- **Nếu `market` (sales_reports) = empty/null → bỏ qua điều kiện này**

**Ví dụ:**
- Sales report: `"Canada"` → normalize → `"canada"`
- Order: `"Canada"` → normalize → `"canada"` ✅
- Order: `"CANADA"` → normalize → `"canada"` ✅
- Order: `"US"` → normalize → `"us"` ❌

**Nếu sales report không có market:**
- Sales report: `market = null` hoặc `market = ""` → **Bỏ qua điều kiện này** ✅

---

## Tại sao order_count = 0?

Có thể do một trong các nguyên nhân sau:

### 1. Name không khớp
- Tên trong `sale_staff` (orders) khác với `"Lê Ngọc Đài Trang"`
- Có thể do:
  - Khoảng trắng khác nhau
  - Dấu câu khác nhau
  - Tên viết tắt hoặc khác format

### 2. Date không khớp
- Không có orders nào có `order_date = "2026-01-02"`

### 3. Shift không khớp
- Orders có `shift` không chứa "Hết ca"
- Ví dụ: chỉ có "Giữa ca" hoặc shift khác

### 4. Product không khớp
- Orders có `product` khác "Bonavita Coffee"
- Có thể do:
  - Tên sản phẩm viết khác (ví dụ: "Bonavita" thay vì "Bonavita Coffee")
  - Product trong orders là null/empty

### 5. Market không khớp
- Orders có `country` khác "Canada"
- Có thể do:
  - Country trong orders là null/empty
  - Country viết khác (ví dụ: "CA" thay vì "Canada")

---

## Cách Debug

### 1. Kiểm tra dữ liệu orders thực tế:

```sql
-- Tìm orders có thể khớp
SELECT 
  sale_staff,
  order_date,
  shift,
  product,
  country
FROM orders
WHERE 
  order_date = '2026-01-02'
  AND (
    LOWER(TRIM(sale_staff)) LIKE '%lê%ngọc%đài%trang%'
    OR LOWER(TRIM(sale_staff)) LIKE '%le%ngoc%dai%trang%'
  )
LIMIT 10;
```

### 2. Kiểm tra từng điều kiện:

```sql
-- 1. Name matching
SELECT COUNT(*) 
FROM orders 
WHERE LOWER(TRIM(sale_staff)) = LOWER(TRIM('Lê Ngọc Đài Trang'))
  AND order_date = '2026-01-02';

-- 2. Shift matching
SELECT COUNT(*) 
FROM orders 
WHERE LOWER(TRIM(sale_staff)) = LOWER(TRIM('Lê Ngọc Đài Trang'))
  AND order_date = '2026-01-02'
  AND (shift LIKE '%Hết ca%' OR shift LIKE '%Hết ca%');

-- 3. Product matching
SELECT COUNT(*) 
FROM orders 
WHERE LOWER(TRIM(sale_staff)) = LOWER(TRIM('Lê Ngọc Đài Trang'))
  AND order_date = '2026-01-02'
  AND (shift LIKE '%Hết ca%' OR shift LIKE '%Hết ca%')
  AND LOWER(TRIM(product)) = LOWER(TRIM('Bonavita Coffee'));

-- 4. Market matching
SELECT COUNT(*) 
FROM orders 
WHERE LOWER(TRIM(sale_staff)) = LOWER(TRIM('Lê Ngọc Đài Trang'))
  AND order_date = '2026-01-02'
  AND (shift LIKE '%Hết ca%' OR shift LIKE '%Hết ca%')
  AND LOWER(TRIM(product)) = LOWER(TRIM('Bonavita Coffee'))
  AND LOWER(TRIM(country)) = LOWER(TRIM('Canada'));
```

---

## Các trường hợp thường gặp

### 1. Tên không khớp do format
- Sales report: `"Lê Ngọc Đài Trang"`
- Order: `"Le Ngoc Dai Trang"` (không dấu)
- **Giải pháp:** Cần normalize tốt hơn hoặc kiểm tra dữ liệu

### 2. Product viết khác
- Sales report: `"Bonavita Coffee"`
- Order: `"Bonavita"` hoặc `"Bonavita Coffe"` (typo)
- **Giải pháp:** Kiểm tra dữ liệu thực tế

### 3. Market/Country viết khác
- Sales report: `"Canada"`
- Order: `"CA"` hoặc `"CAN"`
- **Giải pháp:** Cần mapping hoặc normalize

### 4. Shift format khác
- Sales report: `"Hết ca"`
- Order: `"Het ca"` (không dấu)
- **Giải pháp:** Normalize tốt hơn

---

## Khuyến nghị

1. **Kiểm tra dữ liệu thực tế** trong bảng `orders`:
   - Xem có orders nào với `sale_staff` tương tự không
   - Xem format của `shift`, `product`, `country` như thế nào

2. **So sánh từng điều kiện** để tìm điều kiện nào không khớp

3. **Cải thiện normalize** nếu cần (ví dụ: xử lý tên không dấu)

4. **Thêm logging** trong code để debug chi tiết hơn
