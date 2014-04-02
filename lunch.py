#from flask_oauth import OAuth
from flask import Flask, url_for, request, render_template
import json
from datetime import datetime
from pymongo import MongoClient
import random
import requests
from bson import json_util
import json

app = Flask(__name__)

db = MongoClient()['lunch']


@app.route("/")
def videos():
    video = random_video()
    video2 = random_video()
    return render_template("videos.html", videos=[video, video2])

def random_video():
    rand = random.random()
    print "checking", rand
    direction = random.choice([True, False])

    result = db.videos.find_one({"rand":{"$lte":rand}}, {"_id":0}, sort=[("rand",-1)])
    if result is None:
        result = db.docs.find_one({"rand":{"$gte":rand}}, {"_id":0}, sort=[("rand",1)] )
    return result

def outputJSON(obj):
    """Default JSON serializer."""

    if isinstance(obj, datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()

        return obj.strftime('%Y-%m-%d')
    return str(obj)


@app.route("/next", methods=["GET"])
def nextvideo():
    video = random_video()
    return json.dumps(video, default=outputJSON)


@app.route("/admin/video", methods=["POST"])
def addvideo():
    videoInfo = json.loads(request.data)
    db.videos.insert({"videoId":str(videoInfo['videoId']), "rand":random.random()})
    return json.dumps({"ok":1})

@app.route("/admin/video/<videoid>", methods=["DELETE"])
def deletevideo(videoid):
    db.videos.remove({"videoId":videoid})
    return json.dumps({"ok":1})


@app.route("/admin")
def admin():
    videos = db.videos.find()
    return render_template("admin.html", videos=[v['videoId'] for v in videos])

@app.template_filter('tojson_special')
def tojson_special(dateobj):
    dthandler = lambda obj: int(obj.strftime("%s")) * 1000 if isinstance(obj, datetime) else None
    return json.dumps(dateobj, default=dthandler)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
