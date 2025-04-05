import os

# רשימת הטבלאות לפי סדר התלות
table_order = [
    "address",
    "lab",
    "department",
    "medication",
    "person",
    "patient",
    "medical_staff",
    "nurse",
    "research_doctor",
    "attending_doctor",
    "treatment",
    "staff_shift",
    "treatment_medication"
]

# שם הקובץ המאוחד
output_file = "all_inserts_ordered.sql"

# מיקום הסקריפט
current_dir = os.path.dirname(os.path.abspath(__file__))

# פתח קובץ יעד לכתיבה
with open(os.path.join(current_dir, output_file), "w", encoding="utf-8") as outfile:
    for table in table_order:
        filename = f"{table}_data.sql"
        filepath = os.path.join(current_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as infile:
                content = infile.read()
                outfile.write(f"-- Start of: {filename}\n")
                outfile.write(content)
                outfile.write(f"\n-- End of: {filename}\n\n")
        else:
            print(f"⚠️ Skipped: {filename} (not found)")

print(f"Finished merging SQL files into {output_file}")
