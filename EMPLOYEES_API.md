# API Lấy Dữ Liệu Nhân Viên (Employees API)

API này lấy dữ liệu từ bảng `users` và trả về theo định dạng tiếng Việt.

## Endpoint

**Production:**
```
GET https://lumidataapi.vercel.app/api/employees
```

**Local:**
```
GET http://localhost:3000/api/employees
```

## Response Format

```json
{
  "success": true,
  "message": "Successfully fetched X employees",
  "total": number,
  "employeeData": [
    {
      "id": "string",
      "Họ Và Tên": "string",
      "Email": "string",
      "Team": "string",
      "Vị trí": "string",
      "chi nhánh": "string"
    }
  ]
}
```

## Query Parameters

| Tham số | Kiểu | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `team` | string | Lọc theo team (hỗ trợ nhiều giá trị cách nhau bởi dấu phẩy) | `team=HN-MKT` hoặc `team=HN-MKT,SG-MKT` |
| `position` | string | Lọc theo vị trí/chức vụ (hỗ trợ nhiều giá trị cách nhau bởi dấu phẩy) | `position=Marketing` hoặc `position=Marketing,Sale` |
| `branch` | string | Lọc theo chi nhánh (hỗ trợ nhiều giá trị cách nhau bởi dấu phẩy) | `branch=Hà Nội` hoặc `branch=Hà Nội,Hồ Chí Minh` |
| `email` | string | Lọc theo email (chính xác) | `email=user@example.com` |
| `name` | string | Tìm kiếm theo tên (fuzzy search, không phân biệt hoa thường) | `name=Nguyễn Văn A` |
| `limit` | number | Giới hạn số lượng kết quả (mặc định: 10000) | `limit=100` |
| `offset` | number | Vị trí bắt đầu (mặc định: 0) | `offset=0` |

## Ví dụ sử dụng

### 1. Lấy tất cả nhân viên

```bash
curl "https://lumidataapi.vercel.app/api/employees"
```

### 2. Lọc theo team

```bash
curl "https://lumidataapi.vercel.app/api/employees?team=HN-MKT"
```

### 3. Lọc theo nhiều team

```bash
curl "https://lumidataapi.vercel.app/api/employees?team=HN-MKT,SG-MKT"
```

### 4. Tìm kiếm theo tên

```bash
curl "https://lumidataapi.vercel.app/api/employees?name=Nguyễn Văn A"
```

### 5. Lọc theo vị trí

```bash
curl "https://lumidataapi.vercel.app/api/employees?position=Marketing"
```

### 6. Lọc theo chi nhánh

```bash
curl "https://lumidataapi.vercel.app/api/employees?branch=Hà Nội"
```

### 7. Kết hợp nhiều bộ lọc

```bash
curl "https://lumidataapi.vercel.app/api/employees?team=HN-MKT&position=Marketing&branch=Hà Nội"
```

### 8. Phân trang

```bash
curl "https://lumidataapi.vercel.app/api/employees?limit=50&offset=0"
```

## Mapping Cột Database

API tự động map các tên cột khác nhau trong database sang định dạng tiếng Việt:

| Tên trong Response | Tên cột có thể trong DB |
|-------------------|------------------------|
| `Họ Và Tên` | `Họ Và Tên`, `full_name`, `name`, `ho_ten`, `ten`, `ho_va_ten` |
| `Email` | `email`, `Email` |
| `Team` | `team`, `Team` |
| `Vị trí` | `Vị trí`, `position`, `vi_tri`, `chuc_vu` |
| `chi nhánh` | `chi nhánh`, `chi_nhanh`, `branch` |

## Lưu ý

- API hỗ trợ nhiều biến thể tên cột trong database để đảm bảo tương thích
- Filter theo `position` và `branch` sẽ được thực hiện ở database level nếu có cột tương ứng, nếu không sẽ filter trong memory
- Tìm kiếm theo `name` sử dụng fuzzy search (không phân biệt hoa thường, tìm kiếm một phần)
- Mặc định giới hạn 10000 records, có thể điều chỉnh bằng tham số `limit`
