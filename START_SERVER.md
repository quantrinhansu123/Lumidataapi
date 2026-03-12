# Khởi động Server cho Detail Reports API

## Khởi động Vercel Dev (Port 3000)

Mở PowerShell và chạy:

```powershell
cd C:\Users\admin\Desktop\orders-api\orders-api

# Set environment variables
$env:SUPABASE_URL = "https://gsjhsmxyxyjqovauyrp.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI"

# Khởi động server
vercel dev --listen 3000
```

## Kiểm tra Server

Sau khi khởi động, đợi 10-15 giây rồi test:

```
http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08
```

## Test Links

1. **Tính toán theo ngày:**
   ```
   http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08
   ```

2. **Tính toán cho một record:**
   ```
   http://localhost:3000/api/calculate-detail-report-count?recordId=YOUR_RECORD_ID
   ```

3. **Debug matching:**
   ```
   http://localhost:3000/api/debug-detail-matching?recordId=YOUR_RECORD_ID
   ```

## Lưu ý

- Server cần 10-15 giây để khởi động hoàn toàn
- Đảm bảo port 3000 không bị chiếm bởi ứng dụng khác
- FastAPI (port 8000) cũng cần chạy để lấy detail_reports data
