# Start Vercel Dev Server for Detail Reports API

Write-Host "`n=== Starting Vercel Dev Server ===" -ForegroundColor Green

# Set environment variables
$env:SUPABASE_URL = "https://gsjhsmxyxyjqovauyrp.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamhzbXh5eGp5aXFvdmF1eXJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwODc0MCwiZXhwIjoyMDgzMzg0NzQwfQ.WY9eedddlBImDKnzUCrb-aftIckw_fJXyVJClFzQ8KI"

Write-Host "Environment variables set" -ForegroundColor Yellow
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop" -ForegroundColor Gray
Write-Host "`n" -ForegroundColor White

# Start Vercel Dev
vercel dev --listen 3000
