# Statistics API - Hướng dẫn sử dụng

API tính toán thống kê dựa trên bộ lọc từ Frontend.

## Endpoints

### 1. POST `/orders/statistics`

Tính toán thống kê với bộ lọc phức tạp qua body JSON.

**Request:**
```json
POST /orders/statistics
Content-Type: application/json

{
  "filters": {
    "team": ["Team A", "Team B"],
    "delivery_status": "Delivered",
    "country": "US",
    "payment_status": "Paid"
  },
  "date_range": {
    "from": "01/03/2026",
    "to": "31/03/2026"
  },
  "date_column": "created_at"
}
```

**Response:**
```json
{
  "statistics": {
    "total_orders": 150,
    "total_revenue_vnd": 75000000.0,
    "total_amount_vnd": 78000000.0,
    "average_order_value": 500000.0,
    "by_delivery_status": {
      "count": {
        "Delivered": 120,
        "Pending": 30
      },
      "percentage": {
        "Delivered": 80.0,
        "Pending": 20.0
      }
    },
    "by_payment_status": {
      "count": {
        "Paid": 100,
        "Unpaid": 50
      },
      "percentage": {
        "Paid": 66.67,
        "Unpaid": 33.33
      }
    },
    "by_team": {
      "count": {
        "Team A": 75,
        "Team B": 75
      },
      "revenue": {
        "Team A": 37500000.0,
        "Team B": 37500000.0
      }
    },
    "by_country": {
      "count": {
        "US": 90,
        "VN": 60
      },
      "revenue": {
        "US": 45000000.0,
        "VN": 30000000.0
      }
    },
    "by_marketing_staff": {
      "count": {},
      "revenue": {}
    },
    "by_sale_staff": {
      "count": {},
      "revenue": {}
    },
    "by_product": {
      "count": {},
      "revenue": {}
    },
    "by_shift": {
      "count": {},
      "revenue": {}
    },
    "by_check_result": {
      "count": {},
      "revenue": {}
    }
  },
  "filters_applied": {
    "team": ["Team A", "Team B"],
    "delivery_status": "Delivered",
    "country": "US",
    "payment_status": "Paid"
  },
  "date_range": {
    "from": "01/03/2026",
    "to": "31/03/2026"
  },
  "total_records_analyzed": 150
}
```

### 2. GET `/orders/statistics`

Tính toán thống kê với bộ lọc qua query parameters.

**Request:**
```
GET /orders/statistics?created_at=01/03/2026&team=Team%20A&delivery_status=Delivered
```

**Response:** Tương tự như POST endpoint

## Ví dụ sử dụng

### Ví dụ 1: Lọc theo ngày và trạng thái
```bash
curl -X POST http://127.0.0.1:8000/orders/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "delivery_status": "Delivered"
    },
    "date_range": {
      "from": "01/03/2026",
      "to": "31/03/2026"
    }
  }'
```

### Ví dụ 2: Lọc theo nhiều team (OR condition)
```bash
curl -X POST http://127.0.0.1:8000/orders/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "team": ["Team A", "Team B", "Team C"]
    }
  }'
```

### Ví dụ 3: Lọc phức tạp với nhiều điều kiện
```bash
curl -X POST http://127.0.0.1:8000/orders/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "team": ["Team A"],
      "delivery_status": "Delivered",
      "payment_status": "Paid",
      "country": "US"
    },
    "date_range": {
      "from": "01/01/2026",
      "to": "31/12/2026"
    },
    "date_column": "order_date"
  }'
```

### Ví dụ 4: Sử dụng GET với query params
```bash
curl "http://127.0.0.1:8000/orders/statistics?created_at=01/03/2026&delivery_status=Delivered&payment_status=Paid"
```

## Các trường có thể filter

- `team` - Đội nhóm (hỗ trợ mảng)
- `delivery_status` - Trạng thái giao hàng
- `payment_status` - Trạng thái thanh toán
- `country` - Quốc gia
- `marketing_staff` - Nhân viên marketing
- `sale_staff` - Nhân viên sale
- `product` - Sản phẩm
- `shift` - Ca làm việc
- `check_result` - Kết quả kiểm tra
- `created_at` - Ngày tạo (timestamp)
- `order_date` - Ngày đơn hàng (date)
- Và tất cả các cột khác trong bảng orders

## Date Range

- `from`: Ngày bắt đầu (format: dd/mm/yyyy hoặc yyyy-mm-dd)
- `to`: Ngày kết thúc (format: dd/mm/yyyy hoặc yyyy-mm-dd)
- `date_column`: Cột date để filter (mặc định: "created_at")

## Thống kê được tính

1. **Tổng quan:**
   - `total_orders`: Tổng số đơn hàng
   - `total_revenue_vnd`: Tổng doanh thu (total_vnd)
   - `total_amount_vnd`: Tổng số tiền (total_amount_vnd)
   - `average_order_value`: Giá trị trung bình mỗi đơn

2. **Thống kê theo nhóm:**
   - `by_delivery_status`: Count và phần trăm
   - `by_payment_status`: Count và phần trăm
   - `by_team`: Count và revenue
   - `by_country`: Count và revenue
   - `by_marketing_staff`: Count và revenue
   - `by_sale_staff`: Count và revenue
   - `by_product`: Count và revenue
   - `by_shift`: Count và revenue
   - `by_check_result`: Count và revenue

## Lưu ý

- API tự động tính toán trên toàn bộ dữ liệu phù hợp với bộ lọc
- Giới hạn tối đa 50,000 bản ghi để tránh quá tải
- Hỗ trợ filter mảng cho OR condition (ví dụ: `team: ["A", "B"]`)
- Date range chỉ áp dụng cho các cột timestamp
