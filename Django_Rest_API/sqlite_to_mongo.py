import sqlite3
from pymongo import MongoClient

# === 1. SQLite connect ===
sqlite_conn = sqlite3.connect(
    "/Users/gaurav/Desktop/Python Project/TripForge/Django_Rest_API/travels/db.sqlite3"
)
cursor = sqlite_conn.cursor()

# === 2. MongoDB Atlas connect ===
client = MongoClient("mongodb+srv://gpsgauravgps:8650093027@trip.g2ps4ea.mongodb.net/?retryWrites=true&w=majority&appName=trip")
db = client["tripforge"]

# === 3. Get all SQLite tables ===
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# === 4. Loop through all tables and migrate ===
for (table_name,) in tables:
    print(f"📤 Exporting table: {table_name}")

    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    col_names = [desc[0] for desc in cursor.description]

    docs = [dict(zip(col_names, row)) for row in rows]

    if docs:
        db[table_name].insert_many(docs)
        print(f"✅ Inserted {len(docs)} rows into Mongo collection '{table_name}'")
    else:
        print(f"⚠️ Table {table_name} is empty, skipped.")

print("🎉 Migration complete!")
