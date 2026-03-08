# Quick Start - Cấu hình nhanh

## Bước 1: Cài đặt Dependencies

```bash
cd orders-api
npm install
```

## Bước 2: Cấu hình Environment Variables trong Vercel

### Option A: Qua Vercel Dashboard (Khuyến nghị)

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project → **Settings** → **Environment Variables**
3. Thêm 2 biến:

```
SUPABASE_URL = https://gsjhsmxyxjyiqovauyrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

4. Chọn **Production**, **Preview**, **Development**
5. Click **Save**

### Option B: Qua Vercel CLI

```bash
# Set environment variables
vercel env add SUPABASE_URL production
# Nhập: https://gsjhsmxyxjyiqovauyrp.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Nhập: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

## Bước 3: Deploy

```bash
# Deploy lên Vercel
vercel --prod
```

Sau khi deploy, terminal sẽ hiển thị URL:
```
✅ Production: https://your-project.vercel.app
```

## Bước 4: Test API

```bash
# Thay YOUR_DOMAIN bằng domain thực tế
curl "https://YOUR_DOMAIN/api/calculate-order-count?recordId=123"
```

## Bước 5: (Tùy chọn) Cấu hình Webhook

1. Vào Supabase Dashboard → Database → Webhooks
2. Tạo webhook mới:
   - **Table:** `sales_reports`
   - **Events:** `INSERT`, `UPDATE`
   - **URL:** `https://YOUR_DOMAIN/api/webhook-sales-reports`

---

## ✅ Hoàn thành!

Bây giờ bạn có thể:
- Gọi API để tính toán `order_count`
- Webhook sẽ tự động tính toán khi có record mới

📖 **Xem thêm:**
- [SETUP_ENV.md](./SETUP_ENV.md) - Chi tiết về environment variables
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Hướng dẫn deploy đầy đủ
- [API_URLS.md](./API_URLS.md) - Cách tìm URL API
