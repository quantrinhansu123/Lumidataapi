-- Thêm cột link_anh vào bảng users
-- Cột này dùng để lưu link ảnh của nhân viên

ALTER TABLE users
ADD COLUMN IF NOT EXISTS link_anh TEXT;

-- Hoặc nếu muốn giới hạn độ dài (ví dụ 500 ký tự):
-- ALTER TABLE users
-- ADD COLUMN IF NOT EXISTS link_anh VARCHAR(500);

-- Thêm comment cho cột (nếu database hỗ trợ)
COMMENT ON COLUMN users.link_anh IS 'Link ảnh của nhân viên';

-- Nếu muốn set giá trị mặc định (ví dụ NULL hoặc empty string):
-- ALTER TABLE users
-- ADD COLUMN IF NOT EXISTS link_anh TEXT DEFAULT NULL;
