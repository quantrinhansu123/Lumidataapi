-- SQL để thêm lại cột team vào bảng users trong Supabase
-- Chạy trong Supabase SQL Editor

-- Thêm cột team (kiểu TEXT để lưu tên team)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS team TEXT;

-- Hoặc nếu muốn giới hạn độ dài (ví dụ 100 ký tự):
-- ALTER TABLE public.users
-- ADD COLUMN IF NOT EXISTS team VARCHAR(100);

-- Thêm comment mô tả (PostgreSQL)
COMMENT ON COLUMN public.users.team IS 'Team của nhân viên';

-- Nếu muốn set giá trị mặc định:
-- ALTER TABLE public.users
-- ALTER COLUMN team SET DEFAULT NULL;

-- Nếu muốn thêm index cho cột này (để tìm kiếm nhanh hơn):
-- CREATE INDEX IF NOT EXISTS idx_users_team ON public.users(team);

-- Nếu muốn thêm index không phân biệt hoa thường:
-- CREATE INDEX IF NOT EXISTS idx_users_team_lower ON public.users(LOWER(team));
