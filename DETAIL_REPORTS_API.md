# Detail Reports API - Hướng dẫn sử dụng

API query và tính toán thống kê từ bảng `detail_reports`.

## Các trường trong bảng

- **Tên** (ten/name) - Tên nhân viên
- **Ngày** (ngay/date) - Ngày báo cáo
- **ca** (ca/shift) - Ca làm việc
- **Sản_phẩm** (san_pham/product) - Sản phẩm
- **Thị_trường** (thi_truong/market) - Thị trường
- **Team** (team) - Đội nhóm
- **CPQC** (cpqc) - Chất lượng sản phẩm
- **Số_Mess_Cmt** (so_mess_cmt) - Số lượng message/comment

## Endpoints

### 1. GET `/detail_reports`

Lấy danh sách detail_reports với bộ lọc qua query params.

**Request:**
```
GET /detail_reports?team=Team%20A&ngay=01/02/2026&ca=Sáng
```

**Response:**
```json
{
  "data": [
    {
      "id": "123",
      "ten": "Nguyễn Văn A",
      "ngay": "2026-02-01",
      "ca": "Sáng",
      "san_pham": "Sản phẩm A",
      "thi_truong": "Thị trường A",
      "team": "Team A",
      "cpqc": "Đạt",
      "so_mess_cmt": 50
    }
  ],
  "count": 1,
  "next_after_id": "123"
}
```

### 2. POST `/detail_reports/statistics`

Tính toán thống kê với bộ lọc phức tạp qua body JSON.

**Request:**
```json
POST /detail_reports/statistics
Content-Type: application/json

{
  "filters": {
    "team": ["Team A", "Team B"],
    "ten": "Nguyễn Văn A",
    "ca": "Sáng"
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "date_column": "ngay"
}
```

**Response:**
```json
{
  "statistics": {
    "total_count": 186,
    "total_cpqc": 2500.0,
    "total_mess_cmt": 5000.0,
    "average_mess_cmt": 50.0,
    "gia_mess": 0.5,
    "by_ten": {
      "count": {
        "Nguyễn Văn A": 30,
        "Trần Thị B": 25
      },
      "total_mess_cmt": {
        "Nguyễn Văn A": 1500.0,
        "Trần Thị B": 1250.0
      },
      "total_cpqc": {
        "Nguyễn Văn A": 800.0,
        "Trần Thị B": 650.0
      },
      "gia_mess": {
        "Nguyễn Văn A": 0.533333,
        "Trần Thị B": 0.52
      },
      "total_vnd": {
        "Nguyễn Văn A": 12000000.0,
        "Trần Thị B": 10000000.0
      },
      "total_sodon": {
        "Nguyễn Văn A": 45,
        "Trần Thị B": 38
      }
    },
    "by_ngay": {
      "2026-02-01": {
        "count": 35,
        "total_mess_cmt": 1750.0,
        "total_cpqc": 900.0,
        "gia_mess": 0.514286,
        "by_ten": {
          "count": {
            "Nguyễn Văn A": 12,
            "Trần Thị B": 10
          },
          "total_mess_cmt": {
            "Nguyễn Văn A": 620.0,
            "Trần Thị B": 500.0
          },
          "total_cpqc": {
            "Nguyễn Văn A": 320.0,
            "Trần Thị B": 260.0
          },
          "gia_mess": {
            "Nguyễn Văn A": 0.516129,
            "Trần Thị B": 0.52
          }
        }
      },
      "2026-02-02": {
        "count": 40,
        "total_mess_cmt": 2000.0,
        "total_cpqc": 1000.0,
        "gia_mess": 0.5,
        "by_ten": {
          "count": {},
          "total_mess_cmt": {},
          "total_cpqc": {},
          "gia_mess": {}
        }
      }
    }
  },
  "filters_applied": {
    "team": ["Team A", "Team B"],
    "ten": "Nguyễn Văn A",
    "ca": "Sáng"
  },
  "date_range": {
    "from": "01/02/2026",
    "to": "10/02/2026"
  },
  "total_records_analyzed": 100
}
```

### 3. GET `/detail_reports/statistics`

Tính toán thống kê với bộ lọc qua query parameters.

**Request:**
```
GET /detail_reports/statistics?team=Team%20A&ngay=01/02/2026&ca=Sáng
```

**Response:** Tương tự như POST endpoint

## Ví dụ sử dụng

### Ví dụ 1: Lấy danh sách theo team và ngày

```javascript
const response = await fetch('http://127.0.0.1:8000/detail_reports?team=Team%20A&ngay=01/02/2026');
const data = await response.json();
console.log(data.data);
```

### Ví dụ 2: Tính tổng số message/comment theo team

```javascript
const response = await fetch('http://127.0.0.1:8000/detail_reports/statistics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filters: {
      team: ["Team A", "Team B"]
    },
    date_range: {
      from: "01/02/2026",
      to: "10/02/2026"
    },
    date_column: "ngay"
  })
});

const data = await response.json();
console.log('Tổng số message/comment:', data.statistics.total_mess_cmt);
console.log('Chi tiết theo team:', data.statistics.by_team);
```

### Ví dụ 3: Thống kê theo ca làm việc

```javascript
const response = await fetch('http://127.0.0.1:8000/detail_reports/statistics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filters: {
      ca: ["Sáng", "Chiều"]
    },
    date_range: {
      from: "01/02/2026",
      to: "28/02/2026"
    },
    date_column: "ngay"
  })
});

const data = await response.json();
console.log('Thống kê theo ca:', data.statistics.by_ca);
```

### Ví dụ 4: Thống kê theo nhân viên (ten)

```javascript
const response = await fetch('http://127.0.0.1:8000/detail_reports/statistics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filters: {
      ten: "Nguyễn Văn A"
    },
    date_range: {
      from: "01/02/2026",
      to: "10/02/2026"
    },
    date_column: "ngay"
  })
});

const data = await response.json();
const staffStats = data.statistics.by_ten;
console.log('Số bản ghi:', staffStats.count["Nguyễn Văn A"]);
console.log('Tổng message/comment:', staffStats.total_mess_cmt["Nguyễn Văn A"]);
```

## Test với cURL

### Lấy danh sách:
```bash
curl "http://127.0.0.1:8000/detail_reports?team=Team%20A&ngay=01/02/2026"
```

### Tính thống kê:
```bash
curl -X POST http://127.0.0.1:8000/detail_reports/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "team": ["Team A", "Team B"],
      "ca": "Sáng"
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
# Lấy danh sách
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/detail_reports?team=Team%20A" -UseBasicParsing
$json = $response.Content | ConvertFrom-Json
$json.data

# Tính thống kê
$body = @{
    filters = @{
        team = @("Team A", "Team B")
        ca = "Sáng"
    }
    date_range = @{
        from = "01/02/2026"
        to = "10/02/2026"
    }
    date_column = "ngay"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/detail_reports/statistics" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$json = $response.Content | ConvertFrom-Json
Write-Host "Tổng số message/comment: $($json.statistics.total_mess_cmt)"
Write-Host "Chi tiết theo team:"
$json.statistics.by_team.count.PSObject.Properties | ForEach-Object {
    $teamName = $_.Name
    Write-Host "  $teamName : $($_.Value) bản ghi, $($json.statistics.by_team.total_mess_cmt.$teamName) message/comment"
}
```

## Thống kê được tính

1. **Tổng quan:**
   - `total_records`: Tổng số bản ghi
   - `total_mess_cmt`: Tổng số message/comment
   - `average_mess_cmt`: Trung bình message/comment mỗi bản ghi

2. **Thống kê theo nhóm:**
  - `by_ten`: Count, total_mess_cmt, total_cpqc, gia_mess, total_vnd và total_sodon theo tên nhân viên
  - `by_ngay`: Mỗi ngày gồm count, total_mess_cmt, total_cpqc, gia_mess và breakdown con `by_ten`

## Lưu ý

- Tên cột có thể là: `ten` hoặc `name`, `ngay` hoặc `date`, `ca` hoặc `shift`, v.v.
- Date range chỉ áp dụng cho cột `ngay` (date type)
- Hỗ trợ filter mảng cho OR condition (ví dụ: `team: ["A", "B"]`)
- Giới hạn tối đa 50,000 bản ghi để tránh quá tải
