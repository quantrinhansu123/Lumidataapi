# Test tính tổng doanh số nhân viên marketing
# Ví dụ: Nguyễn Đức Anh từ 1/2/2026 đến 10/2/2026

$baseUrl = "http://127.0.0.1:8000"

Write-Host "=== TEST TÍNH TỔNG DOANH SỐ NHÂN VIÊN MARKETING ===" -ForegroundColor Green

# Lấy tên nhân viên thực tế từ API
Write-Host "`n1. Lấy tên nhân viên thực tế..." -ForegroundColor Cyan
$today = Get-Date -Format "dd/MM/yyyy"
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/orders?created_at=$today&limit=5" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    if ($json.data.Count -gt 0) {
        $realName = $json.data[0].nhanvien_maketing
        Write-Host "Tên nhân viên: $realName" -ForegroundColor Yellow
    } else {
        $realName = "Nguyễn Đức Anh"
        Write-Host "Dùng tên mặc định: $realName" -ForegroundColor Yellow
    }
} catch {
    $realName = "Nguyễn Đức Anh"
    Write-Host "Dùng tên mặc định: $realName" -ForegroundColor Yellow
}

# Test tính tổng doanh số
Write-Host "`n2. Tính tổng doanh số..." -ForegroundColor Cyan
$body = @{
    filters = @{
        marketing_staff = $realName
    }
    date_range = @{
        from = "01/02/2026"
        to = "10/02/2026"
    }
    date_column = "order_date"
} | ConvertTo-Json -Depth 10

Write-Host "Request:" -ForegroundColor Gray
Write-Host $body

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/orders/statistics" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "`n✓ THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "`nKẾT QUẢ:" -ForegroundColor Yellow
    Write-Host "Tổng doanh số (total_amount_vnd): $($json.statistics.total_amount_vnd) VND" -ForegroundColor White
    Write-Host "Tổng doanh thu (total_vnd): $($json.statistics.total_revenue_vnd) VND" -ForegroundColor White
    Write-Host "Tổng số đơn: $($json.statistics.total_orders)" -ForegroundColor White
    Write-Host "Giá trị TB mỗi đơn: $($json.statistics.average_order_value) VND" -ForegroundColor White
    Write-Host "Số bản ghi phân tích: $($json.total_records_analyzed)" -ForegroundColor White
    
} catch {
    Write-Host "`n✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Gray
    }
}

Write-Host "`n=== HOÀN TẤT ===" -ForegroundColor Green
