#from flask_oauth import OAuth
from flask import Flask, url_for, request, render_template
import json
from datetime import datetime
from pymongo import MongoClient
import requests

app = Flask(__name__)
#app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

db = MongoClient()['lunch']


@app.route("/videos")
def videos():
    videos = db.videos.find({},{"_id":0})
    return render_template("videos.html", videos=[v for v in videos])

@app.route("/admin/video", methods=["POST"])
def addvideo():
    videoInfo = json.loads(request.data)
    db.videos.insert({"videoId":str(videoInfo['videoId'])})
    return json.dumps({"ok":1})
    #videoId = 
    #videos = db.videos.find()
    #return render_template("admin.html", videos=[v['videoId'] for v in videos])

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


#oauth = OAuth()

#FACEBOOK_APP_ID = "418681641595907"
#FACEBOOK_APP_SECRET = "17afabe1aff02bf03b4770a5ecdcbbfe"

#facebook = oauth.remote_app('facebook',
    #base_url='https://graph.facebook.com/',
    #request_token_url=None,
    #access_token_url='/oauth/access_token',
    #authorize_url='https://www.facebook.com/dialog/oauth',
    #consumer_key=FACEBOOK_APP_ID,
    #consumer_secret=FACEBOOK_APP_SECRET,
    #request_token_params={'scope': 'read_stream'}
#)



#@app.route("/feed")
#def get_feed():
    #print "getting token"
    #token = db.tokens.find_one()['token']
#
    #print "getting feed info"
    #x = requests.get('https://graph.facebook.com/me/home', params={"access_token":token}, timeout=10)
    #print x.status_code
    #print x.content
    #jx = json.loads(x.content)
    #links = [i if 'link' in i else None for i in jx['data']]
    #return render_template("feed.html", links = filter(lambda x: x is not None, links))



#@app.route("/oauth_callback")
#def oauth_callback():
    #code = request.args['code']
    #params = dict(client_id=FACEBOOK_APP_ID, client_secret=FACEBOOK_APP_SECRET, code=code, redirect_uri="http://dev.lunch.tv:5000/oauth_callback")
    #x = requests.get('https://graph.facebook.com/oauth/access_token', params=params)
    #print x.status_code
    #print x.content
    #access_token = x.content.split('&')[0].split('=')[1] # this is so hacky
    #db.tokens.insert({"token":access_token})
    #return x.content


#@app.route('/login')
#def login():
    #return facebook.authorize(callback="http://dev.lunch.tv:5000/oauth_callback")
#url_for('hello', next=request.args.get('next') or request.referrer or None))


