# Test API với Record ID cụ thể

## Record ID cần test:
```
0000323c-53c0-44c0-a6c1-93d62dd499c0
```

## Test API

### 1. Test bằng Browser:
Mở trình duyệt và truy cập:
```
https://lumidataapi.vercel.app/api/calculate-order-count?recordId=0000323c-53c0-44c0-a6c1-93d62dd499c0
```

### 2. Test bằng curl:
```bash
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=0000323c-53c0-44c0-a6c1-93d62dd499c0"
```

### 3. Test bằng JavaScript (Browser Console):
```javascript
fetch('https://lumidataapi.vercel.app/api/calculate-order-count?recordId=0000323c-53c0-44c0-a6c1-93d62dd499c0')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### 4. Test bằng Postman/Insomnia:
- **Method:** GET
- **URL:** `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=0000323c-53c0-44c0-a6c1-93d62dd499c0`

## Response mong đợi:

### Thành công:
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 1 records",
  "updated": 1,
  "errors": 0,
  "total": 1,
  "data": [
    {
      "id": "0000323c-53c0-44c0-a6c1-93d62dd499c0",
      "name": "Tên nhân viên",
      "date": "2026-01-15",
      "order_count": 5
    }
  ]
}
```

### Lỗi (nếu API chưa hoạt động):
```json
{
  "detail": "Not Found"
}
```

## ⚠️ Lưu ý:

Nếu API trả về "Not Found", cần:
1. Fix environment variables trong Vercel Dashboard
2. Redeploy project
3. Xem hướng dẫn trong `URGENT_FIX.md`
