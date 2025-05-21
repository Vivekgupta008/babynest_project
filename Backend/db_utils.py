import sqlite3
from datetime import datetime, timedelta

DB_PATH = "db/database.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def calculate_current_week(due_date_str):
    due = datetime.strptime(due_date_str, "%Y-%m-%d")
    conception = due - timedelta(days=280)
    now = datetime.now()
    return max(1, min(40, (now - conception).days // 7))

def get_due_date():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT dueDate FROM profile LIMIT 1")
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None

def get_next_appointment():
    today = datetime.now().date().isoformat()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""SELECT title, appointment_date, appointment_time, appointment_location
                   FROM appointments
                   WHERE appointment_date > ?
                   ORDER BY appointment_date ASC LIMIT 1""", (today,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return "You have no upcoming appointments."
    return f"Your next appointment is {row[0]} on {row[1]} at {row[2]} in {row[3]}."

def get_tasks_this_week(week):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""SELECT title, starting_week, ending_week
                   FROM tasks
                   WHERE starting_week <= ? AND ending_week >= ?""", (week, week))
    rows = cur.fetchall()
    conn.close()
    if not rows:
        return "No tasks for this week."
    return "Tasks:\n" + "\n".join([f"• {r[0]} (Weeks {r[1]} {r[2]})" for r in rows])

def get_weight_weeks_ago(current_week, weeks_ago):
    target_week = current_week - weeks_ago
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""SELECT week_number, weight, note
                   FROM weekly_weight
                   WHERE week_number = ?""", (target_week,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return f"No weight record found for week {target_week}."
    return f"Your weight {weeks_ago} weeks ago (Week {row[0]}) was {row[1]} kg. Note: {row[2] or 'None'}"
