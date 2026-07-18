import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'railway_system.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Passengers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS passengers (
        passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        gender TEXT NOT NULL,
        age INTEGER NOT NULL,
        address TEXT NOT NULL,
        password TEXT NOT NULL
    );
    """)

    # 2. Trains Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trains (
        train_id INTEGER PRIMARY KEY AUTOINCREMENT,
        train_name TEXT NOT NULL,
        train_number TEXT NOT NULL UNIQUE,
        train_type TEXT NOT NULL,
        total_seats INTEGER NOT NULL,
        source TEXT NOT NULL,
        destination TEXT NOT NULL
    );
    """)

    # 3. Schedules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schedules (
        schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        train_name TEXT NOT NULL,
        source TEXT NOT NULL,
        destination TEXT NOT NULL,
        departure_date TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        arrival_date TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        fare REAL NOT NULL
    );
    """)

    # 4. Bookings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        passenger_name TEXT NOT NULL,
        train_name TEXT NOT NULL,
        journey_date TEXT NOT NULL,
        source TEXT NOT NULL,
        destination TEXT NOT NULL,
        coach_type TEXT NOT NULL,
        seat_number TEXT NOT NULL,
        total_fare REAL NOT NULL,
        booking_status TEXT NOT NULL
    );
    """)

    # 5. Payments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        passenger_name TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        transaction_id TEXT NOT NULL UNIQUE,
        payment_date TEXT NOT NULL
    );
    """)

    conn.commit()

    # Seed initial testing data if tables are empty
    # Check if passengers table is empty
    cursor.execute("SELECT COUNT(*) FROM passengers")
    if cursor.fetchone()[0] == 0:
        # Seed Passenger starting with ID 101
        # Set SQLite AUTOINCREMENT seq to 100 first
        cursor.execute("INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('passengers', 100)")
        cursor.execute("""
        INSERT INTO passengers (passenger_id, full_name, email, phone, gender, age, address, password)
        VALUES (101, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', 'Male', 28, 'Hyderabad', 'rahul123')
        """)
        conn.commit()

    # Check trains table
    cursor.execute("SELECT COUNT(*) FROM trains")
    if cursor.fetchone()[0] == 0:
        # Seed Trains starting with ID 201
        cursor.execute("INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('trains', 200)")
        trains_data = [
            (201, 'Vande Bharat Express', '20678', 'Vande Bharat', 1128, 'Chennai', 'Bangalore'),
            (202, 'Rajdhani Express', '12951', 'Rajdhani', 1200, 'Mumbai', 'Delhi'),
            (203, 'Shatabdi Express', '12002', 'Shatabdi', 800, 'Delhi', 'Jaipur'),
            (204, 'Tejas Express', '22672', 'Superfast', 750, 'Chennai', 'Madurai'),
            (205, 'Humsafar Express', '22317', 'Express', 1100, 'Kolkata', 'Delhi')
        ]
        cursor.executemany("""
        INSERT INTO trains (train_id, train_name, train_number, train_type, total_seats, source, destination)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, trains_data)
        conn.commit()

    # Check schedules table
    cursor.execute("SELECT COUNT(*) FROM schedules")
    if cursor.fetchone()[0] == 0:
        # Seed Schedules starting with ID 301
        cursor.execute("INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('schedules', 300)")
        schedules_data = [
            (301, 'Vande Bharat Express', 'Chennai', 'Bangalore', '2026-08-15', '06:00', '2026-08-15', '10:30', 1200),
            (302, 'Rajdhani Express', 'Mumbai', 'Delhi', '2026-08-15', '17:00', '2026-08-16', '08:30', 2800),
            (303, 'Shatabdi Express', 'Delhi', 'Jaipur', '2026-08-15', '06:05', '2026-08-15', '10:30', 950),
            (304, 'Tejas Express', 'Chennai', 'Madurai', '2026-08-15', '06:00', '2026-08-15', '12:15', 1100),
            (305, 'Humsafar Express', 'Kolkata', 'Delhi', '2026-08-15', '13:10', '2026-08-16', '11:30', 1800)
        ]
        cursor.executemany("""
        INSERT INTO schedules (schedule_id, train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, schedules_data)
        conn.commit()

    # Check bookings table
    cursor.execute("SELECT COUNT(*) FROM bookings")
    if cursor.fetchone()[0] == 0:
        # Seed Booking starting with ID 401
        cursor.execute("INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('bookings', 400)")
        cursor.execute("""
        INSERT INTO bookings (booking_id, passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status)
        VALUES (401, 'Rahul Sharma', 'Vande Bharat Express', '2026-08-15', 'Chennai', 'Bangalore', 'Chair Car', 'C5-18', 1200, 'Confirmed')
        """)
        conn.commit()

    # Check payments table
    cursor.execute("SELECT COUNT(*) FROM payments")
    if cursor.fetchone()[0] == 0:
        # Seed Payment starting with ID 501
        cursor.execute("INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('payments', 500)")
        cursor.execute("""
        INSERT INTO payments (payment_id, booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date)
        VALUES (501, 401, 'Rahul Sharma', 1200, 'UPI', 'Success', 'TXN987654321', '2026-08-10')
        """)
        conn.commit()

    conn.close()

# Passenger CRUD
def get_passengers():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM passengers").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_passenger_by_id(passenger_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM passengers WHERE passenger_id = ?", (passenger_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_passenger_by_email(email):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM passengers WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_passenger(full_name, email, phone, gender, age, address, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO passengers (full_name, email, phone, gender, age, address, password)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (full_name, email, phone, gender, age, address, password))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def update_passenger(passenger_id, full_name, email, phone, gender, age, address, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE passengers
    SET full_name = ?, email = ?, phone = ?, gender = ?, age = ?, address = ?, password = ?
    WHERE passenger_id = ?
    """, (full_name, email, phone, gender, age, address, password, passenger_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

def delete_passenger(passenger_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM passengers WHERE passenger_id = ?", (passenger_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

# Train CRUD
def get_trains():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM trains").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_train_by_id(train_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM trains WHERE train_id = ?", (train_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_train(train_name, train_number, train_type, total_seats, source, destination):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO trains (train_name, train_number, train_type, total_seats, source, destination)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (train_name, train_number, train_type, total_seats, source, destination))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def update_train(train_id, train_name, train_number, train_type, total_seats, source, destination):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE trains
    SET train_name = ?, train_number = ?, train_type = ?, total_seats = ?, source = ?, destination = ?
    WHERE train_id = ?
    """, (train_name, train_number, train_type, total_seats, source, destination, train_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

def delete_train(train_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM trains WHERE train_id = ?", (train_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

# Schedule CRUD
def get_schedules():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM schedules").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_schedule_by_id(schedule_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM schedules WHERE schedule_id = ?", (schedule_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_schedule(train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO schedules (train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def update_schedule(schedule_id, train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE schedules
    SET train_name = ?, source = ?, destination = ?, departure_date = ?, departure_time = ?, arrival_date = ?, arrival_time = ?, fare = ?
    WHERE schedule_id = ?
    """, (train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare, schedule_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

def delete_schedule(schedule_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM schedules WHERE schedule_id = ?", (schedule_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

# Booking CRUD
def get_bookings():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM bookings").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_booking_by_id(booking_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM bookings WHERE booking_id = ?", (booking_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_booking(passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO bookings (passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def update_booking(booking_id, passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE bookings
    SET passenger_name = ?, train_name = ?, journey_date = ?, source = ?, destination = ?, coach_type = ?, seat_number = ?, total_fare = ?, booking_status = ?
    WHERE booking_id = ?
    """, (passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status, booking_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

def delete_booking(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bookings WHERE booking_id = ?", (booking_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

# Payment CRUD
def get_payments():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM payments").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_payment_by_id(payment_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM payments WHERE payment_id = ?", (payment_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_payment(booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO payments (booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def update_payment(payment_id, booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE payments
    SET booking_id = ?, passenger_name = ?, amount = ?, payment_method = ?, payment_status = ?, transaction_id = ?, payment_date = ?
    WHERE payment_id = ?
    """, (booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date, payment_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

def delete_payment(payment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM payments WHERE payment_id = ?", (payment_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

# Auto-initialize database on load
init_db()
