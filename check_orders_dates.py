import sys
sys.path.insert(0, '.')
from main import get_supabase

s = get_supabase()
r = s.table('orders').select('id, created_at').limit(5).execute()
for row in r.data:
    print(f"{row['id']}: {row['created_at']}")
