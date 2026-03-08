# Cách lấy Link API

## ⚠️ Chưa có link API vì chưa deploy!

Để có link API, bạn cần **deploy lên Vercel** trước.

---

## Bước 1: Login vào Vercel

```bash
cd orders-api
vercel login
```

Lệnh này sẽ mở browser để bạn đăng nhập vào Vercel (hoặc tạo tài khoản mới nếu chưa có).

---

## Bước 2: Deploy lên Vercel

Sau khi login xong, chạy:

```bash
vercel --prod
```

**Lần đầu deploy sẽ hỏi:**
- Set up and deploy? → **Y**
- Which scope? → Chọn account của bạn
- Link to existing project? → **N** (tạo project mới)
- What's your project's name? → Nhập tên (ví dụ: `orders-api`)
- In which directory is your code located? → **./** (hoặc Enter)
- Want to override the settings? → **N**

**Sau khi deploy xong, terminal sẽ hiển thị:**
```
✅ Production: https://orders-api-xxxxx.vercel.app [copied to clipboard]
```

**Đây chính là link API của bạn!**

---

## Bước 3: Lấy Link API

Sau khi deploy, bạn sẽ có 2 loại URL:

### Production URL (Cố định):
```
https://your-project-name.vercel.app
```

### API Endpoints:
```
https://your-project-name.vercel.app/api/calculate-order-count
https://your-project-name.vercel.app/api/webhook-sales-reports
```

---

## Bước 4: Cấu hình Environment Variables (QUAN TRỌNG!)

Sau khi deploy, bạn **PHẢI** set environment variables trong Vercel Dashboard:

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project vừa deploy
3. Vào **Settings** → **Environment Variables**
4. Thêm 2 biến:

```
SUPABASE_URL = https://gsjhsmxyxjyiqovauyrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

5. Chọn **Production**, **Preview**, **Development**
6. Click **Save**
7. **Redeploy** project (Vercel sẽ tự động redeploy khi thay đổi env vars)

---

## Bước 5: Test API

Sau khi set environment variables và redeploy, test API:

```bash
# Thay YOUR_DOMAIN bằng domain thực tế
curl "https://YOUR_DOMAIN/api/calculate-order-count?recordId=123"
```

---

## Cách xem Link API sau khi deploy

### Cách 1: Xem trong Terminal
Sau khi chạy `vercel --prod`, terminal sẽ hiển thị URL.

### Cách 2: Xem trong Vercel Dashboard
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project
3. URL hiển thị ở:
   - **Overview tab** → Phần "Domains"
   - **Settings** → **Domains**

---

## Ví dụ Link API thực tế

Sau khi deploy, link sẽ có dạng:

```
https://orders-api.vercel.app/api/calculate-order-count
https://orders-api.vercel.app/api/webhook-sales-reports
```

Hoặc:

```
https://orders-api-abc123xyz.vercel.app/api/calculate-order-count
https://orders-api-abc123xyz.vercel.app/api/webhook-sales-reports
```

---

## Lưu ý

1. **Chưa deploy = Chưa có link:** Code chỉ có trên Git, chưa chạy trên server
2. **Phải set Environment Variables:** Nếu không set, API sẽ báo lỗi "Missing Supabase configuration"
3. **Redeploy sau khi set env vars:** Để Vercel nhận biến môi trường mới

---

## Troubleshooting

### Lỗi: No existing credentials found
→ Chạy `vercel login` trước

### Lỗi: Missing Supabase configuration
→ Đã set environment variables trong Vercel Dashboard chưa?
→ Đã redeploy sau khi set env vars chưa?

### Không thấy URL sau khi deploy
→ Kiểm tra Vercel Dashboard → Project → Overview
