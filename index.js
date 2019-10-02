var express = require("express");
var app = express()
  .use(express.static("public"))
  .get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
  })
  .get("/dbCall", function(req, cb) {
    dbCall(function(db) {
      var coll = db.collection(req.query.collection);
      ({
        find: function() {
          coll.find(req.query.projection).toArray(function(err, res) {
            cb.send(res);
          });
        },
        findOne: function() {
          coll.findOne(req.query.projection, function(err, res) {
            cb.send(res);
          });
        }
      }[req.query.method]());
    });
  })
  .listen(3000);

function dbCall(action) {
  require("mongodb").MongoClient.connect(
    process.env.atlas,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, client) {
      action(client.db("test"));
      client.close();
    }
  );
}
