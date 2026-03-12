# Test script cho Detail Reports API

$baseUrl = "http://localhost:3000"
$detailReportsUrl = "http://localhost:8000/detail_reports"

Write-Host "`n=== Test Detail Reports Calculation API ===" -ForegroundColor Cyan

# 1. Lấy một record từ detail_reports
Write-Host "`n1. Lấy một record từ detail_reports..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$detailReportsUrl?limit=1" -Method Get
    if ($response.data -and $response.data.Count -gt 0) {
        $record = $response.data[0]
        $recordId = $record.id
        Write-Host "✅ Tìm thấy record:" -ForegroundColor Green
        Write-Host "   ID: $recordId" -ForegroundColor White
        Write-Host "   Tên: $($record.Tên -or $record.ten -or $record.name)" -ForegroundColor White
        Write-Host "   Ngày: $($record.Ngày -or $record.ngay -or $record.date)" -ForegroundColor White
        Write-Host "   Ca: $($record.ca -or $record.shift)" -ForegroundColor White
        
        # 2. Test tính toán cho record này
        Write-Host "`n2. Tính toán order_count cho record này..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        try {
            $calcUrl = "$baseUrl/api/calculate-detail-report-count?recordId=$recordId"
            Write-Host "   URL: $calcUrl" -ForegroundColor Gray
            $calcResponse = Invoke-RestMethod -Uri $calcUrl -Method Get
            Write-Host "✅ Kết quả tính toán:" -ForegroundColor Green
            $calcResponse | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Host "❌ Lỗi tính toán: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Đảm bảo server đang chạy trên port 3000" -ForegroundColor Yellow
        }
        
        # 3. Test debug matching
        Write-Host "`n3. Debug matching cho record này..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        try {
            $debugUrl = "$baseUrl/api/debug-detail-matching?recordId=$recordId"
            Write-Host "   URL: $debugUrl" -ForegroundColor Gray
            $debugResponse = Invoke-RestMethod -Uri $debugUrl -Method Get
            Write-Host "✅ Kết quả debug:" -ForegroundColor Green
            Write-Host "   Tổng orders đã kiểm tra: $($debugResponse.matching_summary.total_orders_checked)" -ForegroundColor White
            Write-Host "   Số orders match: $($debugResponse.matching_summary.matches)" -ForegroundColor White
            Write-Host "   Số orders không match: $($debugResponse.matching_summary.non_matches)" -ForegroundColor White
        } catch {
            Write-Host "❌ Lỗi debug: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Không tìm thấy record nào trong detail_reports" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Lỗi lấy detail_reports: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Đảm bảo FastAPI đang chạy trên port 8000" -ForegroundColor Yellow
}

# 4. Test tính toán theo ngày
Write-Host "`n4. Test tính toán theo ngày (2026-03-08)..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    $dateUrl = "$baseUrl/api/calculate-detail-report-count?date=2026-03-08"
    Write-Host "   URL: $dateUrl" -ForegroundColor Gray
    $dateResponse = Invoke-RestMethod -Uri $dateUrl -Method Get
    Write-Host "✅ Kết quả:" -ForegroundColor Green
    Write-Host "   Updated: $($dateResponse.updated)" -ForegroundColor White
    Write-Host "   Total: $($dateResponse.total)" -ForegroundColor White
    if ($dateResponse.data -and $dateResponse.data.Count -gt 0) {
        Write-Host "   Record đầu tiên:" -ForegroundColor Cyan
        $dateResponse.data[0] | ConvertTo-Json -Depth 3 | Write-Host
    }
} catch {
    Write-Host "❌ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test hoàn tất ===" -ForegroundColor Cyan
Write-Host "`n📋 Các link để test thủ công:" -ForegroundColor Yellow
Write-Host "1. Tính toán: http://localhost:3000/api/calculate-detail-report-count?date=2026-03-08" -ForegroundColor White
Write-Host "2. Debug: http://localhost:3000/api/debug-detail-matching?recordId=YOUR_RECORD_ID" -ForegroundColor White
