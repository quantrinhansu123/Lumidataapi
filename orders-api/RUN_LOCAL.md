# Chạy API Local

## Bước 1: Cài đặt Dependencies

```bash
cd orders-api
npm install
```

## Bước 2: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `orders-api`:

```bash
SUPABASE_URL=https://gsjhsmxyxjyiqovauyrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

**Lưu ý:** File `.env.local` đã được gitignore, sẽ không bị commit.

## Bước 3: Chạy Local Server

```bash
npm run dev
```

Hoặc:

```bash
vercel dev
```

Server sẽ chạy tại: `http://localhost:3000`

## Bước 4: Test API

### Tính toán cho một record:
```
http://localhost:3000/api/calculate-order-count?recordId=02eac5ae-721b-4e11-bfcf-351e5f4bba42
```

### Tính toán theo ngày:
```
http://localhost:3000/api/calculate-order-count?date=2026-01-02
```

### Debug matching:
```
http://localhost:3000/api/debug-matching?recordId=02eac5ae-721b-4e11-bfcf-351e5f4bba42
```

## Lưu ý

1. **Port mặc định:** `3000` (có thể thay đổi nếu port đã được dùng)
2. **Hot reload:** Code sẽ tự động reload khi có thay đổi
3. **Environment variables:** Đọc từ file `.env.local`
4. **Logs:** Xem trong terminal

## Troubleshooting

### Lỗi: Port already in use
→ Thay đổi port: `vercel dev -p 3001`

### Lỗi: Missing Supabase configuration
→ Kiểm tra file `.env.local` đã có đúng chưa

### Lỗi: Module not found
→ Chạy lại `npm install`
