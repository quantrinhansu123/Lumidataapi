-- Xóa cột team khỏi bảng users
-- CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn cột và tất cả dữ liệu trong cột đó

-- Kiểm tra xem cột có tồn tại không trước khi xóa
-- (PostgreSQL/Supabase)
ALTER TABLE public.users
DROP COLUMN IF EXISTS team;

-- Nếu có foreign key hoặc constraint liên quan, cần xóa trước:
-- ALTER TABLE public.users
-- DROP CONSTRAINT IF EXISTS fk_users_team;

-- Nếu có index trên cột team, cần xóa trước:
-- DROP INDEX IF EXISTS idx_users_team;

-- Sau đó mới xóa cột:
-- ALTER TABLE public.users
-- DROP COLUMN IF EXISTS team;
