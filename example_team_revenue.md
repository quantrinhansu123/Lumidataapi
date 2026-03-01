# Ví dụ: Tính tổng doanh số theo Team

## Yêu cầu
Tính tổng doanh số của một Team (hoặc nhiều Team) theo `total_amount_vnd` từ ngày 1/2/2026 đến 10/2/2026, lấy từ cột `order_date`.

## Frontend (FE) - JavaScript/TypeScript

### Cách 1: Tính tổng doanh số của 1 Team

```javascript
async function getTeamRevenue(teamName) {
  const url = 'http://127.0.0.1:8000/orders/statistics';
  
  const requestBody = {
    filters: {
      team: teamName  // Ví dụ: "Team A"
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
    
    // Lấy thống kê chi tiết theo team
    const teamStats = data.statistics.by_team;
    
    console.log('Tổng doanh số:', totalRevenue, 'VND');
    console.log('Tổng số đơn:', totalOrders);
    console.log('Chi tiết theo team:', teamStats);
    
    return {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      teamStats: teamStats,
      statistics: data.statistics
    };
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
}

// Gọi hàm
getTeamRevenue("Team A");
```

### Cách 2: Tính tổng doanh số của NHIỀU Team (OR condition)

```javascript
async function getMultipleTeamsRevenue(teamNames) {
  const url = 'http://127.0.0.1:8000/orders/statistics';
  
  const requestBody = {
    filters: {
      team: teamNames  // Mảng: ["Team A", "Team B", "Team C"]
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
    
    // Tổng doanh số của tất cả teams
    const totalRevenue = data.statistics.total_amount_vnd;
    
    // Chi tiết từng team
    const teamDetails = data.statistics.by_team;
    
    console.log('Tổng doanh số tất cả teams:', totalRevenue, 'VND');
    console.log('Chi tiết từng team:', teamDetails);
    
    // Hiển thị chi tiết từng team
    Object.keys(teamDetails.count).forEach(teamName => {
      console.log(`${teamName}: ${teamDetails.count[teamName]} đơn, ${teamDetails.revenue[teamName]} VND`);
    });
    
    return {
      totalRevenue: totalRevenue,
      teamDetails: teamDetails,
      statistics: data.statistics
    };
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
}

// Gọi hàm với nhiều teams
getMultipleTeamsRevenue(["Team A", "Team B", "Team C"]);
```

### Cách 3: React Hook cho Team Revenue

```jsx
import { useState, useEffect } from 'react';

function useTeamRevenue(teams, fromDate, toDate) {
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
              // Nếu teams là mảng -> nhiều teams, nếu là string -> 1 team
              team: Array.isArray(teams) ? teams : [teams]
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

    if (teams && fromDate && toDate) {
      fetchData();
    }
  }, [teams, fromDate, toDate]);

  return {
    data,
    loading,
    error,
    totalRevenue: data?.statistics?.total_amount_vnd || 0,
    totalOrders: data?.statistics?.total_orders || 0,
    teamDetails: data?.statistics?.by_team || {}
  };
}

// Sử dụng trong component
function TeamRevenueDashboard() {
  // Ví dụ 1: 1 team
  const { totalRevenue, totalOrders, teamDetails } = useTeamRevenue(
    "Team A",
    "01/02/2026",
    "10/02/2026"
  );

  // Ví dụ 2: Nhiều teams
  // const { totalRevenue, totalOrders, teamDetails } = useTeamRevenue(
  //   ["Team A", "Team B"],
  //   "01/02/2026",
  //   "10/02/2026"
  // );

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  return (
    <div>
      <h2>Doanh số theo Team</h2>
      <p>Tổng doanh số: {totalRevenue.toLocaleString('vi-VN')} VND</p>
      <p>Tổng số đơn: {totalOrders}</p>
      
      <h3>Chi tiết từng Team:</h3>
      {Object.keys(teamDetails.count || {}).map(teamName => (
        <div key={teamName}>
          <strong>{teamName}:</strong> {teamDetails.count[teamName]} đơn, 
          {teamDetails.revenue[teamName]?.toLocaleString('vi-VN')} VND
        </div>
      ))}
    </div>
  );
}
```

### Cách 4: So sánh nhiều Teams

```javascript
async function compareTeams(teamNames, fromDate, toDate) {
  const url = 'http://127.0.0.1:8000/orders/statistics';
  
  const requestBody = {
    filters: {
      team: teamNames  // ["Team A", "Team B", "Team C"]
    },
    date_range: {
      from: fromDate,
      to: toDate
    },
    date_column: "order_date"
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  const teamStats = data.statistics.by_team;
  
  // Sắp xếp teams theo doanh số giảm dần
  const sortedTeams = Object.keys(teamStats.revenue)
    .map(team => ({
      name: team,
      count: teamStats.count[team],
      revenue: teamStats.revenue[team]
    }))
    .sort((a, b) => b.revenue - a.revenue);
  
  return sortedTeams;
}

// Sử dụng
compareTeams(["Team A", "Team B", "Team C"], "01/02/2026", "10/02/2026")
  .then(teams => {
    console.log('Bảng xếp hạng teams:');
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.name}: ${team.revenue} VND (${team.count} đơn)`);
    });
  });
```

## Backend (BE) - Xử lý request

### Request nhận được:

**Ví dụ 1: 1 Team**
```json
POST /orders/statistics
{
  "filters": {
    "team": "Team A"
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "date_column": "order_date"
}
```

**Ví dụ 2: Nhiều Teams**
```json
POST /orders/statistics
{
  "filters": {
    "team": ["Team A", "Team B", "Team C"]
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
   
   **Nếu team là string (1 team):**
   ```python
   stats_query = supabase.table("orders").select(...)
       .eq("team", "Team A")
       .gte("order_date", "2026-02-01")
       .lte("order_date", "2026-02-10")
   ```
   
   **Nếu team là mảng (nhiều teams - OR condition):**
   ```python
   stats_query = supabase.table("orders").select(...)
       .in_("team", ["Team A", "Team B", "Team C"])
       .gte("order_date", "2026-02-01")
       .lte("order_date", "2026-02-10")
   ```

3. **Tính toán:**
   - Lấy tất cả orders thỏa điều kiện
   - Tính tổng `total_amount_vnd` cho tất cả teams
   - Tính chi tiết từng team trong `by_team`

### Response trả về:

```json
{
  "statistics": {
    "total_orders": 50,
    "total_revenue_vnd": 25000000.0,
    "total_amount_vnd": 26000000.0,  // ← Tổng doanh số tất cả teams
    "average_order_value": 500000.0,
    "by_team": {
      "count": {
        "Team A": 20,
        "Team B": 18,
        "Team C": 12
      },
      "revenue": {
        "Team A": 10400000.0,  // ← Doanh số Team A
        "Team B": 9360000.0,    // ← Doanh số Team B
        "Team C": 6240000.0     // ← Doanh số Team C
      }
    },
    ...
  },
  "filters_applied": {
    "team": ["Team A", "Team B", "Team C"]
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "total_records_analyzed": 50
}
```

## Test với cURL

### Test 1 Team:
```bash
curl -X POST http://127.0.0.1:8000/orders/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "team": "Team A"
    },
    "date_range": {
      "from": "01/02/2026",
      "to": "10/02/2026"
    },
    "date_column": "order_date"
  }'
```

### Test nhiều Teams:
```bash
curl -X POST http://127.0.0.1:8000/orders/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "team": ["Team A", "Team B", "Team C"]
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
# Test 1 Team
$body = @{
    filters = @{
        team = "Team A"
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
Write-Host "Chi tiết teams:"
$json.statistics.by_team.count.PSObject.Properties | ForEach-Object {
    $teamName = $_.Name
    Write-Host "  $teamName : $($_.Value) đơn, $($json.statistics.by_team.revenue.$teamName) VND"
}

# Test nhiều Teams
$body = @{
    filters = @{
        team = @("Team A", "Team B", "Team C")
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
Write-Host "Tổng doanh số tất cả teams: $($json.statistics.total_amount_vnd) VND"
```

## Kết hợp filter Team với các filter khác

```javascript
// Filter theo Team + Delivery Status + Date Range
const requestBody = {
  filters: {
    team: ["Team A", "Team B"],
    delivery_status: "Delivered",
    payment_status: "Paid"
  },
  date_range: {
    from: "01/02/2026",
    to: "10/02/2026"
  },
  date_column: "order_date"
};
```

## Lưu ý

1. **1 Team:** Truyền string `"Team A"` → Lọc chính xác team đó
2. **Nhiều Teams:** Truyền mảng `["Team A", "Team B"]` → Lọc OR (team A HOẶC team B)
3. **Tên team:** Phải khớp chính xác với dữ liệu trong database
4. **Kết quả:**
   - `total_amount_vnd`: Tổng doanh số của tất cả teams được filter
   - `by_team.revenue`: Chi tiết doanh số từng team
   - `by_team.count`: Số đơn hàng từng team
