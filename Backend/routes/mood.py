from flask import Blueprint, request, jsonify
from db.db import open_db

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/mood', methods=['POST'])
def log_mood():
    db = open_db()
    data = request.json
    week = data.get('week_number')
    mood = data.get('mood')
    note = data.get('note')

    if not (week and mood):
        return jsonify({"error": "Missing week_number or mood"}), 400

    db.execute('INSERT INTO weekly_mood (week_number, mood, note) VALUES (?, ?, ?)', (week, mood, note))
    db.commit()
    return jsonify({"status": "success", "message": "Mood added"}), 200

@mood_bp.route('/mood', methods=['GET'])
def get_all_mood():
    db = open_db()
    moods = db.execute('SELECT * FROM weekly_mood').fetchall()
    return jsonify([dict(row) for row in moods]), 200

@mood_bp.route('/mood/<int:week>', methods=['GET'])
def get_week_mood(week):
    db = open_db()
    moods = db.execute('SELECT * FROM weekly_mood WHERE week_number = ?', (week,)).fetchall()
    return jsonify([dict(row) for row in moods]), 200
