# Ví dụ: Tính toán Tổng CPQC và Tổng Số_Mess_Cmt theo bộ lọc

## Yêu cầu
Tính toán **Tổng CPQC** và **Tổng Số_Mess_Cmt** từ bảng `detail_reports` với các bộ lọc:
- **Tên** (có thể chọn nhiều)
- **Ngày**
- **ca**
- **Sản_phẩm**
- **Thị_trường**
- **Team**

## Frontend (FE) - JavaScript/TypeScript

### Cách 1: Tính toán với nhiều Tên (mảng)

```javascript
async function calculateDetailReportsStats() {
  const url = 'http://127.0.0.1:8000/detail_reports/statistics';
  
  const requestBody = {
    filters: {
      ten: ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"],  // ← Chọn nhiều tên
      ca: "Sáng",
      san_pham: "Sản phẩm A",
      thi_truong: "Thị trường A",
      team: "Team A"
    },
    date_range: {
      from: "01/02/2026",
      to: "10/02/2026"
    },
    date_column: "ngay"
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
    
    // Lấy tổng CPQC và tổng Số_Mess_Cmt
    const totalCPQC = data.statistics.total_cpqc;
    const totalMessCmt = data.statistics.total_mess_cmt;
    const totalRecords = data.statistics.total_records;
    
    console.log('Tổng CPQC:', totalCPQC);
    console.log('Tổng Số_Mess_Cmt:', totalMessCmt);
    console.log('Tổng số bản ghi:', totalRecords);
    console.log('Chi tiết:', data.statistics);
    
    return {
      totalCPQC: totalCPQC,
      totalMessCmt: totalMessCmt,
      totalRecords: totalRecords,
      statistics: data.statistics
    };
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
}

// Gọi hàm
calculateDetailReportsStats();
```

### Cách 2: Tính toán với 1 Tên

```javascript
async function calculateSingleNameStats() {
  const url = 'http://127.0.0.1:8000/detail_reports/statistics';
  
  const requestBody = {
    filters: {
      ten: "Nguyễn Văn A",  // ← 1 tên (string)
      ca: "Sáng",
      team: "Team A"
    },
    date_range: {
      from: "01/02/2026",
      to: "10/02/2026"
    },
    date_column: "ngay"
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  return {
    totalCPQC: data.statistics.total_cpqc,
    totalMessCmt: data.statistics.total_mess_cmt
  };
}
```

### Cách 3: React Hook

```jsx
import { useState, useEffect } from 'react';

function useDetailReportsStats(filters, dateRange) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://127.0.0.1:8000/detail_reports/statistics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filters: filters,
            date_range: dateRange,
            date_column: "ngay"
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

    if (filters && dateRange) {
      fetchData();
    }
  }, [filters, dateRange]);

  return {
    data,
    loading,
    error,
    totalCPQC: data?.statistics?.total_cpqc || 0,
    totalMessCmt: data?.statistics?.total_mess_cmt || 0,
    totalRecords: data?.statistics?.total_records || 0
  };
}

// Sử dụng trong component
function DetailReportsDashboard() {
  const filters = {
    ten: ["Nguyễn Văn A", "Trần Thị B"],  // Nhiều tên
    ca: "Sáng",
    team: "Team A"
  };
  
  const dateRange = {
    from: "01/02/2026",
    to: "10/02/2026"
  };

  const { totalCPQC, totalMessCmt, totalRecords, loading } = useDetailReportsStats(filters, dateRange);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Thống kê Detail Reports</h2>
      <p>Tổng CPQC: {totalCPQC.toLocaleString('vi-VN')}</p>
      <p>Tổng Số_Mess_Cmt: {totalMessCmt.toLocaleString('vi-VN')}</p>
      <p>Tổng số bản ghi: {totalRecords}</p>
    </div>
  );
}
```

### Cách 4: Tính toán với tất cả các filter

```javascript
async function calculateWithAllFilters() {
  const requestBody = {
    filters: {
      ten: ["Nguyễn Văn A", "Trần Thị B"],  // Nhiều tên
      ca: "Sáng",
      san_pham: "Sản phẩm A",
      thi_truong: "Thị trường A",
      team: "Team A"
    },
    date_range: {
      from: "01/02/2026",
      to: "10/02/2026"
    },
    date_column: "ngay"
  };

  const response = await fetch('http://127.0.0.1:8000/detail_reports/statistics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  
  // Kết quả chính
  console.log('Tổng CPQC:', data.statistics.total_cpqc);
  console.log('Tổng Số_Mess_Cmt:', data.statistics.total_mess_cmt);
  
  // Chi tiết theo từng nhóm
  console.log('Theo tên:', data.statistics.by_ten);
  console.log('Theo ca:', data.statistics.by_ca);
  console.log('Theo team:', data.statistics.by_team);
  
  return data;
}
```

## Backend (BE) - Xử lý request

### Request nhận được:

```json
POST /detail_reports/statistics
{
  "filters": {
    "ten": ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"],  // ← Mảng nhiều tên
    "ca": "Sáng",
    "san_pham": "Sản phẩm A",
    "thi_truong": "Thị trường A",
    "team": "Team A"
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "date_column": "ngay"
}
```

### Backend xử lý:

1. **Parse date range:**
   - `from: "01/02/2026"` → `"2026-02-01"`
   - `to: "10/02/2026"` → `"2026-02-10"`

2. **Query Supabase:**
   ```python
   stats_query = supabase.table("detail_reports").select(...)
       .in_("ten", ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"])  # Filter nhiều tên
       .eq("ca", "Sáng")
       .eq("san_pham", "Sản phẩm A")
       .eq("thi_truong", "Thị trường A")
       .eq("team", "Team A")
       .gte("ngay", "2026-02-01")
       .lte("ngay", "2026-02-10")
   ```

3. **Tính toán:**
   - Tính **Tổng CPQC**: Tổng hợp tất cả giá trị CPQC (nếu là số) hoặc đếm số lượng (nếu là text)
   - Tính **Tổng Số_Mess_Cmt**: Tổng tất cả giá trị so_mess_cmt

### Response trả về:

```json
{
  "statistics": {
    "total_records": 50,
    "total_cpqc": 45.0,  // ← Tổng CPQC
    "total_mess_cmt": 2500.0,  // ← Tổng Số_Mess_Cmt
    "average_mess_cmt": 50.0,
    "by_ten": {
      "count": {
        "Nguyễn Văn A": 20,
        "Trần Thị B": 18,
        "Lê Văn C": 12
      },
      "total_mess_cmt": {
        "Nguyễn Văn A": 1000.0,
        "Trần Thị B": 900.0,
        "Lê Văn C": 600.0
      },
      "total_cpqc": {
        "Nguyễn Văn A": 18.0,
        "Trần Thị B": 16.0,
        "Lê Văn C": 11.0
      }
    },
    "by_ca": {
      "count": {
        "Sáng": 50
      },
      "total_mess_cmt": {
        "Sáng": 2500.0
      },
      "total_cpqc": {
        "Sáng": 45.0
      }
    },
    "by_team": {
      "count": {
        "Team A": 50
      },
      "total_mess_cmt": {
        "Team A": 2500.0
      },
      "total_cpqc": {
        "Team A": 45.0
      }
    },
    ...
  },
  "filters_applied": {
    "ten": ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"],
    "ca": "Sáng",
    "san_pham": "Sản phẩm A",
    "thi_truong": "Thị trường A",
    "team": "Team A"
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "total_records_analyzed": 50
}
```

## Test với cURL

```bash
curl -X POST http://127.0.0.1:8000/detail_reports/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "ten": ["Nguyễn Văn A", "Trần Thị B"],
      "ca": "Sáng",
      "team": "Team A"
    },
    "date_range": {
      "from": "01/02/2026",
      "to": "10/02/2026"
    },
    "date_column": "ngay"
  }'
```

## Test với PowerShell

```powershell
$body = @{
    filters = @{
        ten = @("Nguyễn Văn A", "Trần Thị B", "Lê Văn C")  # Nhiều tên
        ca = "Sáng"
        san_pham = "Sản phẩm A"
        thi_truong = "Thị trường A"
        team = "Team A"
    }
    date_range = @{
        from = "01/02/2026"
        to = "10/02/2026"
    }
    date_column = "ngay"
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/detail_reports/statistics" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$json = $response.Content | ConvertFrom-Json

Write-Host "Tổng CPQC: $($json.statistics.total_cpqc)" -ForegroundColor Green
Write-Host "Tổng Số_Mess_Cmt: $($json.statistics.total_mess_cmt)" -ForegroundColor Green
Write-Host "Tổng số bản ghi: $($json.statistics.total_records)" -ForegroundColor Green

Write-Host "`nChi tiết theo tên:" -ForegroundColor Yellow
$json.statistics.by_ten.count.PSObject.Properties | ForEach-Object {
    $ten = $_.Name
    $count = $_.Value
    $messCmt = $json.statistics.by_ten.total_mess_cmt.$ten
    $cpqc = $json.statistics.by_ten.total_cpqc.$ten
    Write-Host "  $ten : $count bản ghi, CPQC: $cpqc, Mess/Cmt: $messCmt" -ForegroundColor White
}
```

## Lưu ý

1. **Tên (ten):** 
   - Có thể truyền string `"Nguyễn Văn A"` → 1 tên
   - Có thể truyền mảng `["Nguyễn Văn A", "Trần Thị B"]` → Nhiều tên (OR condition)

2. **Tổng CPQC:**
   - Nếu CPQC là số → Tính tổng giá trị
   - Nếu CPQC là text → Đếm số lượng bản ghi có CPQC

3. **Tổng Số_Mess_Cmt:**
   - Luôn tính tổng giá trị số

4. **Kết quả:**
   - `total_cpqc`: Tổng CPQC của tất cả bản ghi thỏa bộ lọc
   - `total_mess_cmt`: Tổng Số_Mess_Cmt của tất cả bản ghi thỏa bộ lọc
   - `by_ten.total_cpqc`: Chi tiết CPQC theo từng tên
   - `by_ten.total_mess_cmt`: Chi tiết Số_Mess_Cmt theo từng tên
