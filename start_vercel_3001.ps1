# Start Vercel Dev Server on Port 3001

Write-Host "`n=== Starting Vercel Dev Server on Port 3001 ===" -ForegroundColor Green

# Set environment variables
$env:SUPABASE_URL = "https://gsjhsmxyxyjqovauyrp.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI"

Write-Host "Environment variables configured" -ForegroundColor Yellow
Write-Host "`nServer will start on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`nDebug Endpoint:" -ForegroundColor Magenta
Write-Host "  http://localhost:3001/api/debug-detail-matching?recordId=0000cb03-95e0-4683-bd48-326a048b4382" -ForegroundColor White
Write-Host "`nOther APIs:" -ForegroundColor Magenta
Write-Host "  - Calculate Detail Report: http://localhost:3001/api/calculate-detail-report-count" -ForegroundColor Gray
Write-Host "  - Calculate Order Count: http://localhost:3001/api/calculate-order-count" -ForegroundColor Gray
Write-Host "  - Employees: http://localhost:3001/api/employees" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "`n" -ForegroundColor White

# Change to orders-api directory
Set-Location $PSScriptRoot

# Start Vercel Dev
vercel dev --listen 3001
