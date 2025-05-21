from flask import Flask
from flask_cors import CORS
from db.db import close_db
from routes.appointments import appointments_bp
from routes.tasks import tasks_bp
from routes.profile import profile_bp
from routes.symptoms import symptoms_bp
from routes.mood import mood_bp
from routes.weight import weight_bp
from routes.medicine import medicine_bp
from intent_parser import parse_intent
import db_utils
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app)

app.register_blueprint(appointments_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(symptoms_bp)
app.register_blueprint(mood_bp)
app.register_blueprint(weight_bp)
app.register_blueprint(medicine_bp)

@app.teardown_appcontext
def teardown_db(exception):
    close_db(exception)

@app.route('/')
def index():
    from routes.appointments import get_appointments
    from routes.tasks import get_tasks
    appointment_db =  get_appointments()
    task_db = get_tasks()
    return appointment_db

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    query = data.get("question", "")
    
    # Parse for personal intents
    intent_data = parse_intent(query)
    intent = intent_data["intent"]

    due_date = db_utils.get_due_date()
    if not due_date:
        return jsonify({"response": "Due date not set."}), 500

    current_week = db_utils.calculate_current_week(due_date)

    if intent == "next_appointment":
        reply = db_utils.get_next_appointment()
    elif intent == "this_week_tasks":
        reply = db_utils.get_tasks_this_week(current_week)
    elif intent == "weight_weeks_ago":
        weeks_ago = intent_data["slots"]["weeks"]
        reply = db_utils.get_weight_weeks_ago(current_week, weeks_ago)
    else:
        # FALLBACK to AI model
        return jsonify({ "fallback": True })  # React Native model will handle this
    return jsonify({ "response": reply })



if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000, debug=True)

   
