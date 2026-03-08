# Fix Lỗi Deploy: Environment Variable references Secret

## Lỗi hiện tại:
```
Error: Environment Variable "SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

## Nguyên nhân:
Trong Vercel Dashboard có cấu hình environment variable đang reference một Secret không tồn tại.

## Cách Fix:

### Option 1: Fix qua Vercel Dashboard (Khuyến nghị)

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project **lumidataapi**
3. Vào **Settings** → **Environment Variables**
4. Tìm và **XÓA** tất cả các biến:
   - `SUPABASE_URL` (nếu có reference Secret)
   - `SUPABASE_SERVICE_ROLE_KEY` (nếu có reference Secret)
5. **Thêm lại** với giá trị trực tiếp:

   **SUPABASE_URL:**
   ```
   Key: SUPABASE_URL
   Value: https://gsjhsmxyxjyiqovauyrp.supabase.co
   Environments: Production, Preview, Development
   ```

   **SUPABASE_SERVICE_ROLE_KEY:**
   ```
   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI
   Environments: Production, Preview, Development
   ```

6. Click **Save**
7. Vào **Deployments** tab → Chọn deployment mới nhất → Click **Redeploy**

### Option 2: Fix qua Vercel CLI

```bash
# Xóa tất cả các biến cũ
vercel env rm SUPABASE_URL
vercel env rm SUPABASE_SERVICE_ROLE_KEY

# Thêm lại với giá trị trực tiếp
echo "https://gsjhsmxyxjyiqovauyrp.supabase.co" | vercel env add SUPABASE_URL production
echo "https://gsjhsmxyxjyiqovauyrp.supabase.co" | vercel env add SUPABASE_URL preview
echo "https://gsjhsmxyxjyiqovauyrp.supabase.co" | vercel env add SUPABASE_URL development

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI" | vercel env add SUPABASE_SERVICE_ROLE_KEY development

# Deploy lại
vercel --prod
```

## Sau khi fix:

1. Deploy lại: `vercel --prod`
2. Kiểm tra URL trong terminal hoặc Vercel Dashboard
3. Test API: `curl "https://YOUR_DOMAIN/api/calculate-order-count?recordId=123"`

## Lưu ý:

- **KHÔNG** dùng Secret reference nếu Secret không tồn tại
- Nên set giá trị trực tiếp trong Environment Variables
- Sau khi thay đổi env vars, cần redeploy để áp dụng
