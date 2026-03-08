# Hướng dẫn Pagination - Load hết dữ liệu

API hỗ trợ pagination để load hết dữ liệu qua nhiều lần gọi.

## Cách sử dụng

### 1. Cursor-based Pagination (Khuyến nghị)

Sử dụng `limit` và `after_id` để load từng batch dữ liệu.

**Lần gọi đầu tiên:**
```
GET /orders?limit=1000&from_date=01/01/2026&to_date=31/01/2026&team=HCM
```

**Response:**
```json
{
  "data": [...],
  "count": 1000,
  "next_after_id": "abc-123-def-456",
  "has_more": true
}
```

**Lần gọi tiếp theo:**
```
GET /orders?limit=1000&after_id=abc-123-def-456&from_date=01/01/2026&to_date=31/01/2026&team=HCM
```

**Tiếp tục cho đến khi `next_after_id` là `null`:**

```javascript
// Ví dụ JavaScript
async function loadAllOrders(filters) {
  let allData = [];
  let afterId = null;
  let hasMore = true;
  
  while (hasMore) {
    const params = new URLSearchParams({
      limit: '1000',
      ...filters
    });
    
    if (afterId) {
      params.append('after_id', afterId);
    }
    
    const response = await fetch(`/orders?${params}`);
    const result = await response.json();
    
    allData = allData.concat(result.data);
    afterId = result.next_after_id;
    hasMore = result.next_after_id !== null;
    
    console.log(`Loaded ${result.count} records. Total: ${allData.length}`);
  }
  
  return allData;
}

// Sử dụng
const filters = {
  from_date: '01/01/2026',
  to_date: '31/01/2026',
  team: 'HCM'
};

const allOrders = await loadAllOrders(filters);
```

### 2. Offset-based Pagination

Sử dụng `limit` và `offset` (ít khuyến nghị hơn vì có thể bỏ sót dữ liệu khi có thay đổi).

**Lần gọi đầu tiên:**
```
GET /orders?limit=1000&offset=0&from_date=01/01/2026&to_date=31/01/2026&team=HCM
```

**Lần gọi tiếp theo:**
```
GET /orders?limit=1000&offset=1000&from_date=01/01/2026&to_date=31/01/2026&team=HCM
```

**Tiếp tục cho đến khi `count < limit`:**

```javascript
async function loadAllOrdersWithOffset(filters) {
  let allData = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...filters
    });
    
    const response = await fetch(`/orders?${params}`);
    const result = await response.json();
    
    allData = allData.concat(result.data);
    hasMore = result.count === limit;
    offset += limit;
    
    console.log(`Loaded ${result.count} records. Total: ${allData.length}`);
  }
  
  return allData;
}
```

## Tham số

| Tham số | Type | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `limit` | int | Số bản ghi tối đa mỗi lần (1-10000) | `limit=1000` |
| `offset` | int | Vị trí bắt đầu (dùng với offset-based) | `offset=0` |
| `after_id` | string | ID bản ghi cuối trang trước (dùng với cursor-based) | `after_id=abc-123` |

## Response

```json
{
  "data": [...],
  "count": 1000,
  "next_after_id": "abc-123-def-456",
  "has_more": true
}
```

- `data`: Mảng dữ liệu
- `count`: Số bản ghi trong response này
- `next_after_id`: ID của bản ghi cuối cùng (dùng cho lần gọi tiếp theo). `null` nếu không còn data
- `has_more`: `true` nếu có thể còn data (chỉ có khi dùng `limit`)

## Lưu ý

1. **Cursor-based (after_id) là cách tốt nhất** vì:
   - Không bỏ sót dữ liệu khi có thay đổi trong DB
   - Hiệu quả hơn với dữ liệu lớn
   - Đảm bảo thứ tự nhất quán

2. **Offset-based** có thể bỏ sót dữ liệu nếu:
   - Có dữ liệu mới được thêm vào trong lúc pagination
   - Có dữ liệu bị xóa trong lúc pagination

3. **Giới hạn**: Mỗi request tối đa 10,000 bản ghi. Để load hết, dùng pagination.

4. **Filter**: Tất cả các filter sẽ được áp dụng nhất quán qua các lần gọi.

## Ví dụ đầy đủ

```python
import requests

def load_all_orders(base_url, filters, limit=1000):
    """Load tất cả orders với pagination"""
    all_data = []
    after_id = None
    
    while True:
        params = {
            'limit': limit,
            **filters
        }
        
        if after_id:
            params['after_id'] = after_id
        
        response = requests.get(f"{base_url}/orders", params=params)
        result = response.json()
        
        all_data.extend(result['data'])
        print(f"Loaded {result['count']} records. Total: {len(all_data)}")
        
        if not result.get('next_after_id'):
            break
        
        after_id = result['next_after_id']
    
    return all_data

# Sử dụng
filters = {
    'from_date': '01/01/2026',
    'to_date': '31/01/2026',
    'team': 'HCM'
}

all_orders = load_all_orders('http://localhost:8000', filters)
print(f"Total orders: {len(all_orders)}")
```
