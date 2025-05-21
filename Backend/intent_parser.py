import re

def parse_intent(query):
    text = query.lower()

    if "next appointment" in text or "upcoming appointment" in text:
        return {"intent": "next_appointment"}

    if "tasks this week" in text or "this week's tasks" in text:
        return {"intent": "this_week_tasks"}

    match = re.search(r"weight.*?(\d+)\s+weeks?\s+ago", text)
    if match:
        return {"intent": "weight_weeks_ago", "slots": {"weeks": int(match.group(1))}}

    return {"intent": "unknown"}
