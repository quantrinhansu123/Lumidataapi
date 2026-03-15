-- SQL để xóa cột team khỏi bảng users trong Supabase
-- CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn cột và tất cả dữ liệu trong cột đó
-- Hãy backup dữ liệu trước khi chạy!

-- Chạy trong Supabase SQL Editor

-- Bước 1: Xóa các constraint liên quan (nếu có)
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS fk_users_team CASCADE;

-- Bước 2: Xóa các index trên cột team (nếu có)
DROP INDEX IF EXISTS idx_users_team;
DROP INDEX IF EXISTS idx_users_team_lower;

-- Bước 3: Xóa cột team
ALTER TABLE public.users
DROP COLUMN IF EXISTS team CASCADE;

-- Kiểm tra kết quả (chạy sau khi xóa để xác nhận):
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'users' 
--   AND column_name = 'team';
-- (Nếu không có kết quả trả về nghĩa là cột đã được xóa thành công)
