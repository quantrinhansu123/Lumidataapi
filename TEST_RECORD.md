# Test Record

## Record ID
```
0000cb03-95e0-4683-bd48-326a048b4382
```

## Data
```json
{
  "id": "0000cb03-95e0-4683-bd48-326a048b4382",
  "ten": "Lục Trần Minh Trí",
  "ngay": "2026-01-23",
  "ca": "Giữa ca",
  "san_pham": "Bonavita Coffee",
  "thi_truong": "US"
}
```

## Test Links

### 1. Tính toán cho record này:
```
http://localhost:3000/api/calculate-detail-report-count?recordId=0000cb03-95e0-4683-bd48-326a048b4382
```

### 2. Debug matching:
```
http://localhost:3000/api/debug-detail-matching?recordId=0000cb03-95e0-4683-bd48-326a048b4382
```

### 3. Xem orders có marketing_staff = "Lục Trần Minh Trí" và ngày 2026-01-23:
```
http://localhost:8000/orders?marketing_staff=Lục Trần Minh Trí&from_date=23/01/2026&to_date=23/01/2026
```

## Logic Matching

Theo yêu cầu:
- **Tên** (detail_reports) = **marketing_staff** (orders)
- **Ngày** (detail_reports) = **order_date** (orders)
- **ca** (detail_reports) = **shift** (orders) - Logic đặc biệt:
  - "Hết ca" → nhận cả "Hết ca" và "Giữa ca"
  - "Giữa ca" → **CẦN XÁC NHẬN LẠI**
- **Sản_phẩm** (detail_reports) = **product** (orders) - Optional
- **Thị_trường** (detail_reports) = **country** (orders) - Optional

## Lưu ý

Record này có `ca: "Giữa ca"`. Cần xác nhận lại logic:
- "Giữa ca" sẽ nhận orders có shift là gì?
  - Chỉ "Giữa ca"?
  - Cả "Hết ca" và "Giữa ca"?
