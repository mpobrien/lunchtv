#from flask_oauth import OAuth
from flask import Flask, url_for, request, render_template, session
import json
from datetime import datetime
from pymongo import MongoClient
import random
import requests
from bson import json_util
import bson
import json
from uuid import uuid4
from datetime import datetime, timedelta
from flask.ext.mobility import Mobility
from flask.ext.mobility.decorators import mobile_template
from werkzeug.datastructures import CallbackDict
from pymongo import MongoClient
import uuid

app = Flask(__name__)
Mobility(app)
app.secret_key = '\xb2\xe3\x0b\x8b\x15m\xa5|\xdb\xa1\xebC\xc5Oe"\xfd-;\x08\xb3I\xc7u'

db = MongoClient()['lunch']

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, bson.ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

@app.route("/")
@mobile_template('{mobile/}videos.html')
def videos(template):
    print request.MOBILE
    user_id = None
    if 'id' not in session:
        session['id'] = uuid.uuid4()
    user_id = session['id']
    video = random_video(user_id, False)
    video2 = random_video(user_id, False)
    return render_template(template, videos=[video, video2])

def random_video(user=None, store_watched=True):
    rand = random.random()
    direction = random.choice([True, False])

    query = {}
    clause = None
    if user:
        user_watched = db.user_watched.find_one({"_id":str(user)},{"watched":1})
        if user_watched:
            clause = {"_id":{"$nin":user_watched['watched']}}

    r = random.random()
    query.update({"rand":{"$gte":r}})

    if clause:
        query.update(clause)

    result = db.vids.find_one(query)
    if not result:
        query = {}
        query.update(clause)
        query.update({"rand":{"$lte":r}})
        result = db.vids.find_one(query)

    # user watched everything? reset!
    if not result:
        db.user_watched.update({"_id":str(user)}, {"$set":{"watched":[]}}, upsert=True)

    result = db.vids.find_one(query)
    if not result:
        result = db.vids.find_one()

    if user is not None and store_watched:
        db.user_watched.update({"_id":str(user)}, {"$addToSet":{"watched":result['_id']}}, upsert=True)
    return result

def outputJSON(obj):
    if isinstance(obj, datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()

        return obj.strftime('%Y-%m-%d')
    return str(obj)


@app.route("/next", methods=["GET"])
def nextvideo():
    if 'id' not in session:
        session['id'] = uuid.uuid4()
    video = random_video(session.get("id",None), True)
    return json.dumps(video, default=outputJSON)


@app.route("/admin/video", methods=["POST"])
def addvideo():
    videoInfo = json.loads(request.data)
    vid = {"url":videoInfo["url"],
           "bumper":"bumper" in videoInfo,
           "videoId":videoInfo.get("id", None),
           "who":videoInfo.get("who", None),
           "what":videoInfo.get("what", None), }
    oid = db.vids.insert(vid)
    return json.dumps({"oid":str(oid)})

@app.route("/admin/video/<videoid>", methods=["DELETE"])
def deletevideo(videoid):
    db.vids.remove({"_id":bson.ObjectId(videoid)})
    return json.dumps({"ok":1})

@app.route("/admin/video/<videoid>", methods=["POST"])
def updatevideo(videoid):
    videoInfo = json.loads(request.data)
    vid = {"url":videoInfo["url"],
           "bumper":"bumper" in videoInfo,
           "videoId":videoInfo.get("id", None),
           "who":videoInfo.get("who", None),
           "what":videoInfo.get("what", None), }
    db.vids.update({"_id":bson.ObjectId(videoid)}, vid)
    return json.dumps({"ok":1})

@app.route("/admin")
def admin():
    return render_template("admin.html", videos=list(db.vids.find()))

@app.template_filter('tojson_special')
def tojson_special(dateobj):
    dthandler = lambda obj: int(obj.strftime("%s")) * 1000 if isinstance(obj, datetime) else None
    return json.dumps(dateobj, default=dthandler)


app.debug = True
app.json_encoder = JSONEncoder
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)


