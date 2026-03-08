# Khi nào tính toán order_count được kích hoạt?

Có **2 cách** để kích hoạt tính toán `order_count`:

## 1. Tính toán THỦ CÔNG (Manual) - Gọi API trực tiếp

Bạn có thể gọi API `/api/calculate-order-count` bất cứ lúc nào để tính toán:

### Các trường hợp sử dụng:

#### a) Tính toán cho một record cụ thể
```bash
GET /api/calculate-order-count?recordId=123
```
**Khi nào dùng:**
- Khi bạn vừa tạo/sửa một record trong `sales_reports` và muốn tính lại ngay
- Khi bạn muốn kiểm tra lại kết quả của một record cụ thể
- Khi có lỗi và muốn tính lại cho record đó

#### b) Tính toán cho tất cả records trong một ngày
```bash
GET /api/calculate-order-count?date=2026-01-15
```
**Khi nào dùng:**
- Sau khi import dữ liệu orders cho một ngày cụ thể
- Khi muốn tính lại tất cả records của một ngày (ví dụ: sau khi sửa dữ liệu orders)
- Chạy định kỳ hàng ngày (có thể dùng cron job)

#### c) Tính toán cho các records chưa có order_count
```bash
GET /api/calculate-order-count
```
**Khi nào dùng:**
- Lần đầu tiên setup hệ thống
- Sau khi thêm nhiều records mới vào `sales_reports` mà chưa có `order_count`
- Khi muốn tính toán cho các records còn thiếu

#### d) Tính toán lại TẤT CẢ records
```bash
GET /api/calculate-order-count?recalculateAll=true
```
**Khi nào dùng:**
- Khi có thay đổi lớn trong dữ liệu `orders` (ví dụ: import lại dữ liệu)
- Khi muốn đảm bảo tất cả `order_count` đều chính xác
- Sau khi sửa logic matching (nếu có)
- **Lưu ý:** Chỉ nên dùng khi thực sự cần, vì sẽ xử lý nhiều records (có thể mất thời gian)

---

## 2. Tính toán TỰ ĐỘNG (Automatic) - Qua Webhook

Khi cấu hình Supabase Webhook, tính toán sẽ **tự động kích hoạt** mỗi khi:

### a) Có record MỚI được INSERT vào `sales_reports`
- Khi bạn thêm một record mới vào bảng `sales_reports`
- Supabase sẽ tự động gọi webhook → API tính toán `order_count` ngay lập tức

### b) Có record được UPDATE trong `sales_reports`
- Khi bạn sửa các trường liên quan (name, date, shift, product, market)
- Supabase sẽ tự động gọi webhook → API tính toán lại `order_count`

**Lưu ý:** Webhook chỉ hoạt động khi bạn đã cấu hình trong Supabase Dashboard (xem hướng dẫn bên dưới)

---

## So sánh 2 cách

| Tiêu chí | Thủ công (API) | Tự động (Webhook) |
|----------|---------------|-------------------|
| **Khi nào kích hoạt** | Khi bạn gọi API | Tự động khi INSERT/UPDATE |
| **Tốc độ** | Ngay lập tức | Ngay lập tức (sau khi có thay đổi) |
| **Phù hợp** | Tính toán hàng loạt, tính lại nhiều records | Tính toán từng record khi có thay đổi |
| **Setup** | Không cần setup gì | Cần cấu hình webhook trong Supabase |
| **Chi phí** | Tính theo số lần gọi API | Tính theo số lần webhook trigger |

---

## Khuyến nghị sử dụng

### Kịch bản 1: Setup lần đầu
1. Chạy `GET /api/calculate-order-count?recalculateAll=true` để tính toán tất cả records hiện có
2. Cấu hình webhook để tự động tính toán cho các records mới

### Kịch bản 2: Hàng ngày
1. Cấu hình webhook để tự động tính toán khi có record mới
2. (Tùy chọn) Chạy cron job mỗi ngày: `GET /api/calculate-order-count?date=YYYY-MM-DD` để đảm bảo tính chính xác

### Kịch bản 3: Import dữ liệu lớn
1. Sau khi import xong, chạy `GET /api/calculate-order-count?date=YYYY-MM-DD` cho từng ngày
2. Hoặc chạy `GET /api/calculate-order-count?recalculateAll=true` một lần (nếu có ít records)

### Kịch bản 4: Chỉ tính toán khi cần
- Không cấu hình webhook
- Chỉ gọi API khi cần thiết (ví dụ: khi user xem báo cáo)

---

## Cấu hình Webhook (Để tự động kích hoạt)

### Bước 1: Lấy URL của API
Sau khi deploy lên Vercel, bạn sẽ có URL dạng:
```
https://your-project.vercel.app/api/webhook-sales-reports
```

### Bước 2: Cấu hình trong Supabase
1. Vào **Supabase Dashboard** → **Database** → **Webhooks**
2. Click **"Create a new webhook"**
3. Điền thông tin:
   - **Name:** `sales_reports_order_count`
   - **Table:** `sales_reports`
   - **Events:** Chọn `INSERT` và `UPDATE`
   - **HTTP Request:**
     - **URL:** `https://your-project.vercel.app/api/webhook-sales-reports`
     - **Method:** `POST`
     - **HTTP Headers:** (để trống hoặc thêm authentication nếu cần)
4. Click **"Save"**

### Bước 3: Test
1. Tạo một record mới trong `sales_reports`
2. Kiểm tra xem `order_count` có được tính tự động không
3. Xem logs trong Vercel Dashboard → Functions để debug nếu cần

---

## Lưu ý quan trọng

1. **Webhook chỉ hoạt động khi:**
   - Đã cấu hình trong Supabase Dashboard
   - URL webhook đúng và accessible
   - Environment variables đã được set trong Vercel

2. **Timeout:**
   - Vercel Hobby: 10 giây
   - Vercel Pro: 60 giây
   - Nếu có quá nhiều orders, có thể bị timeout → nên dùng tính toán thủ công với pagination

3. **Performance:**
   - Webhook: Tốt cho từng record (tự động)
   - API thủ công: Tốt cho nhiều records (batch processing)

4. **Error handling:**
   - Nếu webhook fail, bạn có thể chạy lại bằng API thủ công
   - Kiểm tra logs trong Vercel Dashboard để debug
