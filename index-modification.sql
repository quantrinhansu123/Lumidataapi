-- Index cho bảng orders, dùng cho API query (filter).
-- Chỉ tạo index nếu chưa tồn tại (CREATE INDEX IF NOT EXISTS).
-- Chạy trong Supabase SQL Editor.

-- Cột timestamp (lọc theo ngày: gte/lte)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON public.orders (updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_time ON public.orders (order_time);
CREATE INDEX IF NOT EXISTS idx_orders_time_dayon ON public.orders (time_dayon);

-- Cột date (lọc eq)
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders (order_date);
CREATE INDEX IF NOT EXISTS idx_orders_postponed_date ON public.orders (postponed_date);
CREATE INDEX IF NOT EXISTS idx_orders_accounting_check_date ON public.orders (accounting_check_date);
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery_date ON public.orders (estimated_delivery_date);

-- Cột text hay dùng để filter (city, state, country, ...)
CREATE INDEX IF NOT EXISTS idx_orders_city ON public.orders (city);
CREATE INDEX IF NOT EXISTS idx_orders_state ON public.orders (state);
CREATE INDEX IF NOT EXISTS idx_orders_country ON public.orders (country);
CREATE INDEX IF NOT EXISTS idx_orders_marketing_staff ON public.orders (marketing_staff);
CREATE INDEX IF NOT EXISTS idx_orders_sale_staff ON public.orders (sale_staff);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON public.orders (delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders (order_code);
