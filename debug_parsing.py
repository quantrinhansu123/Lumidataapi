"""Debug nhan_su parsing"""
# Simulate what the API receives
nhan_su_input = "Phạm Tiến Thành,Mạnh cường,Nguyễn Danh Nam"

# Parse it
ten_list = [name.strip() for name in nhan_su_input.split(",") if name.strip()]

print("Input:", nhan_su_input)
print("Parsed list:", ten_list)
print("Length:", len(ten_list))

for i, name in enumerate(ten_list):
    print(f"  [{i}] '{name}'")

# Now simulate filter comparison
test_data = [
    {"ten": "Phạm Tiến Thành", "ca": "Hết ca"},
    {"ten": "Mạnh Cường", "ca": "Hết ca"},
    {"ten": "Nguyễn Danh Nam", "ca": "Hết ca"},
]

print("\n" + "="*60)
print("Filter test:")
print("="*60)

allowed_values_lower = {v.lower(): v for v in ten_list}
print(f"Allowed (lowercase map): {allowed_values_lower}")

for row in test_data:
    name = row.get("ten")
    name_lower = str(name or "").strip().lower()
    match = name_lower in allowed_values_lower
    print(f"'{name}' → '{name_lower}' → match={match}")
