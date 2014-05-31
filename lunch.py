#from flask_oauth import OAuth
from flask import Flask, url_for, request, render_template, session
import json
from datetime import datetime
from pymongo import MongoClient
import random
import requests
from bson import json_util
import json
from uuid import uuid4
from datetime import datetime, timedelta

from werkzeug.datastructures import CallbackDict
from pymongo import MongoClient
import uuid


app = Flask(__name__)
app.secret_key = '\xb2\xe3\x0b\x8b\x15m\xa5|\xdb\xa1\xebC\xc5Oe"\xfd-;\x08\xb3I\xc7u'

db = MongoClient()['lunch']


@app.route("/")
def videos():
    user_id = None
    if 'id' not in session:
        session['id'] = uuid.uuid4()

    user_id = session['id']
    video = random_video(user_id, False)
    video2 = random_video(user_id, False)
    return render_template("videos.html", videos=[video, video2])

def random_video(user=None, store_watched=True):
    rand = random.random()
    direction = random.choice([True, False])

    clause = None
    if user:
        user_watched = db.user_watched.find_one({"_id":str(user)},{"watched":1})
        if user_watched:
            clause = {"_id":{"$nin":user_watched['watched']}}

    query = {"rand":{"$lte":rand}}
    if clause:
        query.update(clause)
    result = db.videos.find_one(query, sort=[("rand",-1)])
    if result is None:
        query = {"rand":{"$gte":rand}}
        if clause:
            query.update(clause)
        result = db.docs.find_one(query, sort=[("rand",1)] )

    if user is not None and store_watched:
        db.user_watched.update({"_id":str(user)}, {"$addToSet":{"watched":result['_id']}}, upsert=True)
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
    video = random_video(session.get("id",None), True)
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

