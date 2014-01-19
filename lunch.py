from flask_oauth import OAuth
from flask import Flask, url_for, request, render_template
import json
from pymongo import MongoClient
import requests

app = Flask(__name__)
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

db = MongoClient()['lunch']


oauth = OAuth()

FACEBOOK_APP_ID = "418681641595907"
FACEBOOK_APP_SECRET = "17afabe1aff02bf03b4770a5ecdcbbfe"

facebook = oauth.remote_app('facebook',
    base_url='https://graph.facebook.com/',
    request_token_url=None,
    access_token_url='/oauth/access_token',
    authorize_url='https://www.facebook.com/dialog/oauth',
    consumer_key=FACEBOOK_APP_ID,
    consumer_secret=FACEBOOK_APP_SECRET,
    request_token_params={'scope': 'read_stream'}
)


@app.route("/videos")
def videos():
    return render_template("videos.html")

@app.route("/feed")
def get_feed():
    print "getting token"
    token = db.tokens.find_one()['token']

    print "getting feed info"
    x = requests.get('https://graph.facebook.com/me/home', params={"access_token":token}, timeout=10)
    print x.status_code
    print x.content
    jx = json.loads(x.content)
    links = [i if 'link' in i else None for i in jx['data']]
    return render_template("feed.html", links = filter(lambda x: x is not None, links))



@app.route("/oauth_callback")
def oauth_callback():
    code = request.args['code']
    params = dict(client_id=FACEBOOK_APP_ID, client_secret=FACEBOOK_APP_SECRET, code=code, redirect_uri="http://dev.lunch.tv:5000/oauth_callback")
    x = requests.get('https://graph.facebook.com/oauth/access_token', params=params)
    print x.status_code
    print x.content
    access_token = x.content.split('&')[0].split('=')[1] # this is so hacky
    db.tokens.insert({"token":access_token})
    return x.content


@app.route('/login')
def login():
    return facebook.authorize(callback="http://dev.lunch.tv:5000/oauth_callback")
#url_for('hello', next=request.args.get('next') or request.referrer or None))

if __name__ == "__main__":
    app.run(debug=True)


