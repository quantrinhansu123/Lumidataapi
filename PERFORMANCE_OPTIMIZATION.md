# Tối ưu hiệu suất API - Order Count Calculation

## Vấn đề hiện tại

API tính toán `order_count` có thể chậm do:

### 1. **Fetch quá nhiều dữ liệu**
- Fetch TẤT CẢ orders trong date range (có thể hàng chục nghìn records)
- Batch size = 10,000 records mỗi lần
- Nếu có 100,000 orders trong date range → phải fetch 10 lần

### 2. **Logic matching phức tạp**
- Loop qua TẤT CẢ orders cho MỖI sales report
- Nếu có 100 sales reports và 10,000 orders → 1,000,000 lần so sánh
- Fuzzy name matching (remove accents, normalize) tốn CPU

### 3. **Không có index trên database**
- Các cột filter: `sale_staff`, `order_date`, `product`, `country`
- Nếu không có index → query chậm

### 4. **Debug logging**
- Log cho 10 orders đầu tiên mỗi sales report
- Console.log tốn thời gian

## Giải pháp đã áp dụng

### ✅ 1. Tối ưu query với date filter
- Chỉ fetch orders trong date range của sales reports
- Giảm đáng kể số lượng orders cần fetch

### ✅ 2. Tắt debug logging
- Chỉ log khi không tìm thấy matches (để debug)
- Giảm overhead của console.log

### ✅ 3. Batch processing
- Fetch orders theo batch 10,000 records
- Tránh timeout khi có quá nhiều dữ liệu

## Giải pháp đề xuất (chưa áp dụng)

### 🔧 1. Thêm index trên database
```sql
-- Thêm index trên các cột thường filter
CREATE INDEX idx_orders_sale_staff ON orders(sale_staff);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_product ON orders(product);
CREATE INDEX idx_orders_country ON orders(country);
CREATE INDEX idx_orders_date_staff ON orders(order_date, sale_staff);
```

### 🔧 2. Filter ở database level (nếu có thể)
- Thay vì fetch tất cả rồi filter trong memory
- Filter theo name, product, market ngay ở query
- **Lưu ý:** Khó vì logic matching phức tạp (fuzzy name, nhiều field variations)

### 🔧 3. Cache kết quả
- Cache kết quả tính toán cho các sales reports đã tính
- Chỉ tính lại khi orders thay đổi

### 🔧 4. Parallel processing
- Xử lý nhiều sales reports song song
- Sử dụng Promise.all() hoặc worker threads

### 🔧 5. Giảm batch size
- Thử giảm batch size xuống 5,000 hoặc 1,000
- Có thể nhanh hơn nếu network latency thấp

## Cách kiểm tra hiệu suất

### 1. Xem log trong console
```
Fetching orders... Date range: 2026-03-10 to 2026-03-10
Fetched 64 orders
[DEBUG] No matches found for sales report: name="...", date="...", checked 64 orders
```

### 2. Kiểm tra thời gian response
- Nếu > 10 giây → có vấn đề
- Nếu < 5 giây → OK
- Nếu < 1 giây → Tốt

### 3. Kiểm tra số lượng orders
- Nếu fetch > 10,000 orders → có thể chậm
- Nếu fetch < 1,000 orders → nhanh

## Khi nào API chậm?

1. **Tính theo ngày với nhiều records**
   - `?date=2026-03-10` → có thể có hàng trăm sales reports
   - Mỗi sales report phải loop qua tất cả orders

2. **Tính tất cả (`recalculateAll=true`)**
   - Tính cho tất cả sales reports
   - Rất chậm nếu có nhiều records

3. **Date range lớn**
   - Nếu sales reports trải dài nhiều tháng
   - Phải fetch orders trong toàn bộ date range

## Khuyến nghị

1. **Luôn dùng date filter** khi có thể
2. **Tính từng record** thay vì tính hàng loạt
3. **Thêm index** trên database
4. **Monitor performance** và optimize khi cần
