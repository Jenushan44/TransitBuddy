import requests # Allow backend to make HTTP requests and get page content
from gtfs_realtime_pb2 import FeedMessage
from flask import Flask, jsonify


app = Flask(__name__)

from flask_cors import CORS
CORS(app)


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