# Orders API - Hướng dẫn đầy đủ các tham số trên URL

API `/orders` hỗ trợ filter đầy đủ các trường trong bảng orders qua query parameters trên URL.

## Endpoint

```
GET /orders
```

## Các tham số phân trang

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `limit` | int | Số bản ghi tối đa (1-1000) | `limit=100` |
| `offset` | int | Vị trí bắt đầu (số trang × limit) | `offset=0` |
| `after_id` | string | Cursor: ID bản ghi cuối trang trước | `after_id=abc-123` |

## Các tham số Date Range

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `from_date` | string | Ngày bắt đầu (dd/mm/yyyy) | `from_date=01/02/2026` |
| `to_date` | string | Ngày kết thúc (dd/mm/yyyy) | `to_date=10/02/2026` |
| `date_column` | string | Cột date để filter (mặc định: `order_date`) | `date_column=created_at` |

**Các giá trị `date_column` hợp lệ:**
- `order_date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `postponed_date` (DATE)
- `accounting_check_date` (DATE)
- `estimated_delivery_date` (DATE)
- `order_time` (TIMESTAMP)
- `time_dayon` (TIMESTAMP)

## Các tham số Filter (hỗ trợ nhiều giá trị: `value1,value2,value3`)

### Thông tin đơn hàng

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `id` | string | ID đơn hàng | `id=abc-123` |
| `order_code` | string | Mã đơn hàng | `order_code=ORD001` |
| `order_date` | string | Ngày đơn hàng (dd/mm/yyyy) | `order_date=01/02/2026` |
| `product` | string | Sản phẩm | `product=Product A` hoặc `product=Product A,Product B` |
| `product_main` | string | Sản phẩm chính | `product_main=Main Product` |
| `product_name_1` | string | Tên sản phẩm 1 | `product_name_1=Item 1` |
| `product_name_2` | string | Tên sản phẩm 2 | `product_name_2=Item 2` |

### Thông tin khách hàng

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `customer_name` | string | Tên khách hàng | `customer_name=Nguyễn Văn A` |
| `customer_phone` | string | Số điện thoại | `customer_phone=0123456789` |
| `customer_address` | string | Địa chỉ | `customer_address=123 Đường ABC` |
| `city` | string | Thành phố | `city=Hà Nội` hoặc `city=Hà Nội,Hồ Chí Minh` |
| `state` | string | Tỉnh/Thành | `state=Hà Nội` |
| `zipcode` | string | Mã bưu điện | `zipcode=100000` |
| `country` | string | Quốc gia | `country=VN` hoặc `country=VN,US` |
| `area` | string | Khu vực | `area=Miền Bắc` |

### Thông tin nhân viên

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `marketing_staff` | string | Nhân viên marketing | `marketing_staff=Nguyễn Văn A` hoặc `marketing_staff=Nguyễn Văn A,Trần Thị B` |
| `sale_staff` | string | Nhân viên sale | `sale_staff=Nguyễn Văn A` |
| `delivery_staff` | string | Nhân viên giao hàng | `delivery_staff=Nguyễn Văn A` |
| `cskh` | string | CSKH | `cskh=Nguyễn Văn A` |
| `creator_name` | string | Người tạo | `creator_name=Admin` |
| `created_by` | string | Người tạo (ID) | `created_by=user123` |
| `last_modified_by` | string | Người sửa cuối | `last_modified_by=user123` |

### Thông tin đội nhóm

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `team` | string | **Lưu ý:** Map sang cột `shift` trong DB | `team=Morning` hoặc `team=Morning,Afternoon` |
| `shift` | string | Ca làm việc | `shift=Sáng` |

### Trạng thái đơn hàng

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `delivery_status` | string | Trạng thái giao hàng | `delivery_status=Delivered` hoặc `delivery_status=Delivered,Pending` |
| `delivery_status_nb` | string | Trạng thái giao hàng (số) | `delivery_status_nb=1` |
| `payment_status` | string | Trạng thái thanh toán | `payment_status=Paid` |
| `payment_status_detail` | string | Chi tiết trạng thái thanh toán | `payment_status_detail=Completed` |
| `cskh_status` | string | Trạng thái CSKH | `cskh_status=Active` |
| `check_result` | string | Kết quả kiểm tra | `check_result=Pass` |
| `accountant_confirm` | string | Xác nhận kế toán | `accountant_confirm=Yes` |

### Thông tin tài chính

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `total_vnd` | number | Tổng tiền VND | `total_vnd=1000000` |
| `total_amount_vnd` | number | Tổng số tiền VND | `total_amount_vnd=1000000` |
| `goods_amount` | number | Giá trị hàng hóa | `goods_amount=800000` |
| `reconciled_amount` | number | Số tiền đã đối soát | `reconciled_amount=1000000` |
| `reconciled_vnd` | number | Số tiền đối soát VND | `reconciled_vnd=1000000` |
| `shipping_fee` | number | Phí vận chuyển | `shipping_fee=50000` |
| `shipping_cost` | number | Chi phí vận chuyển | `shipping_cost=50000` |
| `general_fee` | number | Phí chung | `general_fee=10000` |
| `flight_fee` | number | Phí bay | `flight_fee=20000` |
| `account_rental_fee` | number | Phí thuê tài khoản | `account_rental_fee=5000` |
| `warehouse_fee` | number | Phí kho | `warehouse_fee=10000` |
| `base_price` | number | Giá gốc | `base_price=900000` |
| `sale_price` | number | Giá bán | `sale_price=1000000` |
| `exchange_rate` | number | Tỷ giá | `exchange_rate=24000` |
| `payment_type` | string | Loại thanh toán | `payment_type=Cash` |
| `payment_method` | string | Phương thức thanh toán | `payment_method=Bank Transfer` |
| `payment_method_text` | string | Phương thức thanh toán (text) | `payment_method_text=Chuyển khoản` |
| `payment_currency` | string | Loại tiền thanh toán | `payment_currency=VND` |

### Thông tin vận chuyển

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `tracking_code` | string | Mã tracking | `tracking_code=TRACK123` |
| `shipping_unit` | string | Đơn vị vận chuyển | `shipping_unit=Vietnam Post` |
| `carrier` | string | Nhà vận chuyển | `carrier=FedEx` |
| `cutoff_time` | string | Thời gian cắt | `cutoff_time=17:00` |

### Thông tin khác

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `note` | string | Ghi chú | `note=Giao hàng nhanh` |
| `note_sale` | string | Ghi chú sale | `note_sale=Khách hàng VIP` |
| `note_ffm` | string | Ghi chú FFM | `note_ffm=Giao hàng tận nơi` |
| `note_delivery` | string | Ghi chú giao hàng | `note_delivery=Giao vào buổi sáng` |
| `note_caps` | string | Ghi chú CAPS | `note_caps=Chú ý đóng gói` |
| `vandon_note` | string | Ghi chú vận đơn | `vandon_note=Kiểm tra kỹ` |
| `reason` | string | Lý do | `reason=Hết hàng` |
| `page_name` | string | Tên trang | `page_name=Facebook` |
| `customer_type` | string | Loại khách hàng | `customer_type=VIP` |
| `blacklist_status` | string | Trạng thái blacklist | `blacklist_status=No` |
| `feedback_pos` | string | Feedback tích cực | `feedback_pos=Good` |
| `feedback_neg` | string | Feedback tiêu cực | `feedback_neg=None` |
| `gift` | string | Quà tặng | `gift=Yes` |
| `gift_item` | string | Món quà | `gift_item=Sticker` |
| `item_name_1` | string | Tên item 1 | `item_name_1=Item A` |
| `item_name_2` | string | Tên item 2 | `item_name_2=Item B` |
| `item_qty_1` | number | Số lượng item 1 | `item_qty_1=2` |
| `item_qty_2` | number | Số lượng item 2 | `item_qty_2=1` |
| `quantity_1` | number | Số lượng 1 | `quantity_1=5` |
| `quantity_2` | number | Số lượng 2 | `quantity_2=3` |
| `gift_quantity` | number | Số lượng quà | `gift_quantity=1` |
| `gift_qty` | number | Số lượng quà (alt) | `gift_qty=1` |

## Ví dụ sử dụng

### Ví dụ 1: Lọc đơn giản

```
GET /orders?delivery_status=Delivered&limit=50
```

### Ví dụ 2: Lọc nhiều giá trị (OR condition)

```
GET /orders?city=Hà Nội,Hồ Chí Minh&delivery_status=Delivered,Pending
```

URL encoded:
```
GET /orders?city=H%C3%A0%20N%E1%BB%99i%2CH%E1%BB%93%20Ch%C3%AD%20Minh&delivery_status=Delivered%2CPending
```

### Ví dụ 3: Lọc theo date range

```
GET /orders?from_date=01/02/2026&to_date=10/02/2026&date_column=order_date
```

### Ví dụ 4: Lọc phức tạp với nhiều điều kiện

```
GET /orders?team=Morning,Afternoon&delivery_status=Delivered&payment_status=Paid&country=VN,US&from_date=01/01/2026&to_date=31/01/2026&limit=100
```

URL encoded:
```
GET /orders?team=Morning%2CAfternoon&delivery_status=Delivered&payment_status=Paid&country=VN%2CUS&from_date=01%2F01%2F2026&to_date=31%2F01%2F2026&limit=100
```

### Ví dụ 5: Lọc theo nhân viên marketing

```
GET /orders?marketing_staff=Nguyễn Văn A,Trần Thị B&from_date=01/02/2026&to_date=10/02/2026
```

URL encoded:
```
GET /orders?marketing_staff=Nguy%E1%BB%85n%20V%C4%83n%20A%2CTr%E1%BA%A7n%20Th%E1%BB%8B%20B&from_date=01%2F02%2F2026&to_date=10%2F02%2F2026
```

### Ví dụ 6: Phân trang với cursor

```
# Trang 1
GET /orders?limit=50&delivery_status=Delivered

# Trang 2 (sử dụng after_id từ trang 1)
GET /orders?limit=50&delivery_status=Delivered&after_id=abc-123-def-456
```

### Ví dụ 7: Lọc theo team (map sang shift)

```
GET /orders?team=Morning&delivery_status=Delivered&product=Product A
```

**Lưu ý:** Tham số `team` sẽ được map sang cột `shift` trong database.

## Response Format

```json
{
  "data": [
    {
      "id": "abc-123",
      "nhanvien_maketing": "Nguyễn Văn A",
      "nhanvien_sale": "Trần Thị B",
      "ngaytao": "2026-02-01T10:00:00+00:00",
      "tongtien": 1000000,
      "order_date": "2026-02-01",
      "country": "VN",
      "product": "Product A",
      "total_amount_vnd": 1050000,
      "tracking_code": "TRACK123",
      "team": "Team A",
      "delivery_status": "Delivered",
      "payment_status": "Paid",
      "delivery_staff": "Nguyễn Văn C",
      "check_result": "Pass",
      "shift": "Morning"
    }
  ],
  "count": 1,
  "next_after_id": "abc-123"
}
```

## Lưu ý quan trọng

1. **Nhiều giá trị:** Các tham số hỗ trợ nhiều giá trị cách nhau bởi dấu phẩy (`,`). Ví dụ: `city=Hà Nội,Hồ Chí Minh` sẽ lọc các đơn có city là "Hà Nội" HOẶC "Hồ Chí Minh".

2. **URL Encoding:** Khi sử dụng trong URL, các giá trị đặc biệt cần được encode:
   - Dấu phẩy: `,` → `%2C`
   - Khoảng trắng: ` ` → `%20`
   - Dấu gạch chéo: `/` → `%2F`

3. **Date Format:** 
   - Date columns (`order_date`, `postponed_date`, ...): Format `dd/mm/yyyy` hoặc `yyyy-mm-dd`
   - Timestamp columns (`created_at`, `updated_at`, ...): Format `dd/mm/yyyy` (sẽ filter cả ngày đó)

4. **Team mapping:** Tham số `team` được map sang cột `shift` trong database.

5. **Case sensitivity:** So sánh không phân biệt hoa thường cho một số trường.

6. **Giới hạn:** 
   - `limit` tối đa: 1000
   - Số bản ghi query tối đa: 1000 (trước khi phân trang)

## Test với cURL

```bash
# Ví dụ đơn giản
curl "http://127.0.0.1:8000/orders?delivery_status=Delivered&limit=10"

# Ví dụ với nhiều filter
curl "http://127.0.0.1:8000/orders?team=Morning&delivery_status=Delivered&payment_status=Paid&from_date=01/02/2026&to_date=10/02/2026&limit=50"

# Ví dụ với nhiều giá trị
curl "http://127.0.0.1:8000/orders?city=H%C3%A0%20N%E1%BB%99i%2CH%E1%BB%93%20Ch%C3%AD%20Minh&delivery_status=Delivered%2CPending"
```

## Test với JavaScript

```javascript
// Ví dụ với Fetch API
const params = new URLSearchParams({
  team: 'Morning,Afternoon',
  delivery_status: 'Delivered',
  payment_status: 'Paid',
  country: 'VN,US',
  from_date: '01/02/2026',
  to_date: '10/02/2026',
  limit: '100'
});

const response = await fetch(`http://127.0.0.1:8000/orders?${params}`);
const data = await response.json();
console.log(data);
```

## Test với PowerShell

```powershell
$baseUrl = "http://127.0.0.1:8000"
$params = @{
    team = "Morning,Afternoon"
    delivery_status = "Delivered"
    payment_status = "Paid"
    from_date = "01/02/2026"
    to_date = "10/02/2026"
    limit = 100
}

$queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$([System.Web.HttpUtility]::UrlEncode($_.Value))" }) -join '&'
$url = "$baseUrl/orders?$queryString"

$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$json = $response.Content | ConvertFrom-Json
$json.data
```
