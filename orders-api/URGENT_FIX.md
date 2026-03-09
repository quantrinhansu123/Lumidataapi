# ⚠️ URGENT: Fix Environment Variables trong Vercel Dashboard

## Vấn đề:
API trả về "Not Found" vì environment variables đang reference Secret không tồn tại.

## Link API hiện tại:
```
https://lumidataapi.vercel.app
```

## Cách Fix (PHẢI LÀM NGAY):

### Bước 1: Vào Vercel Dashboard
1. Mở: https://vercel.com/dashboard
2. Chọn project: **lumidataapi**

### Bước 2: Xóa TẤT CẢ Environment Variables cũ
1. Vào **Settings** → **Environment Variables**
2. XÓA tất cả các biến sau (nếu có):
   - `SUPABASE_URL` (bất kỳ environment nào)
   - `SUPABASE_SERVICE_ROLE_KEY` (bất kỳ environment nào)
   - Bất kỳ biến nào có dấu hiệu reference Secret

### Bước 3: Thêm lại với giá trị TRỰC TIẾP

**Thêm SUPABASE_URL:**
- Click **Add New**
- **Key:** `SUPABASE_URL`
- **Value:** `https://gsjhsmxyxjyiqovauyrp.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

**Thêm SUPABASE_SERVICE_ROLE_KEY:**
- Click **Add New**
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### Bước 4: Redeploy
1. Vào tab **Deployments**
2. Chọn deployment mới nhất
3. Click **"..."** (3 chấm) → **Redeploy**
4. Hoặc chạy: `vercel --prod`

### Bước 5: Test API
Sau khi redeploy xong, test:
```bash
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=123"
```

---

## ⚠️ LƯU Ý QUAN TRỌNG:

1. **KHÔNG dùng Secret reference** - Phải nhập giá trị trực tiếp
2. **Phải chọn cả 3 environments:** Production, Preview, Development
3. **Phải Redeploy** sau khi thay đổi env vars

---

## Sau khi fix xong:

Link API sẽ là:
```
https://lumidataapi.vercel.app/api/calculate-order-count
https://lumidataapi.vercel.app/api/webhook-sales-reports
```
