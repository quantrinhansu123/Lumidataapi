# Chạy Local - Hướng dẫn nhanh

## ✅ Đã cài đặt dependencies

## Bước tiếp theo:

### 1. Tạo file `.env.local`

Tạo file `.env.local` trong thư mục `orders-api` với nội dung:

```
SUPABASE_URL=https://gsjhsmxyxjyiqovauyrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

### 2. Chạy server

Mở terminal mới và chạy:

```bash
cd C:\Users\admin\Desktop\orders-api\orders-api
npm run dev
```

Hoặc:

```bash
vercel dev
```

### 3. Server sẽ chạy tại:

```
http://localhost:3000
```

### 4. Test API

Mở browser hoặc dùng curl:

```bash
# Test tính toán
curl "http://localhost:3000/api/calculate-order-count?recordId=02eac5ae-721b-4e11-bfcf-351e5f4bba42"

# Test debug
curl "http://localhost:3000/api/debug-matching?recordId=02eac5ae-721b-4e11-bfcf-351e5f4bba42"
```

## Lưu ý

- Server sẽ tự động reload khi có thay đổi code
- Xem logs trong terminal để debug
- Port mặc định: `3000` (có thể thay đổi nếu bị conflict)

## Troubleshooting

### Port đã được dùng:
```bash
vercel dev -p 3001
```

### Lỗi environment variables:
→ Kiểm tra file `.env.local` đã tạo đúng chưa

### Lỗi module not found:
→ Chạy lại `npm install`
