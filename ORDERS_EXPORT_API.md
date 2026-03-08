# Orders Export API - Xuất dữ liệu đã lọc ra file

API `/orders/export` cho phép xuất dữ liệu orders đã lọc ra file CSV hoặc Excel.

## Endpoint

```
GET /orders/export
```

## Tham số

| Tham số | Type | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `format` | string | Không | Định dạng file (csv, excel). Mặc định: `csv` | `format=csv` |
| `from_date` | string | Không | Ngày bắt đầu (dd/mm/yyyy) | `from_date=01/02/2026` |
| `to_date` | string | Không | Ngày kết thúc (dd/mm/yyyy) | `to_date=10/02/2026` |
| `date_column` | string | Không | Cột date để filter (mặc định: `order_date`) | `date_column=created_at` |

**Tất cả các bộ lọc khác từ endpoint `/orders` đều được hỗ trợ:**
- `team`, `delivery_staff`, `delivery_status`, `payment_status`
- `country`, `product`, `check_result`
- `marketing_staff`, `sale_staff`, `cskh`
- Và tất cả các trường khác trong bảng orders

## Ví dụ sử dụng

### 1. Export CSV đơn giản

```
GET /orders/export?format=csv
```

### 2. Export với filter theo team

```
GET /orders/export?format=csv&team=Morning,Afternoon
```

### 3. Export với filter theo delivery status

```
GET /orders/export?format=csv&delivery_status=Delivered,Pending
```

### 4. Export với filter theo delivery staff

```
GET /orders/export?format=csv&delivery_staff=Nguyễn Văn A,Trần Văn B
```

### 5. Export với date range

```
GET /orders/export?format=csv&from_date=01/02/2026&to_date=10/02/2026&date_column=order_date
```

### 6. Export với nhiều filter kết hợp

```
GET /orders/export?format=csv&team=Morning,Afternoon&delivery_status=Delivered&payment_status=Paid&delivery_staff=Staff1,Staff2&from_date=01/01/2026&to_date=31/01/2026
```

### 7. Export với filter marketing staff

```
GET /orders/export?format=csv&marketing_staff=Nguyễn Đức Anh,Trần Văn Bình&from_date=01/02/2026&to_date=10/02/2026
```

## Response

API sẽ trả về file CSV với:
- **Content-Type:** `text/csv; charset=utf-8`
- **Content-Disposition:** `attachment; filename="orders_export_YYYYMMDD_HHMMSS.csv"`
- **Encoding:** UTF-8 với BOM (để Excel mở đúng tiếng Việt)

## Các cột trong file export

File CSV sẽ chứa các cột sau (theo thứ tự):
- `id`
- `nhanvien_maketing`
- `nhanvien_sale`
- `ngaytao`
- `tongtien`
- `order_date`
- `country`
- `product`
- `total_amount_vnd`
- `tracking_code`
- `team`
- `delivery_status`
- `payment_status`
- `delivery_staff`
- `check_result`
- `shift`

## Sử dụng trong code

### JavaScript (Fetch API)

```javascript
// Tạo URL với các filter
const params = new URLSearchParams({
  format: 'csv',
  team: 'Morning,Afternoon',
  delivery_status: 'Delivered',
  from_date: '01/02/2026',
  to_date: '10/02/2026'
});

const url = `http://127.0.0.1:8000/orders/export?${params.toString()}`;

// Download file
fetch(url)
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const params = {
  format: 'csv',
  team: 'Morning,Afternoon',
  delivery_status: 'Delivered',
  from_date: '01/02/2026',
  to_date: '10/02/2026'
};

axios({
  url: 'http://127.0.0.1:8000/orders/export',
  method: 'GET',
  params: params,
  responseType: 'blob',
}).then((response) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'orders_export.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
});
```

### PowerShell

```powershell
$baseUrl = "http://127.0.0.1:8000/orders/export"
$params = @{
    format = "csv"
    team = "Morning,Afternoon"
    delivery_status = "Delivered"
    from_date = "01/02/2026"
    to_date = "10/02/2026"
}

$queryString = ($params.GetEnumerator() | ForEach-Object { 
    "$($_.Key)=$([System.Web.HttpUtility]::UrlEncode($_.Value))" 
}) -join '&'
$url = "$baseUrl?$queryString"

$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "orders_export_$timestamp.csv"
[System.IO.File]::WriteAllBytes($filename, $response.Content)
Write-Host "Đã lưu file: $filename"
```

### cURL

```bash
# Export đơn giản
curl "http://127.0.0.1:8000/orders/export?format=csv" -o orders_export.csv

# Export với filter
curl "http://127.0.0.1:8000/orders/export?format=csv&team=Morning&delivery_status=Delivered&from_date=01%2F02%2F2026&to_date=10%2F02%2F2026" -o orders_export.csv
```

### Python

```python
import requests
from datetime import datetime

url = "http://127.0.0.1:8000/orders/export"
params = {
    "format": "csv",
    "team": "Morning,Afternoon",
    "delivery_status": "Delivered",
    "from_date": "01/02/2026",
    "to_date": "10/02/2026"
}

response = requests.get(url, params=params)

if response.status_code == 200:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"orders_export_{timestamp}.csv"
    with open(filename, "wb") as f:
        f.write(response.content)
    print(f"Đã lưu file: {filename}")
else:
    print(f"Lỗi: {response.status_code} - {response.text}")
```

## Lưu ý

1. **Không giới hạn số lượng:** Endpoint export sẽ lấy **TẤT CẢ** dữ liệu thỏa điều kiện filter (không có limit).

2. **Encoding:** File CSV được encode bằng UTF-8 với BOM để Excel có thể mở và hiển thị đúng tiếng Việt.

3. **Tên file:** Tên file tự động có timestamp để tránh trùng lặp: `orders_export_YYYYMMDD_HHMMSS.csv`

4. **Format Excel:** Hiện tại chỉ hỗ trợ CSV. Format Excel sẽ được thêm sau nếu cần.

5. **Bộ lọc:** Tất cả các bộ lọc từ endpoint `/orders` đều được hỗ trợ, bao gồm:
   - Nhiều giá trị (checkbox): `team=Morning,Afternoon`
   - Date range: `from_date` và `to_date`
   - Tất cả các trường trong bảng orders

## Lỗi có thể xảy ra

### Không có dữ liệu

```json
{
  "error": "Không có dữ liệu để export",
  "count": 0
}
```

**Status Code:** 404

### Format không hỗ trợ

```json
{
  "error": "Format 'pdf' không được hỗ trợ. Chỉ hỗ trợ: csv, excel"
}
```

**Status Code:** 400

### Lỗi server

```json
{
  "error": "Error message here"
}
```

**Status Code:** 500

## So sánh với endpoint /orders

| Tính năng | `/orders` | `/orders/export` |
|-----------|-----------|------------------|
| Response format | JSON | CSV/Excel file |
| Phân trang | Có (limit, offset, after_id) | Không (lấy tất cả) |
| Download file | Không | Có |
| Bộ lọc | Giống nhau | Giống nhau |
| Use case | Hiển thị trên web/app | Export để phân tích |

## Best Practices

1. **Sử dụng date range:** Luôn nên dùng `from_date` và `to_date` để giới hạn dữ liệu export, tránh export quá nhiều dữ liệu.

2. **Filter trước khi export:** Sử dụng các filter phù hợp để chỉ export dữ liệu cần thiết.

3. **Kiểm tra số lượng:** Có thể gọi `/orders` trước với cùng filter để kiểm tra số lượng bản ghi trước khi export.

4. **Xử lý lỗi:** Luôn kiểm tra status code và xử lý lỗi phù hợp.
