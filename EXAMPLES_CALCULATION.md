# Ví dụ sử dụng các API Tính toán

## 📊 API Tính toán Sales Reports

### Base URL: `http://localhost:3001/api/calculate-order-count`

---

### 1. Tính toán cho một record cụ thể

**Request:**
```bash
GET http://localhost:3001/api/calculate-order-count?recordId=9ca4c401-9a8d-410e-9ddd-3e2409b6c00c
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 1 records",
  "updated": 1,
  "errors": 0,
  "total": 1,
  "data": [
    {
      "id": "9ca4c401-9a8d-410e-9ddd-3e2409b6c00c",
      "name": "Dương Thị Hạnh",
      "date": "2026-03-10",
      "shift": "Hết ca",
      "product": "Bonavita Coffee",
      "market": "US",
      "order_count": 2,
      "order_cancel_count_actual": 0,
      "order_cancel_count": 0,
      "revenue_actual": 9168000,
      "revenue_cancel_actual": 0,
      "order_success_count": 2,
      "updated_fields": [
        "order_count",
        "order_cancel_count_actual",
        "revenue_actual",
        "revenue_cancel_actual",
        "order_success_count"
      ]
    }
  ]
}
```

---

### 2. Tính toán cho một ngày cụ thể

**Request:**
```bash
GET http://localhost:3001/api/calculate-order-count?date=2026-03-08
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 5 records",
  "updated": 5,
  "errors": 0,
  "total": 5,
  "data": [
    {
      "id": "...",
      "name": "...",
      "date": "2026-03-08",
      "order_count": 10,
      "revenue_actual": 50000000,
      ...
    }
  ]
}
```

---

### 3. Tính toán cho một nhân viên cụ thể trong một ngày

**Request:**
```bash
GET http://localhost:3001/api/calculate-order-count?name=Dương Thị Hạnh&date=2026-03-10
```

**Hoặc dùng `sale_staff`:**
```bash
GET http://localhost:3001/api/calculate-order-count?sale_staff=Dương Thị Hạnh&date=2026-03-10
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 3 records",
  "updated": 3,
  "errors": 0,
  "total": 3,
  "data": [
    {
      "id": "...",
      "name": "Dương Thị Hạnh",
      "date": "2026-03-10",
      "shift": "Hết ca",
      "product": "Bonavita Coffee",
      "market": "US",
      "order_count": 2,
      "revenue_actual": 9168000,
      ...
    },
    {
      "id": "...",
      "name": "Dương Thị Hạnh",
      "date": "2026-03-10",
      "shift": "Giữa ca",
      "product": "Kem Body",
      "market": "US",
      "order_count": 5,
      "revenue_actual": 15000000,
      ...
    }
  ]
}
```

---

### 4. Tính toán lại tất cả records

**Request:**
```bash
GET http://localhost:3001/api/calculate-order-count?recalculateAll=true
```

**Lưu ý:** API này sẽ tính toán lại TẤT CẢ records trong bảng `sales_reports`, có thể mất nhiều thời gian nếu dữ liệu lớn.

**Response:**
```json
{
  "success": true,
  "message": "Successfully calculated order_count for 150 records",
  "updated": 150,
  "errors": 0,
  "total": 150,
  "data": [...]
}
```

---

### 5. Kết hợp nhiều tham số

**Request:**
```bash
GET http://localhost:3001/api/calculate-order-count?date=2026-03-10&name=Dương Thị Hạnh
```

**Response:** Tương tự như ví dụ 3, nhưng chỉ tính toán các records thỏa mãn cả hai điều kiện.

---

## 📈 API Tính toán Detail Reports

### Base URL: `http://localhost:3001/api/calculate-detail-report-count`

---

### 1. Tính toán cho một record cụ thể

**Request:**
```bash
GET http://localhost:3001/api/calculate-detail-report-count?recordId=abc-123-def-456
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully calculated statistics for 1 detail reports",
  "updated": 1,
  "errors": 0,
  "total": 1,
  "data": [
    {
      "id": "abc-123-def-456",
      "Tên": "Dương Thị Hạnh",
      "Ngày": "2026-03-10",
      "ca": "Hết ca",
      "Sản_phẩm": "Bonavita Coffee",
      "Thị_trường": "US",
      "Số đơn thực tế": 2,
      "Doanh thu chốt thực tế": 9168000,
      "Doanh số hoàn hủy thực tế": 0,
      "Số đơn hoàn hủy thực tế": 0,
      "Doanh số sau hoàn hủy thực tế": 9168000,
      "Doanh số đi thực tế": 9168000,
      "updated_fields": [
        "Số đơn thực tế",
        "Doanh thu chốt thực tế",
        "Doanh số hoàn hủy thực tế",
        "Số đơn hoàn hủy thực tế",
        "Doanh số sau hoàn hủy thực tế",
        "Doanh số đi thực tế"
      ]
    }
  ]
}
```

---

### 2. Tính toán cho một ngày cụ thể

**Request:**
```bash
GET http://localhost:3001/api/calculate-detail-report-count?date=2026-03-10
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully calculated statistics for 8 detail reports",
  "updated": 8,
  "errors": 0,
  "total": 8,
  "data": [
    {
      "id": "...",
      "Tên": "Dương Thị Hạnh",
      "Ngày": "2026-03-10",
      "ca": "Hết ca",
      "Sản_phẩm": "Bonavita Coffee",
      "Số đơn thực tế": 2,
      "Doanh thu chốt thực tế": 9168000,
      ...
    },
    ...
  ]
}
```

---

### 3. Tính toán cho một nhân viên cụ thể

**Request với `name`:**
```bash
GET http://localhost:3001/api/calculate-detail-report-count?name=Dương Thị Hạnh
```

**Request với `ten`:**
```bash
GET http://localhost:3001/api/calculate-detail-report-count?ten=Dương Thị Hạnh
```

**Request với `Tên`:**
```bash
GET http://localhost:3001/api/calculate-detail-report-count?Tên=Dương Thị Hạnh
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully calculated statistics for 5 detail reports",
  "updated": 5,
  "errors": 0,
  "total": 5,
  "data": [
    {
      "id": "...",
      "Tên": "Dương Thị Hạnh",
      "Ngày": "2026-03-10",
      "ca": "Hết ca",
      "Sản_phẩm": "Bonavita Coffee",
      "Số đơn thực tế": 2,
      "Doanh thu chốt thực tế": 9168000,
      ...
    },
    ...
  ]
}
```

---

### 4. Tính toán cho nhân viên trong một ngày cụ thể

**Request:**
```bash
GET http://localhost:3001/api/calculate-detail-report-count?name=Dương Thị Hạnh&date=2026-03-10
```

**Response:** Tương tự như ví dụ 3, nhưng chỉ tính toán các records của nhân viên đó trong ngày đó.

---

### 5. Tính toán lại tất cả records

**Request:**
```bash
GET http://localhost:3001/api/calculate-detail-report-count?recalculateAll=true
```

**Lưu ý:** API này sẽ tính toán lại TẤT CẢ records trong bảng `detail_reports`.

---

## 🔍 API Debug Matching

### 1. Debug Sales Reports Matching

**Request:**
```bash
GET http://localhost:3001/api/debug-matching?recordId=9ca4c401-9a8d-410e-9ddd-3e2409b6c00c
```

**Response:**
```json
{
  "success": true,
  "record": {
    "id": "9ca4c401-9a8d-410e-9ddd-3e2409b6c00c",
    "name": "Dương Thị Hạnh",
    "date": "2026-03-10",
    "shift": "Hết ca",
    "product": "Bonavita Coffee",
    "market": "US"
  },
  "matching_orders": [
    {
      "order_id": "...",
      "order_date": "2026-03-10",
      "sale_staff": "Dương Thị Hạnh",
      "shift": "Hết ca",
      "product": "Bonavita Coffee",
      "country": "US",
      "total_vnd": 4584000,
      "delivery_status": "Delivered",
      "matches": {
        "name": true,
        "date": true,
        "shift": true,
        "product": true,
        "market": true
      }
    },
    ...
  ],
  "total_matching_orders": 2,
  "total_revenue": 9168000
}
```

---

### 2. Debug Detail Reports Matching

**Request:**
```bash
GET http://localhost:3001/api/debug-detail-matching?recordId=abc-123-def-456
```

**Response:**
```json
{
  "success": true,
  "record": {
    "id": "abc-123-def-456",
    "Tên": "Dương Thị Hạnh",
    "Ngày": "2026-03-10",
    "ca": "Hết ca",
    "Sản_phẩm": "Bonavita Coffee",
    "Thị_trường": "US"
  },
  "matching_orders": [
    {
      "order_id": "...",
      "order_date": "2026-03-10",
      "marketing_staff": "Dương Thị Hạnh",
      "shift": "Hết ca",
      "product": "Bonavita Coffee",
      "country": "US",
      "total_vnd": 4584000,
      "delivery_status": "Delivered",
      "matches": {
        "name": true,
        "date": true,
        "shift": true,
        "product": true,
        "market": true
      }
    },
    ...
  ],
  "total_matching_orders": 2,
  "statistics": {
    "Số đơn thực tế": 2,
    "Doanh thu chốt thực tế": 9168000,
    "Doanh số hoàn hủy thực tế": 0,
    "Số đơn hoàn hủy thực tế": 0,
    "Doanh số sau hoàn hủy thực tế": 9168000,
    "Doanh số đi thực tế": 9168000
  }
}
```

---

## 📝 Logic Matching

### Sales Reports Matching Logic:

1. **Name Matching:** `sale_staff` trong orders khớp với `name` trong sales_reports (fuzzy match, không phân biệt hoa thường, bỏ dấu)
2. **Date Matching:** `order_date` trong orders khớp với `date` trong sales_reports
3. **Shift Matching:** `shift` trong orders khớp với `shift` trong sales_reports
4. **Product Matching:** `product` trong orders khớp với `product` trong sales_reports
5. **Market Matching:** `country` trong orders khớp với `market` trong sales_reports

### Detail Reports Matching Logic:

1. **Name Matching:** `marketing_staff` trong orders khớp với `Tên`/`ten`/`name` trong detail_reports (fuzzy match)
2. **Date Matching:** `order_date` trong orders khớp với `Ngày`/`ngay`/`date` trong detail_reports
3. **Shift Matching:** 
   - "Hết ca" trong detail_reports khớp với cả "Hết ca" và "Giữa ca" trong orders
   - "Giữa ca" trong detail_reports chỉ khớp với "Giữa ca" trong orders
4. **Product Matching:** `product` trong orders khớp với `Sản_phẩm`/`san_pham`/`product` trong detail_reports
5. **Market Matching:** `country` trong orders khớp với `Thị_trường`/`thi_truong`/`market` trong detail_reports

---

## 💡 Công thức Tính toán

### Sales Reports:

- **order_count:** Số đơn thỏa mãn tất cả điều kiện matching
- **revenue_actual:** Tổng `total_vnd` của các đơn thỏa mãn
- **revenue_cancel_actual:** Tổng `total_vnd` của các đơn có `delivery_status` = "Hủy"
- **order_cancel_count_actual:** Số đơn có `delivery_status` = "Hủy"
- **order_success_count:** Số đơn thành công (order_count - order_cancel_count_actual)

### Detail Reports:

- **Số đơn thực tế:** Count các đơn thỏa mãn tất cả điều kiện matching
- **Doanh thu chốt thực tế:** Sum tổng tiền VNĐ (`total_vnd`) của các đơn thỏa mãn
- **Doanh số hoàn hủy thực tế:** Sum tiền các đơn có trạng thái là "Hủy"
- **Số đơn hoàn hủy thực tế:** Count số đơn có trạng thái "Hủy"
- **Doanh số sau hoàn hủy thực tế:** Doanh thu chốt thực tế - Doanh số hoàn hủy thực tế
- **Doanh số đi thực tế:** Sum tiền các đơn có `delivery_status` = "Đã giao" hoặc `delivery_status_nb` = "Đã giao"

---

## 🧪 Test với cURL

### Ví dụ 1: Tính toán sales report cho một ngày
```bash
curl "http://localhost:3001/api/calculate-order-count?date=2026-03-10"
```

### Ví dụ 2: Tính toán detail report cho một nhân viên
```bash
curl "http://localhost:3001/api/calculate-detail-report-count?name=Dương Thị Hạnh&date=2026-03-10"
```

### Ví dụ 3: Debug matching
```bash
curl "http://localhost:3001/api/debug-matching?recordId=9ca4c401-9a8d-410e-9ddd-3e2409b6c00c"
```

---

## ⚠️ Lưu ý

1. **Thời gian xử lý:** Tính toán lại tất cả records có thể mất nhiều thời gian nếu dữ liệu lớn
2. **Fuzzy Matching:** Name matching sử dụng fuzzy matching, không phân biệt hoa thường và bỏ dấu
3. **Date Format:** Sử dụng format YYYY-MM-DD cho tham số `date`
4. **Case Sensitivity:** Shift matching phân biệt hoa thường, nhưng có logic đặc biệt cho "Hết ca" và "Giữa ca"
5. **Database Updates:** Các API tính toán sẽ CẬP NHẬT trực tiếp vào database, không chỉ trả về kết quả
