# Ví dụ URL cho API Orders

## 📌 Base URL
```
http://localhost:8000
```

## 🔍 Các bộ lọc được hỗ trợ

### 1. Lọc theo team (lọc cột shift - ca làm việc)
```
http://localhost:8000/orders?team=Morning
```
**Lưu ý:** Parameter `team` sẽ lọc cột `shift` trong database (ca làm việc)

### 2. Lọc theo delivery_status
```
http://localhost:8000/orders?delivery_status=Delivered
```

### 3. Lọc theo payment_status
```
http://localhost:8000/orders?payment_status=Paid
```

### 4. Lọc theo country
```
http://localhost:8000/orders?country=US
```

### 5. Lọc theo product
```
http://localhost:8000/orders?product=Product%20A
```

### 6. Lọc theo shift
```
http://localhost:8000/orders?shift=Morning
```

### 7. Lọc theo check_result
```
http://localhost:8000/orders?check_result=Passed
```

### 8. Lọc theo marketing_staff
```
http://localhost:8000/orders?marketing_staff=Nguyen%20Van%20A
```

### 9. Lọc theo sale_staff
```
http://localhost:8000/orders?sale_staff=Tran%20Thi%20B
```

### 10. Lọc theo delivery_staff
```
http://localhost:8000/orders?delivery_staff=Le%20Van%20C
```

### 11. Lọc theo cskh
```
http://localhost:8000/orders?cskh=CSKH%20Team
```

## 📅 Lọc theo khoảng thời gian (order_date)

### 12. Khoảng thời gian từ 01/01/2026 đến 31/01/2026
```
http://localhost:8000/orders?from_date=01/01/2026&to_date=31/01/2026
```

### 13. Khoảng thời gian với date_column tùy chỉnh (created_at)
```
http://localhost:8000/orders?from_date=01/01/2026&to_date=31/01/2026&date_column=created_at
```

### 14. Chỉ từ ngày (from_date)
```
http://localhost:8000/orders?from_date=01/01/2026
```

### 15. Chỉ đến ngày (to_date)
```
http://localhost:8000/orders?to_date=31/01/2026
```

## 🎯 Kết hợp nhiều bộ lọc

### 16. Team + Delivery Status + Payment Status
```
http://localhost:8000/orders?team=Team%20A&delivery_status=Delivered&payment_status=Paid
```

### 17. Country + Product + Khoảng thời gian
```
http://localhost:8000/orders?country=US&product=Product%20A&from_date=01/03/2026&to_date=31/03/2026
```

### 18. Marketing Staff + Shift + Check Result + Khoảng thời gian
```
http://localhost:8000/orders?marketing_staff=Nguyen%20Van%20A&shift=Morning&check_result=Passed&from_date=01/02/2026&to_date=28/02/2026
```

### 19. Tất cả bộ lọc kết hợp
```
http://localhost:8000/orders?team=Team%20A&delivery_status=Delivered&payment_status=Paid&country=US&product=Product%20A&shift=Morning&check_result=Passed&marketing_staff=Nguyen%20Van%20A&sale_staff=Tran%20Thi%20B&delivery_staff=Le%20Van%20C&cskh=CSKH%20Team&from_date=01/01/2026&to_date=31/03/2026&date_column=order_date
```

## 📊 Phân trang

### 20. Giới hạn 50 bản ghi
```
http://localhost:8000/orders?limit=50
```

### 21. Offset 100
```
http://localhost:8000/orders?limit=50&offset=2
```

### 22. Phân trang với bộ lọc
```
http://localhost:8000/orders?team=Team%20A&from_date=01/01/2026&to_date=31/01/2026&limit=100&offset=0
```

## 🔗 URL cho Production

Khi deploy lên server, thay `localhost:8000` bằng domain của bạn:
```
https://your-domain.com/orders?team=Team%20A&from_date=01/01/2026&to_date=31/01/2026
```

## 📝 Lưu ý

- Khoảng trắng trong URL: dùng `%20` (ví dụ: `Team A` → `Team%20A`)
- Định dạng ngày: `dd/mm/yyyy` hoặc `yyyy-mm-dd`
- `date_column` mặc định là `order_date`, có thể đổi thành: `created_at`, `updated_at`, `order_time`, `postponed_date`, v.v.
- Limit mặc định: 100, tối đa: 1000
