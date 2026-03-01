# Ví dụ: Tính tổng doanh số theo nhân viên marketing

## Yêu cầu
Tính tổng doanh số của nhân viên marketing "Nguyễn Đức Anh" theo `total_amount_vnd` từ ngày 1/2/2026 đến 10/2/2026, lấy từ cột `order_date`.

## Frontend (FE) - JavaScript/TypeScript

### Cách 1: Sử dụng Fetch API

```javascript
async function getMarketingStaffRevenue() {
  const url = 'http://127.0.0.1:8000/orders/statistics';
  
  const requestBody = {
    filters: {
      marketing_staff: "Nguyễn Đức Anh"
    },
    date_range: {
      from: "01/02/2026",
      to: "10/02/2026"
    },
    date_column: "order_date"
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // Lấy tổng doanh số theo total_amount_vnd
    const totalRevenue = data.statistics.total_amount_vnd;
    const totalOrders = data.statistics.total_orders;
    
    console.log('Tổng doanh số:', totalRevenue, 'VND');
    console.log('Tổng số đơn:', totalOrders);
    console.log('Chi tiết:', data);
    
    return {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      statistics: data.statistics
    };
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
}

// Gọi hàm
getMarketingStaffRevenue();
```

### Cách 2: Sử dụng Axios

```javascript
import axios from 'axios';

async function getMarketingStaffRevenue() {
  const response = await axios.post('http://127.0.0.1:8000/orders/statistics', {
    filters: {
      marketing_staff: "Nguyễn Đức Anh"
    },
    date_range: {
      from: "01/02/2026",
      to: "10/02/2026"
    },
    date_column: "order_date"
  });

  const totalRevenue = response.data.statistics.total_amount_vnd;
  const totalOrders = response.data.statistics.total_orders;
  
  return {
    totalRevenue,
    totalOrders,
    statistics: response.data.statistics
  };
}
```

### Cách 3: React Hook

```jsx
import { useState, useEffect } from 'react';

function useMarketingStaffRevenue(marketingStaff, fromDate, toDate) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://127.0.0.1:8000/orders/statistics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filters: {
              marketing_staff: marketingStaff
            },
            date_range: {
              from: fromDate,
              to: toDate
            },
            date_column: "order_date"
          })
        });

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (marketingStaff && fromDate && toDate) {
      fetchData();
    }
  }, [marketingStaff, fromDate, toDate]);

  return {
    data,
    loading,
    error,
    totalRevenue: data?.statistics?.total_amount_vnd || 0,
    totalOrders: data?.statistics?.total_orders || 0
  };
}

// Sử dụng trong component
function RevenueDashboard() {
  const { totalRevenue, totalOrders, loading } = useMarketingStaffRevenue(
    "Nguyễn Đức Anh",
    "01/02/2026",
    "10/02/2026"
  );

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Doanh số nhân viên: Nguyễn Đức Anh</h2>
      <p>Tổng doanh số: {totalRevenue.toLocaleString('vi-VN')} VND</p>
      <p>Tổng số đơn: {totalOrders}</p>
    </div>
  );
}
```

## Backend (BE) - Xử lý request

### Request nhận được:

```json
POST /orders/statistics
{
  "filters": {
    "marketing_staff": "Nguyễn Đức Anh"
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "date_column": "order_date"
}
```

### Backend xử lý:

1. **Parse date range:**
   - `from: "01/02/2026"` → `"2026-02-01"`
   - `to: "10/02/2026"` → `"2026-02-10"`

2. **Query Supabase:**
   ```python
   stats_query = supabase.table("orders").select(
       "total_vnd, total_amount_vnd, marketing_staff, ..."
   )
   .eq("marketing_staff", "Nguyễn Đức Anh")
   .gte("order_date", "2026-02-01")
   .lte("order_date", "2026-02-10")
   ```

3. **Tính toán:**
   - Lấy tất cả orders thỏa điều kiện
   - Tính tổng `total_amount_vnd`
   - Đếm số đơn hàng

### Response trả về:

```json
{
  "statistics": {
    "total_orders": 25,
    "total_revenue_vnd": 12500000.0,
    "total_amount_vnd": 13000000.0,  // ← Đây là giá trị cần
    "average_order_value": 500000.0,
    "by_marketing_staff": {
      "count": {
        "Nguyễn Đức Anh": 25
      },
      "revenue": {
        "Nguyễn Đức Anh": 13000000.0
      }
    },
    ...
  },
  "filters_applied": {
    "marketing_staff": "Nguyễn Đức Anh"
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "total_records_analyzed": 25
}
```

## Test với cURL

```bash
curl -X POST http://127.0.0.1:8000/orders/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "marketing_staff": "Nguyễn Đức Anh"
    },
    "date_range": {
      "from": "01/02/2026",
      "to": "10/02/2026"
    },
    "date_column": "order_date"
  }'
```

## Test với PowerShell

```powershell
$body = @{
    filters = @{
        marketing_staff = "Nguyễn Đức Anh"
    }
    date_range = @{
        from = "01/02/2026"
        to = "10/02/2026"
    }
    date_column = "order_date"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/orders/statistics" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$json = $response.Content | ConvertFrom-Json
Write-Host "Tổng doanh số: $($json.statistics.total_amount_vnd) VND"
Write-Host "Tổng số đơn: $($json.statistics.total_orders)"
```

## Lưu ý

1. **Tên nhân viên:** Phải khớp chính xác với dữ liệu trong database (có thể có dấu, khoảng trắng)
2. **Format ngày:** Hỗ trợ `dd/mm/yyyy` hoặc `yyyy-mm-dd`
3. **Cột date:** `order_date` là cột type DATE, không phải TIMESTAMP
4. **Kết quả:** `total_amount_vnd` là tổng doanh số theo cột `total_amount_vnd`
