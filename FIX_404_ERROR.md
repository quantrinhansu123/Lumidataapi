# Fix 404 NOT_FOUND Error

## Nguyên nhân có thể

1. **Vercel không detect được TypeScript files**
2. **API routes không được deploy**
3. **Environment variables chưa được set**
4. **Cấu trúc thư mục không đúng**

## Cách kiểm tra và sửa

### 1. Kiểm tra trong Vercel Dashboard

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project `lumidataapi`
3. Vào tab **Deployments** → chọn deployment mới nhất
4. Xem tab **Functions**:
   - Nếu thấy `api/calculate-order-count.ts` → OK
   - Nếu không thấy → Vercel không detect được files

### 2. Kiểm tra Environment Variables

1. Vào **Settings** → **Environment Variables**
2. Đảm bảo có:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Chọn **Production**, **Preview**, **Development**
4. Click **Save**

### 3. Kiểm tra URL đúng format

**Đúng:**
```
https://lumidataapi.vercel.app/api/calculate-order-count?recordId=YOUR_ID
```

**Sai:**
```
https://lumidataapi.vercel.app/calculate-order-count  ❌
https://lumidataapi.vercel.app/api/calculate-order-count.ts  ❌
```

### 4. Xem Logs để debug

1. Trong deployment, xem tab **Logs**
2. Tìm lỗi khi build hoặc khi gọi API
3. Kiểm tra xem có lỗi TypeScript compilation không

### 5. Test với curl

```bash
# Test API
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=test"

# Nếu vẫn 404, thử:
curl "https://lumidataapi.vercel.app/api/calculate-order-count"
```

## Giải pháp đã áp dụng

1. ✅ Thêm `buildCommand: "npm install"` vào vercel.json
2. ✅ Thêm `runtime: "@vercel/node"` cho functions
3. ✅ Đảm bảo cấu trúc thư mục đúng: `api/*.ts`

## Nếu vẫn 404

1. **Redeploy từ Vercel Dashboard:**
   - Vào deployment → Click **Redeploy**

2. **Kiểm tra Root Directory:**
   - Vào **Settings** → **General**
   - Đảm bảo **Root Directory** = `orders-api` (nếu deploy từ thư mục cha)

3. **Xem Build Logs:**
   - Trong deployment → **Logs** tab
   - Kiểm tra xem có lỗi build không

4. **Test local trước:**
   ```bash
   cd orders-api
   npm install
   vercel dev
   # Test: http://localhost:3000/api/calculate-order-count?recordId=test
   ```

## Cấu trúc thư mục đúng

```
orders-api/
├── api/
│   ├── calculate-order-count.ts
│   ├── debug-matching.ts
│   ├── utils.ts
│   └── webhook-sales-reports.ts
├── package.json
├── tsconfig.json
└── vercel.json
```
