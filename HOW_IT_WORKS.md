# Cách hoạt động - Tự động ghi vào Supabase

## ✅ Có tự động ghi vào Supabase

Sau khi tính toán xong, hệ thống **TỰ ĐỘNG** ghi giá trị `order_count` vào bảng `sales_reports` trong Supabase.

## Quy trình hoạt động

### 1. API `/api/calculate-order-count`

**Bước 1:** Lấy danh sách `sales_reports` cần tính toán
```typescript
const salesReports = await supabase
  .from('sales_reports')
  .select('*')
  // ... với các filter tùy chọn
```

**Bước 2:** Lấy tất cả `orders` từ database
```typescript
const allOrders = await fetchAllOrders(supabase, 10000);
```

**Bước 3:** Đếm số orders khớp với từng sales report
```typescript
let orderCount = 0;
for (const order of allOrders) {
  if (orderMatchesSalesReport(order, salesReport)) {
    orderCount++;
  }
}
```

**Bước 4:** ✅ **TỰ ĐỘNG GHI VÀO SUPABASE**
```typescript
await supabase
  .from('sales_reports')
  .update({ order_count: orderCount })
  .eq('id', salesReport.id);
```

**Kết quả:** Giá trị `order_count` được cập nhật trực tiếp vào database.

---

### 2. Webhook `/api/webhook-sales-reports`

**Bước 1:** Nhận webhook từ Supabase khi có INSERT/UPDATE

**Bước 2:** Lấy tất cả `orders` từ database

**Bước 3:** Đếm số orders khớp

**Bước 4:** ✅ **TỰ ĐỘNG GHI VÀO SUPABASE**
```typescript
await supabase
  .from('sales_reports')
  .update({ order_count: orderCount })
  .eq('id', salesReport.id);
```

**Kết quả:** Giá trị `order_count` được cập nhật ngay sau khi có record mới/cập nhật.

---

## Ví dụ thực tế

### Scenario 1: Tính toán thủ công

```bash
# Gọi API
curl "https://your-domain.vercel.app/api/calculate-order-count?recordId=123"
```

**Quá trình:**
1. API lấy record có `id=123` từ `sales_reports`
2. Đếm số orders khớp: tìm thấy 5 orders
3. ✅ **Tự động UPDATE vào Supabase:**
   ```sql
   UPDATE sales_reports 
   SET order_count = 5 
   WHERE id = '123'
   ```
4. Trả về response với thông tin đã cập nhật

**Kết quả:** Bạn có thể kiểm tra trong Supabase Dashboard, cột `order_count` của record `123` đã được cập nhật thành `5`.

---

### Scenario 2: Webhook tự động

1. Bạn tạo record mới trong `sales_reports`:
   ```sql
   INSERT INTO sales_reports (name, date, shift, product, market)
   VALUES ('Nguyễn Văn A', '2026-01-15', 'Hết ca', 'SP1', 'VN');
   ```

2. Supabase tự động gọi webhook → API `/api/webhook-sales-reports`

3. API tính toán và ✅ **Tự động UPDATE:**
   ```sql
   UPDATE sales_reports 
   SET order_count = 3 
   WHERE id = 'new_record_id'
   ```

**Kết quả:** Record mới vừa tạo đã có `order_count = 3` ngay lập tức.

---

## Xác nhận kết quả

### Cách 1: Kiểm tra trong Supabase Dashboard

1. Vào Supabase Dashboard → Table Editor
2. Chọn bảng `sales_reports`
3. Xem cột `order_count` - giá trị đã được cập nhật

### Cách 2: Query trực tiếp

```sql
SELECT id, name, date, order_count 
FROM sales_reports 
WHERE id = '123';
```

### Cách 3: Xem trong Response API

Response từ API sẽ trả về thông tin đã cập nhật:

```json
{
  "success": true,
  "message": "Successfully calculated order_count for 10 records",
  "updated": 10,
  "data": [
    {
      "id": "123",
      "name": "Nguyễn Văn A",
      "date": "2026-01-15",
      "order_count": 5  // ← Giá trị đã được ghi vào DB
    }
  ]
}
```

---

## Lưu ý quan trọng

### ✅ Điều gì được đảm bảo:

1. **Tự động ghi:** Không cần thao tác thủ công, giá trị tự động được ghi vào database
2. **Real-time:** Khi dùng webhook, giá trị được cập nhật ngay sau khi có thay đổi
3. **Atomic:** Mỗi record được update riêng biệt, nếu một record lỗi không ảnh hưởng các record khác

### ⚠️ Điều cần lưu ý:

1. **Service Role Key:** Phải dùng service role key để có quyền UPDATE (không phải anon key)
2. **RLS Policies:** Service role key bypass RLS, nên có thể update bất kỳ record nào
3. **Error Handling:** Nếu update fail, sẽ có log trong Vercel Dashboard → Functions
4. **Idempotent:** Gọi API nhiều lần sẽ tính lại và update lại giá trị (có thể khác nhau nếu dữ liệu orders thay đổi)

---

## Troubleshooting

### Vấn đề: order_count không được cập nhật

**Kiểm tra:**
1. ✅ Environment variables đã set đúng chưa? (`SUPABASE_SERVICE_ROLE_KEY`)
2. ✅ Service role key có quyền UPDATE không?
3. ✅ Record có tồn tại trong database không?
4. ✅ Xem logs trong Vercel Dashboard → Functions để xem lỗi cụ thể

### Vấn đề: order_count = 0 nhưng có orders khớp

**Kiểm tra:**
1. ✅ Logic matching có đúng không? (name, date, shift, product, market)
2. ✅ Dữ liệu orders có đầy đủ không? (sale_staff, order_date, shift, product, country)
3. ✅ Format dữ liệu có khớp không? (normalize string, date format)

### Vấn đề: Webhook không update

**Kiểm tra:**
1. ✅ Webhook đã được cấu hình đúng chưa?
2. ✅ URL webhook có đúng không?
3. ✅ Xem logs trong Vercel Dashboard → Functions
4. ✅ Test bằng cách gọi API thủ công: `?recordId=xxx`
