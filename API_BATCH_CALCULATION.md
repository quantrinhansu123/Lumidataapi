# API Tính Toán Hàng Loạt theo Ngày

## Link API tính theo ngày

```
GET https://lumidataapi.vercel.app/api/calculate-order-count?date=YYYY-MM-DD
```

## Ví dụ sử dụng

### Tính toán cho tất cả records trong một ngày:

```bash
# Tính toán cho ngày 24/09/2025
curl "https://lumidataapi.vercel.app/api/calculate-order-count?date=2025-09-24"

# Tính toán cho ngày 15/01/2026
curl "https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-01-15"

# Tính toán cho ngày hôm nay
curl "https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-03-08"
```

### Format ngày:
- **YYYY-MM-DD** (ví dụ: `2025-09-24`)
- **YYYY-MM-DD** (ví dụ: `2026-01-15`)

## Response

### Thành công:
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 10 records",
  "updated": 10,
  "errors": 0,
  "total": 10,
  "data": [
    {
      "id": "123",
      "name": "Nguyễn Văn A",
      "date": "2025-09-24",
      "order_count": 5
    },
    {
      "id": "124",
      "name": "Trần Thị B",
      "date": "2025-09-24",
      "order_count": 3
    }
    // ... các records khác
  ]
}
```

## ⚠️ Lưu ý về Timeout

### Vấn đề:
- Nếu có **quá nhiều records** trong một ngày, API có thể bị **timeout**
- Vercel Hobby plan: timeout **10 giây**
- Vercel Pro plan: timeout **60 giây**

### Giải pháp:

#### 1. Chia nhỏ theo giờ hoặc ca:
```bash
# Tính toán cho từng ca riêng biệt
# (Cần filter thêm trong code hoặc dùng recordId)
```

#### 2. Tính toán theo từng record (nếu ít records):
```bash
# Thay vì tính cả ngày, tính từng record
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=123"
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recordId=124"
```

#### 3. Sử dụng Webhook (Tự động):
- Cấu hình webhook trong Supabase
- Tự động tính toán khi có record mới
- Không cần tính hàng loạt

#### 4. Tính toán lại tất cả (nếu cần):
```bash
# Tính toán lại tất cả records (limit 10000)
curl "https://lumidataapi.vercel.app/api/calculate-order-count?recalculateAll=true"
```

## Các options khác

### 1. Tính toán cho một record cụ thể:
```
GET https://lumidataapi.vercel.app/api/calculate-order-count?recordId=123
```

### 2. Tính toán cho các records chưa có order_count:
```
GET https://lumidataapi.vercel.app/api/calculate-order-count
```

### 3. Tính toán lại tất cả records:
```
GET https://lumidataapi.vercel.app/api/calculate-order-count?recalculateAll=true
```

## Sử dụng trong Frontend

### JavaScript/React:
```javascript
// Tính toán cho một ngày
const calculateByDate = async (date) => {
  try {
    const response = await fetch(
      `https://lumidataapi.vercel.app/api/calculate-order-count?date=${date}`
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Đã tính toán ${result.updated} records`);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    // Xử lý timeout hoặc lỗi khác
  }
};

// Sử dụng
calculateByDate('2025-09-24');
```

### Vue:
```javascript
const calculateByDate = async (date) => {
  try {
    const response = await fetch(
      `https://lumidataapi.vercel.app/api/calculate-order-count?date=${date}`
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Best Practices

1. **Nếu có ít records (< 100):** Dùng tính theo ngày
2. **Nếu có nhiều records (> 100):** 
   - Dùng webhook để tự động tính
   - Hoặc tính từng record khi cần
3. **Setup lần đầu:** Dùng `recalculateAll=true` để tính tất cả
4. **Hàng ngày:** Cấu hình webhook hoặc cron job

## Troubleshooting

### Lỗi: FUNCTION_INVOCATION_TIMEOUT
**Nguyên nhân:** Quá nhiều records trong ngày
**Giải pháp:**
- Chia nhỏ theo recordId
- Hoặc dùng webhook thay vì tính hàng loạt

### Lỗi: Invalid date format
**Nguyên nhân:** Format ngày sai
**Giải pháp:** Dùng format `YYYY-MM-DD` (ví dụ: `2025-09-24`)

### Lỗi: No records found
**Nguyên nhân:** Không có records trong ngày đó
**Giải pháp:** Kiểm tra lại ngày và dữ liệu trong database
