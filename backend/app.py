import requests # Allow backend to make HTTP requests and get page content
from gtfs_realtime_pb2 import FeedMessage
import csv
from flask import Flask, jsonify
from dotenv import load_dotenv
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import firebase_admin
from firebase_admin import credentials, firestore



app = Flask(__name__)

from flask_cors import CORS
CORS(app)

load_dotenv()
EMAIL_USER=os.getenv("EMAIL_USER")
EMAIL_PASS=os.getenv("EMAIL_PASS")


@app.route('/')
def hello():
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
    api_key = os.getenv("SENDGRID_API_KEY")
    message = Mail(
        from_email=EMAIL_USER,
        to_emails=recipient,
        subject=subject,
        plain_text_content=body 
    )
    try: 
        sendgrid = SendGridAPIClient(api_key)
        response = sendgrid.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)        
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

        for entity in feed.entity: 
            alert = entity.alert
            title = alert.header_text.translation[0].text
            description = alert.description_text.translation[0].text

            for route in saved_routes: 
                if route.lower() in title.lower():

                    send_email(email, f"TransitBuddy Alert: {route}", f"{title}\n{description}")
                    print(f"Sent alert to {email} for {route}")
                    break 

    return "All alerts sent"