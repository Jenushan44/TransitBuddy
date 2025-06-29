import requests # Allow backend to make HTTP requests and get page content
from gtfs_realtime_pb2 import FeedMessage
import csv
from flask import Flask, jsonify
from dotenv import load_dotenv
import os
import smtplib
from email.message import EmailMessage
import firebase_admin
from firebase_admin import credentials, firestore



app = Flask(__name__)

from flask_cors import CORS
CORS(app)

load_dotenv()
EMAIL_USER=os.getenv("EMAIL_USER")
EMAIL_PASS=os.getenv("EMAIL_PASS")


@app.route('/')
def status():
    return 'TransitBuddy Backend is working!'

@app.route("/subway_alerts")
def subway_alerts():
    response = requests.get("https://bustime.ttc.ca/gtfsrt/alerts") # gives back binary data
    feed = FeedMessage() # Holds alert data from GTFS-RT 
    feed.ParseFromString(response.content) # Decode binary data into Python
    
    alerts = []
    for entity in feed.entity:
        alert = entity.alert 
        cause = entity.alert.cause 
        title = entity.alert.header_text.translation[0].text
        description = entity.alert.description_text.translation[0].text
        alerts.append({
            "title": title,
            "description": description,
            "cause": str(cause)  
        })

    return jsonify(alerts)

@app.route("/all_routes")
def get_all_routes(): 
    routes = []

    with open("routes.txt", "r") as file: 
        lines = csv.reader(file)

        for row in lines: 
            route_id = row[0] 
            route_p1 = row[2]
            route_p2 = row[3]

            route_name = f"{route_p1} {route_p2}"
            
            routes.append(route_name) 


    return jsonify(routes)

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
        print(f"Email sent to {recipient}")
        return True
    except Exception as error: 
        print("Error sending email:", error)
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
        

        for entity in feed.entity: 
            alert = entity.alert
            title = alert.header_text.translation[0].text
            description = alert.description_text.translation[0].text

            for route in saved_routes: 
                if route.lower() in title.lower():
                    if telegram_id:
                        send_telegram_message(telegram_id, f"TransitBuddy Alert: {route}\n{title}\n{description}")
                    if email: 
                        send_email(email, f"TransitBuddy Alert: {route}", f"{title}\n{description}")


                        print(f"Sent alert to {email} for {route}")
                    break 

    return "All alerts sent"


def send_telegram_message(chat_id, message):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    message_data = {
        "chat_id": chat_id,
        "text": message
    }
    requests.post(url, data=message_data)

