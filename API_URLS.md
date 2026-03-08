# Đường link API - Hướng dẫn tìm URL

## Cấu trúc URL API

Sau khi deploy lên Vercel, URL API sẽ có dạng:

```
https://YOUR_DOMAIN/api/ENDPOINT_NAME
```

## Các API Endpoints

### 1. Tính toán order_count
```
GET/POST https://YOUR_DOMAIN/api/calculate-order-count
```

**Ví dụ với query params:**
```
https://YOUR_DOMAIN/api/calculate-order-count?recordId=123
https://YOUR_DOMAIN/api/calculate-order-count?date=2026-01-15
https://YOUR_DOMAIN/api/calculate-order-count?recalculateAll=true
```

### 2. Webhook handler
```
POST https://YOUR_DOMAIN/api/webhook-sales-reports
```

---

## Cách tìm URL sau khi deploy

### Cách 1: Xem trong Terminal

Sau khi chạy lệnh deploy:
```bash
vercel
# hoặc
vercel --prod
```

Terminal sẽ hiển thị:
```
✅ Production: https://orders-api-abc123.vercel.app [copied to clipboard]
```

### Cách 2: Xem trong Vercel Dashboard

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. URL sẽ hiển thị ở:
   - **Overview tab**: Ở phần "Domains"
   - **Settings → Domains**: Xem tất cả domains

### Cách 3: Kiểm tra trong code

Nếu bạn đã deploy trước đó, URL có thể được lưu trong file `.vercel/project.json`:
```json
{
  "projectId": "...",
  "orgId": "..."
}
```

---

## Ví dụ URL thực tế

Giả sử project name của bạn là `orders-api`, URL sẽ là:

### Production URL:
```
https://orders-api.vercel.app
```

### API Endpoints:
```
https://orders-api.vercel.app/api/calculate-order-count
https://orders-api.vercel.app/api/webhook-sales-reports
```

### Preview URL (mỗi lần deploy mới):
```
https://orders-api-git-main-yourusername.vercel.app
https://orders-api-abc123xyz.vercel.app
```

---

## Test API ngay

### Sử dụng curl:
```bash
# Thay YOUR_DOMAIN bằng domain thực tế
curl "https://YOUR_DOMAIN/api/calculate-order-count?recordId=123"
```

### Sử dụng browser:
Mở trình duyệt và truy cập:
```
https://YOUR_DOMAIN/api/calculate-order-count?recordId=123
```

### Sử dụng Postman/Insomnia:
- Method: `GET`
- URL: `https://YOUR_DOMAIN/api/calculate-order-count?recordId=123`

---

## Lưu ý

1. **URL sẽ khác nhau** tùy vào:
   - Project name bạn đặt khi deploy
   - Có set custom domain hay không

2. **Preview vs Production:**
   - Preview URL: Thay đổi mỗi lần deploy
   - Production URL: Cố định (nếu set trong Vercel)

3. **HTTPS:**
   - Tất cả URL đều dùng HTTPS (Vercel tự động cung cấp SSL)

4. **CORS:**
   - API đã được cấu hình CORS, có thể gọi từ bất kỳ domain nào

---

## Troubleshooting

### Lỗi: Cannot GET /api/...
→ Kiểm tra:
- URL có đúng không?
- Đã deploy chưa?
- File có nằm đúng trong thư mục `api/` không?

### Lỗi: 404 Not Found
→ Kiểm tra:
- Tên endpoint có đúng không?
- Đã deploy lên production chưa? (dùng `vercel --prod`)

### Lỗi: 500 Internal Server Error
→ Kiểm tra:
- Environment variables đã set chưa?
- Logs trong Vercel Dashboard → Functions
