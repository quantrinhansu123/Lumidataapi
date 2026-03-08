# Tổng hợp các Link API

## Base URL
```
https://lumidataapi.vercel.app
```

## 1. Tính toán cho một record cụ thể

```
GET https://lumidataapi.vercel.app/api/calculate-order-count?recordId={recordId}
```

**Ví dụ:**
```
https://lumidataapi.vercel.app/api/calculate-order-count?recordId=0000323c-53c0-44c0-a6c1-93d62dd499c0
```

**Khi nào dùng:**
- Sau khi tạo/sửa một record
- Tính toán lại cho một record cụ thể

---

## 2. Tính toán cho tất cả records trong một ngày (HÀNG LOẠT)

```
GET https://lumidataapi.vercel.app/api/calculate-order-count?date=YYYY-MM-DD
```

**Ví dụ:**
```
https://lumidataapi.vercel.app/api/calculate-order-count?date=2025-09-24
https://lumidataapi.vercel.app/api/calculate-order-count?date=2026-01-15
```

**Khi nào dùng:**
- Tính toán lại tất cả records trong một ngày
- Sau khi import dữ liệu orders cho một ngày
- Chạy định kỳ hàng ngày

**⚠️ Lưu ý:** Có thể bị timeout nếu có quá nhiều records (> 1000)

---

## 3. Tính toán cho các records chưa có order_count

```
GET https://lumidataapi.vercel.app/api/calculate-order-count
```

**Khi nào dùng:**
- Lần đầu setup hệ thống
- Tính toán cho các records còn thiếu

---

## 4. Tính toán lại TẤT CẢ records

```
GET https://lumidataapi.vercel.app/api/calculate-order-count?recalculateAll=true
```

**Khi nào dùng:**
- Tính toán lại toàn bộ dữ liệu
- Sau khi có thay đổi lớn trong dữ liệu orders
- **⚠️ Lưu ý:** Chỉ nên dùng khi thực sự cần, có thể mất thời gian

---

## 5. Webhook (Tự động)

```
POST https://lumidataapi.vercel.app/api/webhook-sales-reports
```

**Khi nào dùng:**
- Tự động tính toán khi có record mới/cập nhật
- Cấu hình trong Supabase Dashboard → Database → Webhooks

---

## So sánh các options

| Option | Link | Tốc độ | Phù hợp |
|--------|------|--------|---------|
| **Một record** | `?recordId=xxx` | ⚡ Nhanh | Sau khi tạo/sửa record |
| **Theo ngày** | `?date=YYYY-MM-DD` | 🐢 Có thể chậm | Tính hàng loạt một ngày |
| **Chưa có** | (không có params) | 🐢 Trung bình | Setup lần đầu |
| **Tất cả** | `?recalculateAll=true` | 🐌 Rất chậm | Tính lại toàn bộ |
| **Webhook** | POST webhook | ⚡ Tự động | Real-time |

---

## Ví dụ sử dụng trong Frontend

### Tính theo ngày:
```javascript
const date = '2025-09-24';
const response = await fetch(
  `https://lumidataapi.vercel.app/api/calculate-order-count?date=${date}`
);
```

### Tính một record:
```javascript
const recordId = '0000323c-53c0-44c0-a6c1-93d62dd499c0';
const response = await fetch(
  `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=${recordId}`
);
```
