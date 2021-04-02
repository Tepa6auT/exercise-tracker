# [Exercise Tracker](https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/exercise-tracker)

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
  log: [{description: {type:String, required: [true, "REQQUEEFDESC"]}, duration: Number, date: Date}]
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

        if (req.body.date instanceof Date || req.body.date =="") {
          User.findById(req.body.userId, function(err, data) {
            var date_string =  new Date(req.body.date);
            if (req.body.date == "") {
              date_string = new Date(Date.now());
            }
          
            data.log.push({description: req.body.description, duration:req.body.duration, date: date_string.toDateString()});
            data.save(function(err,data) {
              if(err) {
                return err;
              }
              res.json({"_id": req.body.userId,"username": data.username,"date": date_string.toDateString(),"duration": parseInt(req.body.duration),"description": req.body.description});
            });
          })
        } else {
          res.send(`Cast to Date failed for value "${req.body.date}" at path "date" for model "Users"`)
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
      return err;
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
  var fromD = new Date(req.query.from);
  var toD = new Date(req.query.to);
  var limit = req.query.limit;

  User.find({"_id": userId}, function(err,data) {
    if (err) {
      console.log(err);
    }  
    if (Object.keys(req.query).length === 4) {
      var arr = data[0].log.filter(function(currentValue) {
      var current = new Date(currentValue.date);
      if (current > fromD && current < toD) {
        return currentValue;
      }
      })
      data[0].log = arr.slice(0,limit);   
    }
    res.json({"_id": userId, "username": data[0].username, "from": fromD.toDateString(), "to":toD.toDateString(), "count": data[0].log.length, "log": data[0].log});
  }) 
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
