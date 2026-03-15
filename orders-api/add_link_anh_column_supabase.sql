-- SQL để thêm cột link_anh vào bảng users trong Supabase
-- Chạy trong Supabase SQL Editor

-- Thêm cột link_anh (kiểu TEXT để lưu URL ảnh)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS link_anh TEXT;

-- Thêm comment mô tả (PostgreSQL)
COMMENT ON COLUMN public.users.link_anh IS 'Link ảnh của nhân viên';

-- Nếu muốn thêm constraint NOT NULL sau khi đã có dữ liệu:
-- ALTER TABLE public.users
-- ALTER COLUMN link_anh SET NOT NULL;

-- Nếu muốn thêm index cho cột này (nếu cần tìm kiếm):
-- CREATE INDEX IF NOT EXISTS idx_users_link_anh ON public.users(link_anh);
