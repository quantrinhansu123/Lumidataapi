# Danh sách các API Endpoints

## 🌐 FastAPI Server (Port 8000)

### Base URL: `http://localhost:8000`

---

### 1. **GET /** - Root Endpoint
**Mô tả:** Thông tin về API và các endpoint có sẵn

**URL:** `http://localhost:8000/`

**Ví dụ:**
```bash
GET http://localhost:8000/
```

---

### 2. **GET /docs** - API Documentation
**Mô tả:** Swagger UI documentation (tự động generate bởi FastAPI)

**URL:** `http://localhost:8000/docs`

**Ví dụ:**
```bash
GET http://localhost:8000/docs
```

---

### 3. **GET /orders** - Lấy danh sách Orders
**Mô tả:** Lấy danh sách orders với bộ lọc theo query params. Mặc định lấy TẤT CẢ dữ liệu thỏa điều kiện filter.

**URL:** `http://localhost:8000/orders`

**Query Parameters:**
- `limit` (optional): Số bản ghi tối đa (1-10000)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)
- `after_id` (optional): Cursor: id bản ghi cuối trang trước
- `from_date` (optional): Ngày bắt đầu (dd/mm/yyyy)
- `to_date` (optional): Ngày kết thúc (dd/mm/yyyy)
- `date_column` (optional): Cột date để filter (mặc định: order_date)
- `team`: Lọc theo ca làm việc
- `delivery_staff`: Lọc theo nhân viên giao hàng (hỗ trợ nhiều giá trị: Name1,Name2)
- `delivery_status`: Lọc theo trạng thái giao hàng
- `payment_status`: Lọc theo trạng thái thanh toán
- `country`, `product`, `check_result`
- `marketing_staff`, `sale_staff`, `cskh`

**Ví dụ:**
```bash
# Lấy tất cả orders
GET http://localhost:8000/orders

# Lọc theo nhân viên giao hàng và trạng thái
GET http://localhost:8000/orders?delivery_staff=Nguyễn Văn A&delivery_status=Delivered

# Lọc theo khoảng thời gian và nhiều điều kiện
GET http://localhost:8000/orders?team=Morning&delivery_status=Delivered&payment_status=Paid&from_date=01/01/2026&to_date=31/01/2026
```

---

### 4. **GET /orders/export** - Export Orders ra CSV
**Mô tả:** Export danh sách orders đã lọc ra file CSV. Hỗ trợ tất cả các bộ lọc giống như endpoint /orders.

**URL:** `http://localhost:8000/orders/export`

**Query Parameters:**
- `format` (optional): Định dạng file export (csv, excel) - mặc định: csv
- `from_date` (optional): Ngày bắt đầu (dd/mm/yyyy)
- `to_date` (optional): Ngày kết thúc (dd/mm/yyyy)
- `date_column` (optional): Cột date để filter (mặc định: order_date)
- Tất cả các filter khác giống `/orders`

**Ví dụ:**
```bash
# Export CSV với filter
GET http://localhost:8000/orders/export?format=csv&team=Morning&delivery_status=Delivered&from_date=01/01/2026&to_date=31/01/2026

# Export CSV với nhiều nhân viên
GET http://localhost:8000/orders/export?format=csv&delivery_staff=Nguyễn Văn A,Trần Văn B&payment_status=Paid
```

---

### 5. **GET /detail_reports** - Lấy danh sách Detail Reports
**Mô tả:** Lấy danh sách detail_reports với bộ lọc theo query params.

**URL:** `http://localhost:8000/detail_reports`

**Query Parameters:**
- `limit` (optional): Số bản ghi tối đa (mặc định: 100)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)
- `after_id` (optional): Cursor: id bản ghi cuối trang trước
- `ten` / `nhan_su` / `nhansu` / `marketing_staff` / `staff`: Lọc theo tên nhân viên
- `ngay` / `date` / `report_date`: Lọc theo ngày
- `ca` / `camkt` / `shift`: Lọc theo ca
- `san_pham` / `product` / `productmkt` / `sanpham`: Lọc theo sản phẩm
- `thi_truong` / `market` / `marketmkt` / `thitruong`: Lọc theo thị trường
- `team` / `teammkt`: Lọc theo team
- `from_date`, `to_date`: Khoảng thời gian (dd/mm/yyyy)

**Ví dụ:**
```bash
# Lấy detail reports
GET http://localhost:8000/detail_reports

# Lọc theo nhân viên và ngày
GET http://localhost:8000/detail_reports?nhan_su=Nguyễn Văn A,Trần Thị B&from_date=01/02/2026&to_date=10/02/2026
```

---

### 6. **GET /sales_reports** - Lấy danh sách Sales Reports
**Mô tả:** Lấy danh sách sales_reports với bộ lọc theo query params.

**URL:** `http://localhost:8000/sales_reports`

**Query Parameters:**
- `limit` (optional): Số bản ghi tối đa (mặc định: 100)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)
- `after_id` (optional): Cursor: id bản ghi cuối trang trước
- `ten` / `nhan_su` / `nhansu` / `marketing_staff` / `staff`: Lọc theo tên nhân viên
- `date` / `ngay` / `report_date`: Lọc theo ngày
- `ca` / `casle` / `camkt` / `shift`: Lọc theo ca
- `san_pham` / `product` / `productsale` / `productmkt` / `sanpham`: Lọc theo sản phẩm
- `thi_truong` / `market` / `marketsale` / `marketmkt` / `thitruong`: Lọc theo thị trường
- `team` / `teamsale` / `teammkt`: Lọc theo team
- `from_date`, `to_date`: Khoảng thời gian (dd/mm/yyyy)
- `date_column`: Cột date để filter (mặc định: ngay)

**Ví dụ:**
```bash
# Lấy sales reports
GET http://localhost:8000/sales_reports

# Lọc theo team và khoảng thời gian
GET http://localhost:8000/sales_reports?teamsale=Team A&from_date=01/02/2026&to_date=10/02/2026&date_column=date
```

---

### 7. **GET /employees** - Lấy danh sách Nhân viên
**Mô tả:** Lấy danh sách nhân viên từ bảng users với bộ lọc.

**URL:** `http://localhost:8000/employees`

**Query Parameters:**
- `team` (optional): Lọc theo team (hỗ trợ nhiều giá trị: Team1,Team2)
- `position` (optional): Lọc theo vị trí (hỗ trợ nhiều giá trị)
- `branch` (optional): Lọc theo chi nhánh (hỗ trợ nhiều giá trị)
- `email` (optional): Lọc theo email chính xác
- `name` (optional): Tìm kiếm theo tên (fuzzy search, không phân biệt hoa thường)
- `limit` (optional): Số bản ghi tối đa (mặc định: 10000)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)

**Response Fields:**
- `id`: ID nhân viên
- `Họ Và Tên`: Tên đầy đủ
- `Email`: Email
- `Team`: Team
- `Vị trí`: Vị trí công việc
- `chi nhánh`: Chi nhánh
- `link_anh`: Link ảnh (lấy từ avatar_url hoặc link_anh)
- `ca`: Ca làm việc

**Ví dụ:**
```bash
# Lấy tất cả nhân viên
GET http://localhost:8000/employees

# Lọc theo team
GET http://localhost:8000/employees?team=HN-MKT

# Tìm kiếm theo tên và lọc theo vị trí
GET http://localhost:8000/employees?name=Nguyễn&position=Marketing&branch=Hà Nội

# Kết hợp nhiều filter
GET http://localhost:8000/employees?team=HN-MKT,HO-MKT&limit=100&offset=0
```

---

## 🚀 Vercel API Server (Port 3001)

### Base URL: `http://localhost:3001/api`

---

### 8. **GET /api/calculate-order-count** - Tính toán Order Count cho Sales Reports
**Mô tả:** Tính toán và cập nhật các trường thống kê (order_count, revenue_actual, etc.) cho sales_reports dựa trên orders.

**URL:** `http://localhost:3001/api/calculate-order-count`

**Query Parameters:**
- `recordId` (optional): ID của record cụ thể cần tính toán
- `date` (optional): Ngày cụ thể cần tính toán (YYYY-MM-DD)
- `recalculateAll` (optional): Tính toán lại tất cả records (true/false)
- `name` / `sale_staff` (optional): Lọc theo tên nhân viên (fuzzy search)

**Ví dụ:**
```bash
# Tính toán cho một record cụ thể
GET http://localhost:3000/api/calculate-order-count?recordId=abc-123

# Tính toán cho một ngày cụ thể
GET http://localhost:3000/api/calculate-order-count?date=2026-03-08

# Tính toán cho một nhân viên cụ thể
GET http://localhost:3000/api/calculate-order-count?name=Dương Thị Hạnh&date=2026-03-10

# Tính toán lại tất cả
GET http://localhost:3000/api/calculate-order-count?recalculateAll=true
```

---

### 9. **GET /api/calculate-detail-report-count** - Tính toán cho Detail Reports
**Mô tả:** Tính toán và cập nhật các trường thống kê cho detail_reports dựa trên orders.

**URL:** `http://localhost:3001/api/calculate-detail-report-count`

**Query Parameters:**
- `recordId` (optional): ID của record cụ thể cần tính toán
- `date` (optional): Ngày cụ thể cần tính toán (YYYY-MM-DD)
- `recalculateAll` (optional): Tính toán lại tất cả records (true/false)
- `name` / `ten` / `Tên` (optional): Lọc theo tên nhân viên (fuzzy search)

**Response Fields (Vietnamese):**
- `Số đơn thực tế`: Số đơn thỏa mãn điều kiện
- `Doanh thu chốt thực tế`: Tổng doanh thu
- `Doanh số hoàn hủy thực tế`: Tổng tiền các đơn hủy
- `Số đơn hoàn hủy thực tế`: Số đơn có trạng thái Hủy
- `Doanh số sau hoàn hủy thực tế`: Doanh thu sau khi trừ hoàn hủy
- `Doanh số đi thực tế`: Doanh thu các đơn đã ship

**Ví dụ:**
```bash
# Tính toán cho một record cụ thể
GET http://localhost:3000/api/calculate-detail-report-count?recordId=abc-123

# Tính toán cho một ngày cụ thể
GET http://localhost:3000/api/calculate-detail-report-count?date=2026-03-10

# Tính toán cho một nhân viên
GET http://localhost:3000/api/calculate-detail-report-count?name=Dương Thị Hạnh&date=2026-03-10
```

---

### 10. **GET /api/debug-matching** - Debug Matching Logic cho Sales Reports
**Mô tả:** Debug endpoint để xem chi tiết logic matching giữa sales_reports và orders.

**URL:** `http://localhost:3001/api/debug-matching`

**Query Parameters:**
- `recordId` (required): ID của sales_report record cần debug

**Ví dụ:**
```bash
GET http://localhost:3000/api/debug-matching?recordId=abc-123
```

---

### 11. **GET /api/debug-detail-matching** - Debug Matching Logic cho Detail Reports
**Mô tả:** Debug endpoint để xem chi tiết logic matching giữa detail_reports và orders.

**URL:** `http://localhost:3001/api/debug-detail-matching`

**Query Parameters:**
- `recordId` (required): ID của detail_report record cần debug

**Ví dụ:**
```bash
GET http://localhost:3000/api/debug-detail-matching?recordId=abc-123
```

---

### 12. **GET /api/employees** - Lấy danh sách Nhân viên (TypeScript Version)
**Mô tả:** Tương tự như FastAPI endpoint `/employees`, nhưng chạy trên Vercel serverless.

**URL:** `http://localhost:3001/api/employees`

**Query Parameters:** Giống như FastAPI endpoint `/employees`

**Ví dụ:**
```bash
GET http://localhost:3000/api/employees?team=HN-MKT&name=Nguyễn
```

---

### 13. **POST /api/webhook-sales-reports** - Webhook cho Sales Reports
**Mô tả:** Webhook endpoint để tự động tính toán lại khi có thay đổi dữ liệu.

**URL:** `http://localhost:3001/api/webhook-sales-reports`

**Method:** POST

**Ví dụ:**
```bash
POST http://localhost:3000/api/webhook-sales-reports
Content-Type: application/json

{
  "table": "orders",
  "type": "UPDATE",
  "record": { ... }
}
```

---

## 📋 Tóm tắt

### FastAPI (Port 8000):
1. `GET /` - Root
2. `GET /docs` - API Documentation
3. `GET /orders` - Lấy orders
4. `GET /orders/export` - Export orders CSV
5. `GET /detail_reports` - Lấy detail reports
6. `GET /sales_reports` - Lấy sales reports
7. `GET /employees` - Lấy nhân viên

### Vercel API (Port 3001):
1. `GET /api/calculate-order-count` - Tính toán sales reports
2. `GET /api/calculate-detail-report-count` - Tính toán detail reports
3. `GET /api/debug-matching` - Debug sales reports matching
4. `GET /api/debug-detail-matching` - Debug detail reports matching
5. `GET /api/employees` - Lấy nhân viên (TypeScript)
6. `POST /api/webhook-sales-reports` - Webhook tự động tính toán

---

## 🌍 Production URLs

**FastAPI Production:** (Nếu có deploy)
- `https://your-fastapi-domain.com/`

**Vercel Production:**
- `https://lumidataapi.vercel.app/api/...`

---

## 📝 Lưu ý

- Tất cả API đều hỗ trợ CORS
- FastAPI server chạy trên port 8000 với auto-reload
- Vercel API server chạy trên port 3000
- Các API tính toán có thể mất thời gian nếu dữ liệu lớn
- Sử dụng query parameters để filter và pagination
