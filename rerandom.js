var vids = db.vids.find()
while(vids.hasNext()){
  var nextvid = vids.next()
  db.vids.update({_id:nextvid._id},{$set:{rand:Math.random()}})
}
db.vids.ensureIndex({rand:1})
