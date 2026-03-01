# Script test các endpoint statistics
# PowerShell script để test API

Write-Host "=== TEST STATISTICS API ===" -ForegroundColor Green

$baseUrl = "http://127.0.0.1:8000"

# Test 1: GET /orders/statistics với query params
Write-Host "`n1. Test GET /orders/statistics với created_at" -ForegroundColor Cyan
$today = Get-Date -Format "dd/MM/yyyy"
$url = "$baseUrl/orders/statistics?created_at=$today"
Write-Host "URL: $url" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Thành công!" -ForegroundColor Green
    Write-Host "Tổng số đơn: $($json.statistics.total_orders)" -ForegroundColor White
    Write-Host "Tổng doanh thu: $($json.statistics.total_revenue_vnd) VND" -ForegroundColor White
    Write-Host "Số bản ghi phân tích: $($json.total_records_analyzed)" -ForegroundColor White
} catch {
    Write-Host "✗ Lỗi: $_" -ForegroundColor Red
}

# Test 2: POST /orders/statistics với body JSON
Write-Host "`n2. Test POST /orders/statistics với filter" -ForegroundColor Cyan
$body = @{
    filters = @{
        delivery_status = "Delivered"
    }
    date_range = @{
        from = $today
        to = $today
    }
    date_column = "created_at"
} | ConvertTo-Json

$url = "$baseUrl/orders/statistics"
Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Thành công!" -ForegroundColor Green
    Write-Host "Tổng số đơn: $($json.statistics.total_orders)" -ForegroundColor White
    Write-Host "Tổng doanh thu: $($json.statistics.total_revenue_vnd) VND" -ForegroundColor White
    
    # Hiển thị thống kê theo delivery_status
    if ($json.statistics.by_delivery_status.count) {
        Write-Host "`nThống kê theo delivery_status:" -ForegroundColor Yellow
        $json.statistics.by_delivery_status.count.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value) đơn ($($json.statistics.by_delivery_status.percentage.$($_.Name))%)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "✗ Lỗi: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Gray
}

# Test 3: POST với filter mảng (multiple teams)
Write-Host "`n3. Test POST /orders/statistics với filter mảng" -ForegroundColor Cyan
$body = @{
    filters = @{
        team = @("Team A", "Team B")
    }
} | ConvertTo-Json

Write-Host "Body: $body" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Thành công!" -ForegroundColor Green
    Write-Host "Tổng số đơn: $($json.statistics.total_orders)" -ForegroundColor White
    
    # Hiển thị thống kê theo team
    if ($json.statistics.by_team.count) {
        Write-Host "`nThống kê theo team:" -ForegroundColor Yellow
        $json.statistics.by_team.count.PSObject.Properties | ForEach-Object {
            $teamName = $_.Name
            $count = $_.Value
            $revenue = $json.statistics.by_team.revenue.$teamName
            Write-Host "  $teamName : $count đơn, Doanh thu: $revenue VND" -ForegroundColor White
        }
    }
} catch {
    Write-Host "✗ Lỗi: $_" -ForegroundColor Red
}

Write-Host "`n=== HOÀN TẤT ===" -ForegroundColor Green
