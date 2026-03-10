import sqlite3

# ─────────────────────────────────────────────
# database.py
# Handles all SQLite database operations
# ─────────────────────────────────────────────

DB_NAME = 'finwise.db'  # database file will be created automatically


def get_connection():
    """
    Returns a connection to the SQLite database.
    check_same_thread=False is needed for Flask.
    """
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # lets us access columns by name like a dict
    return conn


def init_db():
    """
    Creates the expenses table if it doesn't exist.
    Call this once when the app starts.

    Table structure:
    ┌────┬─────────────┬────────┬────────────┬──────────────┐
    │ id │ description │ amount │    date    │   category   │
    └────┴─────────────┴────────┴────────────┴──────────────┘
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT    NOT NULL,
            amount      REAL    NOT NULL,
            date        TEXT    NOT NULL,
            category    TEXT    NOT NULL
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized — expenses table ready")


def add_expense(description, amount, date, category):
    """
    Inserts a new expense record into the database.
    Returns the id of the newly inserted row.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO expenses (description, amount, date, category)
        VALUES (?, ?, ?, ?)
    ''', (description, amount, date, category))

    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id


def get_all_expenses():
    """
    Fetches all expenses, newest first.
    Returns a list of dicts like:
    [
        { id, description, amount, date, category },
        ...
    ]
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM expenses
        ORDER BY date DESC, id DESC
    ''')

    rows = cursor.fetchall()
    conn.close()

    # convert Row objects to plain dicts
    return [dict(row) for row in rows]


def get_expenses_by_category(category):
    """
    Fetches all expenses for a specific category.
    Used to show transactions under each category card.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM expenses
        WHERE category = ?
        ORDER BY date DESC, id DESC
    ''', (category,))

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_expense(expense_id, description, amount, date, category):
    """
    Updates an existing expense record.
    Called when user edits a transaction.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE expenses
        SET description = ?,
            amount      = ?,
            date        = ?,
            category    = ?
        WHERE id = ?
    ''', (description, amount, date, category, expense_id))

    conn.commit()
    updated = cursor.rowcount  # 1 if updated, 0 if id not found
    conn.close()
    return updated


def delete_expense(expense_id):
    """
    Deletes an expense by its id.
    Called when user clicks delete on a transaction.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))

    conn.commit()
    deleted = cursor.rowcount
    conn.close()
    return deleted


def get_summary():
    """
    Returns total spending grouped by category.
    Used for the pie chart on dashboard.

    Returns:
    [
        { category: "Food",      total: 1250.0 },
        { category: "Transport", total: 430.0  },
        ...
    ]
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT category, SUM(amount) as total
        FROM expenses
        GROUP BY category
        ORDER BY total DESC
    ''')

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_monthly_trend():
    """
    Returns day-wise spending for current month.
    Used for the line chart on dashboard.

    Returns:
    [
        { date: "2025-02-01", total: 320.0 },
        { date: "2025-02-02", total: 150.0 },
        ...
    ]
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT date, SUM(amount) as total
        FROM expenses
        GROUP BY date
        ORDER BY date ASC
    ''')

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]