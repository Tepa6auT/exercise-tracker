const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


process.env.MONGO_URI="mongodb+srv://tepa6aut:05MongoDB23@cluster0.sbkcl.mongodb.net/test?retryWrites=true&w=majority";


mongoose.connect(process.env.MONGO_URI);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Path `username` is required."]
  },
  log: []
});

const User = mongoose.model('User', userSchema);
const port = process.env.PORT || 3000;


//post to check if username in db, if not save in db and return json, if in db send a sentence of username already taken
app.post("/api/exercise/new-user", function(req, res) {
  var username = req.body.username;
  User.findOne({"username": username}, function(err, data){
    if(err) {
      return err;
    }
    if (!data) {
      const user = new User({"username": username, log: []});
      user.save(function(err,data) {
        if(err) {
          return err;
        }
        res.json({"_id": user._id, "username": username});
      });
    } else {
      res.send("Username already taken");
    }
  })
});


app.post("/api/exercise/add", function(req, res) {
  if (mongoose.Types.ObjectId.isValid(req.body.userId)) {
    if (req.body.description != "") {
      if ((/^[0-9]+$/).test(req.body.duration)) {
        if ((/^$|\D+/g).test(req.body.date)) {//mathcn empty string or non all-non-digits


          User.findById(req.body.userId, function(err, data) {
            if (err) {
              console.log(err);
            }
            var date_string =  new Date(req.body.date);
            if (req.body.date == "") {
              date_string = new Date(Date.now());
            }
        
            data.log.push({description: req.body.description,duration:parseInt(req.body.duration), date:date_string.toDateString()});
            data.save(function(err,data) {
              if(err) {
                return err;
            }
              res.json({"_id": req.body.userId,"username": data.username,"date": date_string.toDateString(),"duration": parseInt(req.body.duration),"description": req.body.description})
          });
        })

        } else {
          res.send(`Cast to date failed for value "${req.body.date}" at path "date"`);
        }
      } else {
        res.send(`Cast to Number failed for value "${req.body.duration}" at path "duration"`);
      }
    } else {
      res.send("Path `description` is required.");
    }
  } else {
    res.send(`Cast to ObjectId failed for value "${req.body.userId}" at path "_id" for model "Users"`);
  }
})


app.get("/api/exercise/users", function(req, res) { // get all user names and ids
  User.find({}, function(err,data) {
    if (err) {
      console.log(err);
    }
    var arr = [];
    var usernames = data.map(x => x.username);
    var userIds = data.map(x => x._id);
    for(var i = 0; i < usernames.length; i++) {
      arr.push({"username":usernames[i], "_id": userIds[i]});
    }
    res.send(arr);
  })
})


app.get("/api/exercise/log", function(req,res) {
  var userId = req.query.userId;
  User.find({"_id": userId}, function(err,data) {
    if(err) {
      console.log(err);
    }
    var fromD = new Date(req.query.from);
    var toD = new Date(req.query.to);
    if (req.query.from) {
      data[0].log = data[0].log.filter(function(currentV) {
      var current = new Date(currentV.date);
      if (current > fromD) {
        return currentV;
      }
      })
    }

    if (req.query.to) {
      data[0].log = data[0].log.filter(function(currentV) {
        var current = new Date(currentV.date);
        if (current < toD) {
          return currentV;
        }
      })
    }

    if (req.query.limit) {
      data[0].log = data[0].log.slice(0, req.query.limit);
    }
    res.json({"_id": req.query.userId, "username": data[0].username, "from": fromD.toDateString(), "to":toD.toDateString(), "count": data[0].log.length, "log": data[0].log});
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
