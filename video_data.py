# Import the modules
import requests
from datetime import datetime
import json
import pymongo

db = pymongo.MongoClient()['lunch']
APIKEY='AIzaSyDTpMFsh3D0H35deephsoyq1xG1O3QOWyk'
VID_URL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=%s&key=%s'

def add_video_data():
    videos = list(db.videos.find({"details":{"$exists":False}}, {"videoId":1}))
    for video in videos:
        vidId = video['videoId']
        print vidId
        response = requests.get(VID_URL % (vidId, APIKEY)) 
        video_data = json.loads(response.text)
        info = video_data['items'][0]['snippet']
        print info
        details = {"title": info["title"], 
                   "publishedAt": datetime.strptime(info["publishedAt"], "%Y-%m-%dT%H:%M:%S.000Z"),
                   "description": info["description"],
                   "channeltitle": info["channelTitle"]}
        db.videos.update({"_id":video['_id']}, {"$set":{"details":details}})

def main():
    add_video_data()

if __name__ == '__main__':
    main()
