var vids = db.videos.find()
while(vids.hasNext()){
  var nextvid = vids.next()
  db.videos.update({_id:nextvid._id},{$set:{rand:Math.random()}})
}
db.videos.ensureIndex({rand:1})
