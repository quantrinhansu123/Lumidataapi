# Test tính tổng doanh số theo Team
# Ví dụ: Team A từ 1/2/2026 đến 10/2/2026

$baseUrl = "http://127.0.0.1:8000"

Write-Host "=== TEST TÍNH TỔNG DOANH SỐ THEO TEAM ===" -ForegroundColor Green

# Test 1: 1 Team
Write-Host "`n1. Test với 1 Team" -ForegroundColor Cyan
$body1 = @{
    filters = @{
        team = "Team A"
    }
    date_range = @{
        from = "01/02/2026"
        to = "10/02/2026"
    }
    date_column = "order_date"
} | ConvertTo-Json -Depth 10

Write-Host "Request:" -ForegroundColor Gray
Write-Host $body1

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/orders/statistics" `
        -Method POST `
        -Body $body1 `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "`n✓ THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "Tổng doanh số: $($json.statistics.total_amount_vnd) VND" -ForegroundColor White
    Write-Host "Tổng số đơn: $($json.statistics.total_orders)" -ForegroundColor White
    
    if ($json.statistics.by_team.count) {
        Write-Host "`nChi tiết theo team:" -ForegroundColor Yellow
        $json.statistics.by_team.count.PSObject.Properties | ForEach-Object {
            $teamName = $_.Name
            $count = $_.Value
            $revenue = $json.statistics.by_team.revenue.$teamName
            Write-Host "  $teamName : $count đơn, $revenue VND" -ForegroundColor White
        }
    }
} catch {
    Write-Host "`n✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Nhiều Teams
Write-Host "`n2. Test với nhiều Teams (Team A, Team B, Team C)" -ForegroundColor Cyan
$body2 = @{
    filters = @{
        team = @("Team A", "Team B", "Team C")
    }
    date_range = @{
        from = "01/02/2026"
        to = "10/02/2026"
    }
    date_column = "order_date"
} | ConvertTo-Json -Depth 10

Write-Host "Request:" -ForegroundColor Gray
Write-Host $body2

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/orders/statistics" `
        -Method POST `
        -Body $body2 `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "`n✓ THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "Tổng doanh số tất cả teams: $($json.statistics.total_amount_vnd) VND" -ForegroundColor White
    Write-Host "Tổng số đơn: $($json.statistics.total_orders)" -ForegroundColor White
    
    if ($json.statistics.by_team.count) {
        Write-Host "`nChi tiết từng team:" -ForegroundColor Yellow
        $json.statistics.by_team.count.PSObject.Properties | ForEach-Object {
            $teamName = $_.Name
            $count = $_.Value
            $revenue = $json.statistics.by_team.revenue.$teamName
            Write-Host "  $teamName : $count đơn, $revenue VND" -ForegroundColor White
        }
    }
} catch {
    Write-Host "`n✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Kết hợp Team + Delivery Status
Write-Host "`n3. Test với Team + Delivery Status" -ForegroundColor Cyan
$body3 = @{
    filters = @{
        team = @("Team A", "Team B")
        delivery_status = "Delivered"
    }
    date_range = @{
        from = "01/02/2026"
        to = "10/02/2026"
    }
    date_column = "order_date"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/orders/statistics" `
        -Method POST `
        -Body $body3 `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "`n✓ THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "Tổng doanh số: $($json.statistics.total_amount_vnd) VND" -ForegroundColor White
    Write-Host "Tổng số đơn: $($json.statistics.total_orders)" -ForegroundColor White
} catch {
    Write-Host "`n✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== HOÀN TẤT ===" -ForegroundColor Green
