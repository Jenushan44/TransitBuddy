import requests # Allow backend to make HTTP requests and get page content
import csv
from flask import Flask, jsonify
from dotenv import load_dotenv
import os
import sys
import smtplib
from email.message import EmailMessage
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
import json
import time
sys.path.append(os.path.dirname(__file__))

from gtfs_realtime_pb2 import FeedMessage

app = Flask(__name__)

from flask_cors import CORS
CORS(app)

# Load stop coordinates into dictionary
with open(os.path.join(os.path.dirname(__file__), "route_coordinates.json"), "r", encoding="utf-8") as f:
    STOP_COORDINATES = json.load(f)

load_dotenv(dotenv_path=Path(__file__).parent / ".env")
EMAIL_USER=os.getenv("EMAIL_USER")
EMAIL_PASS=os.getenv("EMAIL_PASS")

# Store which alerts have been seen and when
seen_alerts = {}

@app.route("/subway_alerts")
def subway_alerts():
    response = requests.get("https://bustime.ttc.ca/gtfsrt/alerts")
    feed = FeedMessage()
    feed.ParseFromString(response.content)

    now = int(time.time())
    alerts = []

    for entity in feed.entity:
        alert = entity.alert
        start = None
        end = None

        if alert.active_period and len(alert.active_period) > 0:
            period = alert.active_period[0]
            start = getattr(period, "start", None)
            end = getattr(period, "end", None)

        if start and start > now:
            continue
        if end and end < now:
            continue
        
        title = alert.header_text.translation[0].text
        description = alert.description_text.translation[0].text
        cause = alert.cause

        if title not in seen_alerts:
            seen_alerts[title] = now

        if now - seen_alerts[title] > 6 * 3600:
            continue

        alerts.append({
            "title": title,
            "description": description,
            "cause": str(cause),
            "start_time": seen_alerts[title]  
        })

    return jsonify(alerts)

@app.route("/all_routes")
def get_all_routes(): 
    routes = []
    file_path = os.path.join(os.path.dirname(__file__), "data", "routes.txt")
    with open(file_path, "r") as file: 
        lines = csv.reader(file)
        next(lines) # Skip first row (route_id)
        for row in lines: 
            route_p1 = row[2]
            route_p2 = row[3]

            if route_p1 in route_p2:
                route_name = route_p2 # Handles Line 1 and Line 2 subway cases
            else:
                route_name = f"{route_p1} {route_p2}"
            
            routes.append(route_name) 

    return jsonify(sorted(routes))

def send_email(recipient, subject, body): 
    message = EmailMessage() 
    message.set_content(body)
    message['Subject'] = subject
    message['From'] = EMAIL_USER
    message['To'] = recipient
    try: 
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(message)
        return True
    except Exception as error: 
        return False

# Connects app to firestore to access user's saved routes and read email address 
credentials = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(credentials)
database = firestore.client()

@app.route("/send_alerts")
def send_alerts(): 
    response = requests.get("https://bustime.ttc.ca/gtfsrt/alerts")
    feed = FeedMessage()
    feed.ParseFromString(response.content)

    users_reference = database.collection("users")
    users=users_reference.stream()

    for user in users: 
        data = user.to_dict()
        email = data.get("email")
        saved_routes = data.get("selectedRoutes", [])
        telegram_id = data.get("telegramId")

        matching_alerts = [] # Holds all alerts that match with user's saved routes

        for entity in feed.entity: 
            alert = entity.alert
            title = alert.header_text.translation[0].text
            description = alert.description_text.translation[0].text

            for route in saved_routes: 
                if route.lower() in title.lower():
                    matching_alerts.append((route, title, description))
                    break  

        if matching_alerts and email:
            email_body = "Hi,\n\nHere are your current TTC alerts:\n\n"
            for route, title, description in matching_alerts:
                email_body += f"Route: {route}\n- {title}\n- {description}\n\n"
            email_body += "Stay safe,\nThe TransitBuddy Team"

            send_email(email, "Your TransitBuddy Alerts", email_body)

        for route, title, description in matching_alerts:
            if telegram_id:
                message = (
                    f"TransitBuddy Alert\n"
                    f"Route: {route}\n\n"
                    f"Alert: {description}"
                )
                send_telegram_message(telegram_id, message)

    return "All alerts sent"

def send_telegram_message(chat_id, message):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    message_data = {
        "chat_id": chat_id,
        "text": message
    }
    requests.post(url, data=message_data)

@app.route('/stop_coordinates')
def stop_coordinates():
    return jsonify(STOP_COORDINATES)

@app.route('/')
def status():
    return "TransitBuddy Flask is running"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000)) # Get PORT number from Render or use 5000 as default if not set
    app.run(debug=False, host="0.0.0.0", port=port)
