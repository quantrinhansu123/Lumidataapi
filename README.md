# Orders API

API Python (FastAPI) query dữ liệu từ bảng `orders` trên Subabase, lọc theo query params GET.

## Yêu cầu

- **Python 3.10+** (nếu chưa cài: tải tại [python.org](https://www.python.org/downloads/), khi cài nhớ chọn **"Add Python to PATH"**).

## Cài đặt

```bash
cd orders-api
pip install -r requirements.txt
```

Trên Windows nếu lệnh `pip` không nhận, thử:

```powershell
python -m pip install -r requirements.txt
```

## Chạy

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Hoặc:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Mở **http://127.0.0.1:8000/docs** để xem Swagger.

## Sử dụng

- **GET /orders** – Lấy danh sách orders, có thể truyền bất kỳ tham số nào trùng tên cột trong bảng để lọc.

### Ví dụ URL

| Mục đích | URL |
|----------|-----|
| Tất cả bản ghi có city = Ewa Beach | `http://localhost:8000/orders?city=Ewa%20Beach` |
| Lọc theo ngày tạo và thành phố | `http://localhost:8000/orders?created_at=22/12/2026&city=Carson` |
| Lọc theo ngày đơn và quốc gia | `http://localhost:8000/orders?order_date=01/01/2026&country=US` |
| Giới hạn 50 bản ghi, offset 0 | `http://localhost:8000/orders?limit=50&offset=0` |
| City Ewa Beach, tối đa 1000 bản ghi | `http://localhost:8000/orders?city=Ewa%20Beach&limit=1000` |

### Lưu ý

- Cột **date** (vd: `order_date`, `postponed_date`): dùng định dạng `dd/mm/yyyy` hoặc `yyyy-mm-dd`.
- Cột **timestamp** (vd: `created_at`, `updated_at`, `order_time`): dùng `dd/mm/yyyy` – API sẽ lọc cả ngày đó (từ 00:00 đến 23:59).
- Cột text/số khác: so khớp chính xác giá trị. Khoảng trắng trong URL dùng `%20` (vd: `Ewa%20Beach`).
- Mặc định `limit=100`, tối đa `limit=1000`. Dùng `offset` để phân trang.

### Biến môi trường (tùy chọn)

Đã có giá trị mặc định trong code. Có thể ghi đè bằng file `.env`:

- `SUPABASE_URL`
- `SUPABASE_KEY`
