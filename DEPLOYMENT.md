# Hướng dẫn Deploy lên Vercel

## Bước 1: Cài đặt Dependencies

```bash
cd orders-api
npm install
```

## Bước 2: Cấu hình Environment Variables

### Trên Vercel Dashboard:

1. Vào project settings → Environment Variables
2. Thêm các biến sau:

```
SUPABASE_URL=https://gsjhsmxyxjyiqovauyrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

**Lưu ý quan trọng:**
- `SUPABASE_SERVICE_ROLE_KEY` phải là **service role key**, không phải anon key
- Service role key có quyền bypass RLS (Row Level Security)
- ⚠️ **KHÔNG commit key vào Git** - chỉ set trong Vercel Dashboard

📖 **Xem chi tiết:** [SETUP_ENV.md](./SETUP_ENV.md)

## Bước 3: Deploy

### Option 1: Deploy qua Vercel CLI

```bash
# Install Vercel CLI (nếu chưa có)
npm i -g vercel

# Login vào Vercel
vercel login

# Deploy (lần đầu sẽ hỏi các câu hỏi về project)
vercel

# Deploy production
vercel --prod
```

### Option 2: Deploy qua GitHub

1. Push code lên GitHub repository
2. Vào Vercel Dashboard → Add New Project
3. Import GitHub repository
4. Vercel sẽ tự động detect và deploy

## Bước 4: Cấu hình Supabase Webhook (Tùy chọn)

Để tự động tính `order_count` khi có record mới:

1. Vào Supabase Dashboard → Database → Webhooks
2. Click "Create a new webhook"
3. Cấu hình:
   - **Name:** `sales_reports_order_count`
   - **Table:** `sales_reports`
   - **Events:** Chọn `INSERT` và `UPDATE`
   - **HTTP Request:**
     - **URL:** `https://your-domain.vercel.app/api/webhook-sales-reports`
     - **Method:** `POST`
     - **HTTP Headers:** (để trống hoặc thêm authentication nếu cần)

## Bước 5: Lấy URL API

Sau khi deploy, Vercel sẽ cung cấp URL cho project của bạn. Có 2 loại URL:

### a) Preview URL (cho mỗi lần deploy)
- Format: `https://orders-api-xxxxx.vercel.app`
- Thay đổi mỗi lần deploy mới

### b) Production URL (cố định)
- Format: `https://orders-api.vercel.app` (nếu bạn set custom domain)
- Hoặc: `https://your-project-name.vercel.app`
- URL này cố định và không thay đổi

**Cách xem URL:**
1. Sau khi chạy `vercel` hoặc `vercel --prod`, terminal sẽ hiển thị URL
2. Hoặc vào Vercel Dashboard → Project → Settings → Domains

### API Endpoints

Sau khi có URL, các API endpoints sẽ là:

```
https://your-domain.vercel.app/api/calculate-order-count
https://your-domain.vercel.app/api/webhook-sales-reports
```

**Ví dụ cụ thể:**
- Nếu domain là `orders-api.vercel.app`, thì:
  - API tính toán: `https://orders-api.vercel.app/api/calculate-order-count`
  - Webhook: `https://orders-api.vercel.app/api/webhook-sales-reports`

## Bước 6: Test API

Sau khi có URL, test API:

```bash
# Thay YOUR_DOMAIN bằng domain thực tế của bạn
# Ví dụ: https://orders-api.vercel.app

# Test tính toán cho một record
curl "https://YOUR_DOMAIN/api/calculate-order-count?recordId=123"

# Test tính toán cho một ngày
curl "https://YOUR_DOMAIN/api/calculate-order-count?date=2026-01-15"

# Test tính toán lại tất cả
curl "https://YOUR_DOMAIN/api/calculate-order-count?recalculateAll=true"

# Test webhook (POST request)
curl -X POST "https://YOUR_DOMAIN/api/webhook-sales-reports" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "record": {
      "id": "123",
      "name": "Nguyễn Văn A",
      "date": "2026-01-15",
      "shift": "Hết ca",
      "product": "SP1",
      "market": "VN"
    }
  }'
```

## Troubleshooting

### Lỗi: Missing Supabase configuration
- Kiểm tra environment variables trong Vercel Dashboard
- Đảm bảo đã set cả `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`

### Lỗi: RLS Policy Error
- Đảm bảo đang dùng **service role key**, không phải anon key
- Service role key có quyền bypass RLS

### Timeout Error
- Vercel Hobby plan: timeout 10s
- Vercel Pro plan: timeout 60s
- Nếu có quá nhiều records, chia nhỏ theo ngày hoặc dùng cron job

### Webhook không hoạt động
- Kiểm tra URL webhook có đúng không
- Kiểm tra logs trong Vercel Dashboard → Functions
- Test webhook bằng cách tạo record mới trong `sales_reports`
