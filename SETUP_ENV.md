# Cấu hình Environment Variables

## ⚠️ QUAN TRỌNG: Bảo mật Key

**Service Role Key là thông tin nhạy cảm:**
- ❌ **KHÔNG** commit key vào Git
- ❌ **KHÔNG** chia sẻ key công khai
- ✅ Chỉ set trong Vercel Dashboard hoặc file `.env` (đã được gitignore)

---

## Cấu hình cho Vercel (Production)

### Bước 1: Vào Vercel Dashboard

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn (hoặc tạo project mới)
3. Vào **Settings** → **Environment Variables**

### Bước 2: Thêm Environment Variables

Thêm 2 biến sau:

#### 1. SUPABASE_URL
```
Key: SUPABASE_URL
Value: https://gsjhsmxyxjyiqovauyrp.supabase.co
```

#### 2. SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

### Bước 3: Chọn Environment

Chọn các môi trường áp dụng:
- ✅ **Production**
- ✅ **Preview** (nếu muốn test trên preview deployments)
- ✅ **Development** (nếu muốn test local)

### Bước 4: Save

Click **Save** để lưu các biến môi trường.

---

## Cấu hình cho Local Development (Tùy chọn)

Nếu muốn test local, tạo file `.env` trong thư mục `orders-api`:

```bash
# File: orders-api/.env
SUPABASE_URL=https://gsjhsmxyxjyiqovauyrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
```

**Lưu ý:** File `.env` đã được gitignore, sẽ không bị commit vào Git.

---

## Xác nhận cấu hình

### Cách 1: Kiểm tra trong Vercel Dashboard

1. Vào **Settings** → **Environment Variables**
2. Xem danh sách các biến đã thêm
3. Đảm bảo cả 2 biến đều có giá trị

### Cách 2: Test API sau khi deploy

Sau khi deploy, test API:

```bash
curl "https://YOUR_DOMAIN/api/calculate-order-count?recordId=123"
```

Nếu trả về lỗi "Missing Supabase configuration", kiểm tra lại environment variables.

---

## Troubleshooting

### Lỗi: Missing Supabase configuration

**Nguyên nhân:**
- Environment variables chưa được set trong Vercel
- Tên biến không đúng (phải là `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`)

**Giải pháp:**
1. Vào Vercel Dashboard → Settings → Environment Variables
2. Kiểm tra xem đã có 2 biến chưa
3. Đảm bảo giá trị đúng
4. Redeploy project (Vercel sẽ tự động redeploy khi thay đổi env vars)

### Lỗi: RLS Policy Error

**Nguyên nhân:**
- Đang dùng anon key thay vì service role key
- Service role key không đúng

**Giải pháp:**
1. Đảm bảo đang dùng **service role key** (key bạn vừa cung cấp)
2. Kiểm tra key có đúng không (có thể test trong Supabase Dashboard)

### Lỗi: Invalid API key

**Nguyên nhân:**
- Key đã hết hạn hoặc không hợp lệ
- Key bị sai format

**Giải pháp:**
1. Kiểm tra lại key trong Supabase Dashboard → Settings → API
2. Copy lại service_role key mới nếu cần

---

## Bảo mật

### ✅ Best Practices:

1. **Không commit key vào Git:**
   - File `.env` đã được gitignore
   - Không paste key vào code hoặc comments

2. **Rotate key định kỳ:**
   - Nếu key bị lộ, tạo key mới trong Supabase Dashboard
   - Update lại trong Vercel

3. **Chỉ dùng Service Role Key cho backend:**
   - Không dùng trong frontend code
   - Chỉ dùng trong serverless functions

4. **Giới hạn quyền:**
   - Service role key có full access, nên bảo vệ cẩn thận
   - Chỉ những người cần thiết mới có quyền truy cập

---

## Thông tin Supabase Project

Dựa trên key bạn cung cấp:

- **Project Reference:** `gsjhsmxyxjyiqovauyrp`
- **Supabase URL:** `https://gsjhsmxyxjyiqovauyrp.supabase.co`
- **Service Role Key:** (đã được set trong Vercel)
