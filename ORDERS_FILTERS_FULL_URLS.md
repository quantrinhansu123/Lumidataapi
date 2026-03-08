# Orders API - Link đầy đủ tất cả trường lọc (Checkbox/Tickbox)

Tài liệu này cung cấp các ví dụ URL đầy đủ cho tất cả các trường lọc của endpoint `/orders`, đặc biệt hỗ trợ **bộ lọc dạng tickbox** (nhiều giá trị).

## Base URL

```
http://127.0.0.1:8000/orders
```

## Cấu trúc URL với nhiều giá trị (Checkbox)

**Format:** `?field=value1,value2,value3`

Khi chọn nhiều checkbox, các giá trị được cách nhau bởi dấu phẩy (`,`). API sẽ trả về các bản ghi thỏa **BẤT KỲ** giá trị nào (OR condition).

---

## 1. Lọc theo Nhân viên (Staff)

### Marketing Staff (Nhiều giá trị)
```
http://127.0.0.1:8000/orders?marketing_staff=Nguyễn Đức Anh,Trần Văn Bình,Lê Thị C
```

### Sale Staff
```
http://127.0.0.1:8000/orders?sale_staff=Nguyễn Văn A,Trần Thị B
```

### Delivery Staff (Nhiều giá trị)
```
http://127.0.0.1:8000/orders?delivery_staff=Nguyễn Văn C,Trần Văn D,Lê Văn E
```

### CSKH
```
http://127.0.0.1:8000/orders?cskh=Nguyễn Văn F
```

---

## 2. Lọc theo Team/Ca làm việc (Shift)

**Lưu ý:** Parameter `team` được map sang cột `shift` trong database.

### Team (Nhiều giá trị - Checkbox)
```
http://127.0.0.1:8000/orders?team=Morning,Afternoon,Night
```

### Shift (trực tiếp)
```
http://127.0.0.1:8000/orders?shift=Sáng,Chiều,Tối
```

---

## 3. Lọc theo Trạng thái (Status)

### Delivery Status (Nhiều giá trị - Checkbox)
```
http://127.0.0.1:8000/orders?delivery_status=Delivered,Pending,In Transit
```

### Payment Status (Nhiều giá trị - Checkbox)
```
http://127.0.0.1:8000/orders?payment_status=Paid,Unpaid,Pending
```

### Check Result
```
http://127.0.0.1:8000/orders?check_result=Pass,Fail,Checking
```

### CSKH Status
```
http://127.0.0.1:8000/orders?cskh_status=Active,Inactive
```

---

## 4. Lọc theo Sản phẩm (Product)

### Product (Nhiều giá trị - Checkbox)
```
http://127.0.0.1:8000/orders?product=Product A,Product B,Product C
```

### Product Main
```
http://127.0.0.1:8000/orders?product_main=Main Product 1,Main Product 2
```

---

## 5. Lọc theo Địa lý (Geography)

### Country (Nhiều giá trị - Checkbox)
```
http://127.0.0.1:8000/orders?country=VN,US,UK,JP
```

### City (Nhiều giá trị - Checkbox)
```
http://127.0.0.1:8000/orders?city=Hà Nội,Hồ Chí Minh,Đà Nẵng
```

### State
```
http://127.0.0.1:8000/orders?state=Hà Nội,Hồ Chí Minh
```

### Area
```
http://127.0.0.1:8000/orders?area=Miền Bắc,Miền Nam,Miền Trung
```

---

## 6. Lọc theo Ngày tháng (Date Range)

### Order Date Range
```
http://127.0.0.1:8000/orders?from_date=01/02/2026&to_date=10/02/2026&date_column=order_date
```

### Created At Range
```
http://127.0.0.1:8000/orders?from_date=01/02/2026&to_date=10/02/2026&date_column=created_at
```

### Multiple Order Dates (Checkbox)
```
http://127.0.0.1:8000/orders?order_date=01/02/2026,02/02/2026,03/02/2026
```

---

## 7. Lọc theo Tracking & Vận chuyển

### Tracking Code
```
http://127.0.0.1:8000/orders?tracking_code=TRACK001,TRACK002,TRACK003
```

### Shipping Unit
```
http://127.0.0.1:8000/orders?shipping_unit=Vietnam Post,FedEx,DHL
```

### Carrier
```
http://127.0.0.1:8000/orders?carrier=FedEx,UPS,DHL
```

---

## 8. Lọc theo Khách hàng (Customer)

### Customer Name
```
http://127.0.0.1:8000/orders?customer_name=Nguyễn Văn A,Trần Thị B
```

### Customer Phone
```
http://127.0.0.1:8000/orders?customer_phone=0123456789,0987654321
```

### Customer Type
```
http://127.0.0.1:8000/orders?customer_type=VIP,Regular,Premium
```

---

## 9. Lọc theo Thanh toán (Payment)

### Payment Method
```
http://127.0.0.1:8000/orders?payment_method=Bank Transfer,Cash,Credit Card
```

### Payment Type
```
http://127.0.0.1:8000/orders?payment_type=Cash,Card,Transfer
```

### Payment Currency
```
http://127.0.0.1:8000/orders?payment_currency=VND,USD,EUR
```

---

## 10. Ví dụ kết hợp nhiều filter (Checkbox)

### Ví dụ 1: Team + Delivery Status + Payment Status
```
http://127.0.0.1:8000/orders?team=Morning,Afternoon&delivery_status=Delivered,Pending&payment_status=Paid,Unpaid&from_date=01/02/2026&to_date=10/02/2026
```

### Ví dụ 2: Marketing Staff + Product + Country
```
http://127.0.0.1:8000/orders?marketing_staff=Nguyễn Đức Anh,Trần Văn Bình&product=Product A,Product B&country=VN,US&from_date=01/02/2026&to_date=31/02/2026
```

### Ví dụ 3: Delivery Staff + Team + Delivery Status
```
http://127.0.0.1:8000/orders?delivery_staff=Nguyễn Văn C,Trần Văn D&team=Morning,Afternoon&delivery_status=Delivered&from_date=01/01/2026&to_date=31/01/2026
```

### Ví dụ 4: Đầy đủ các filter quan trọng
```
http://127.0.0.1:8000/orders?team=Morning,Afternoon,Night&delivery_status=Delivered,Pending&payment_status=Paid,Unpaid&delivery_staff=Staff1,Staff2,Staff3&country=VN,US&product=Product A,Product B&from_date=01/01/2026&to_date=31/01/2026
```

---

## 11. URL Encoded (Sử dụng trong code)

Khi sử dụng trong code (JavaScript, cURL, PowerShell), cần encode URL:

### JavaScript
```javascript
const baseUrl = 'http://127.0.0.1:8000/orders';
const params = new URLSearchParams({
  team: 'Morning,Afternoon',
  delivery_status: 'Delivered,Pending',
  payment_status: 'Paid',
  delivery_staff: 'Nguyễn Văn C,Trần Văn D',
  from_date: '01/02/2026',
  to_date: '10/02/2026'
});
const url = `${baseUrl}?${params.toString()}`;
// http://127.0.0.1:8000/orders?team=Morning%2CAfternoon&delivery_status=Delivered%2CPending&payment_status=Paid&delivery_staff=Nguy%E1%BB%85n+V%C4%83n+C%2CTr%E1%BA%A7n+V%C4%83n+D&from_date=01%2F02%2F2026&to_date=10%2F02%2F2026
```

### PowerShell
```powershell
$baseUrl = "http://127.0.0.1:8000/orders"
$params = @{
    team = "Morning,Afternoon"
    delivery_status = "Delivered,Pending"
    payment_status = "Paid"
    delivery_staff = "Nguyễn Văn C,Trần Văn D"
    from_date = "01/02/2026"
    to_date = "10/02/2026"
}

$queryString = ($params.GetEnumerator() | ForEach-Object { 
    "$($_.Key)=$([System.Web.HttpUtility]::UrlEncode($_.Value))" 
}) -join '&'
$url = "$baseUrl?$queryString"
Invoke-WebRequest -Uri $url -UseBasicParsing
```

### cURL
```bash
curl "http://127.0.0.1:8000/orders?team=Morning%2CAfternoon&delivery_status=Delivered%2CPending&payment_status=Paid&from_date=01%2F02%2F2026&to_date=10%2F02%2F2026"
```

---

## 12. Danh sách đầy đủ tất cả các trường có thể lọc

### Thông tin đơn hàng
- `id`, `order_code`, `order_date`, `product`, `product_main`, `product_name_1`, `product_name_2`

### Thông tin khách hàng
- `customer_name`, `customer_phone`, `customer_address`, `city`, `state`, `zipcode`, `country`, `area`, `customer_type`, `blacklist_status`

### Thông tin nhân viên
- `marketing_staff`, `sale_staff`, `delivery_staff`, `cskh`, `creator_name`, `created_by`, `last_modified_by`

### Thông tin đội nhóm
- `team` (map sang `shift`), `shift`

### Trạng thái
- `delivery_status`, `delivery_status_nb`, `payment_status`, `payment_status_detail`, `cskh_status`, `check_result`, `accountant_confirm`

### Tài chính
- `total_vnd`, `total_amount_vnd`, `goods_amount`, `reconciled_amount`, `reconciled_vnd`, `shipping_fee`, `shipping_cost`, `general_fee`, `flight_fee`, `account_rental_fee`, `warehouse_fee`, `base_price`, `sale_price`, `exchange_rate`

### Thanh toán
- `payment_type`, `payment_method`, `payment_method_text`, `payment_currency`

### Vận chuyển
- `tracking_code`, `shipping_unit`, `carrier`, `cutoff_time`

### Ngày tháng
- `order_date`, `created_at`, `updated_at`, `postponed_date`, `accounting_check_date`, `estimated_delivery_date`, `order_time`, `time_dayon`

### Khác
- `note`, `note_sale`, `note_ffm`, `note_delivery`, `note_caps`, `vandon_note`, `reason`, `page_name`, `feedback_pos`, `feedback_neg`, `gift`, `gift_item`, `item_name_1`, `item_name_2`, `item_qty_1`, `item_qty_2`, `quantity_1`, `quantity_2`, `gift_quantity`, `gift_qty`

---

## 13. Lưu ý quan trọng

1. **Nhiều giá trị (Checkbox):** Dùng dấu phẩy (`,`) để phân cách. Ví dụ: `team=Morning,Afternoon` sẽ lọc các đơn có team là "Morning" **HOẶC** "Afternoon".

2. **URL Encoding:** Khi dùng trong code, tự động encode. Khi test trực tiếp trên browser, có thể dùng dấu phẩy trực tiếp.

3. **Date Format:** 
   - `from_date` và `to_date`: Format `dd/mm/yyyy`
   - `order_date` (single value): Format `dd/mm/yyyy` hoặc `yyyy-mm-dd`

4. **Team Mapping:** Parameter `team` được map sang cột `shift` trong database.

5. **Case Sensitivity:** So sánh chính xác (case-sensitive) cho hầu hết các trường.

6. **Không giới hạn:** Mặc định API lấy **TẤT CẢ** dữ liệu thỏa điều kiện. Dùng `limit` nếu muốn giới hạn.

---

## 14. Test nhanh

### Test với browser
Mở browser và truy cập:
```
http://127.0.0.1:8000/orders?team=Morning,Afternoon&delivery_status=Delivered&limit=10
```

### Test với Postman
1. Method: `GET`
2. URL: `http://127.0.0.1:8000/orders`
3. Params tab:
   - `team`: `Morning,Afternoon`
   - `delivery_status`: `Delivered`
   - `limit`: `10`

---

## 15. Response Format

```json
{
  "data": [
    {
      "id": "abc-123",
      "nhanvien_maketing": "Nguyễn Đức Anh",
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
