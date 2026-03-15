# Stop existing processes
Write-Host "Stopping existing servers..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*python*" -or $_.ProcessName -like "*uvicorn*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Set environment variables
$env:SUPABASE_URL = "https://gsjhsmxyxyjqovauyrp.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI"

Write-Host "`n=== Starting Servers ===" -ForegroundColor Green

# Start FastAPI server
Write-Host "`n[1/2] Starting FastAPI server on port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

# Start Vercel dev server
Write-Host "[2/2] Starting Vercel dev server on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:SUPABASE_URL = '$env:SUPABASE_URL'; `$env:SUPABASE_SERVICE_ROLE_KEY = '$env:SUPABASE_SERVICE_ROLE_KEY'; Write-Host '=== Vercel Dev Server ===' -ForegroundColor Green; Write-Host 'Port: 3000' -ForegroundColor Cyan; vercel dev --listen 3000"

Start-Sleep -Seconds 5

Write-Host "`n=== Server Links ===" -ForegroundColor Magenta
Write-Host "`nFastAPI Server:" -ForegroundColor Yellow
Write-Host "  - Orders: http://localhost:8000/orders" -ForegroundColor White
Write-Host "  - Sales Reports: http://localhost:8000/sales_reports" -ForegroundColor White
Write-Host "  - API Docs: http://localhost:8000/docs" -ForegroundColor White

Write-Host "`nVercel Dev Server:" -ForegroundColor Yellow
Write-Host "  - Employees API: http://localhost:3000/api/employees" -ForegroundColor Cyan
Write-Host "  - Calculate Order Count: http://localhost:3000/api/calculate-order-count" -ForegroundColor White
Write-Host "  - Calculate Detail Report: http://localhost:3000/api/calculate-detail-report-count" -ForegroundColor White

Write-Host "`n✅ Servers are starting in separate windows..." -ForegroundColor Green
Write-Host "Check the PowerShell windows for server logs." -ForegroundColor Gray
