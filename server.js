

//server.js/
var express = require('express')
    ,app    = express()
    ,port   = process.env.PORT || 3001
    ,http   = require('http')
    ,path   = require('path')
    //,exphbs = require('express-handlebars')
    
    /*body middleware*/
    //,logger       = require('morgan')
    ,cookieParser = require('cookie-parser')
    ,bodyParser   = require('body-parser')
    ,session      = require('express-session')

    //,ejs            = require('ejs')
    ,flash           = require('connect-flash')
    ,mongoose       = require('mongoose')
    ,socketio       = require('socket.io')
    
    //,methodOverride = require('method-override')
    ,passport       = require('passport');

    /*passport authotication*/
   /* ,LocalStrategy    = require('passport-local')
    ,TwitterStrategy  = require('passport-twitter')
    ,FacebookStrategy = require('passport-facebook')*/
// local file (database connection)
    /* socketio stuff*/

    var httpServer = http.Server(app)
    var io = socketio(httpServer)
    /* Database Stuff................................*/
    var configDB = require('./server/config/database');

    var connectingString = configDB.dev
    if (process.env.PORT) {
        var connectingString = configDB.pro
    }
    mongoose.connect(connectingString);
   // mongoose.connect(connectingString, configDB.options);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      // we're connected!
      console.log('database now connected!!!!');

    });
    db.on('connect', function () {
        console.log('database hit')
    })




//var router = express.Router()

//===============EXPRESS================
// Configure Express
//app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* creating static directory*/
app.use('/lib', express.static(__dirname + '/node_modules'));
app.use( express.static(__dirname + '/client/build/'));
//app.use(methodOverride('_method'));
//app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: false, resave: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session


//CORS Support not needed indeed ................................
/*app.use( function (req, res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Request-Headers', 'Authorization');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'content-Type','Authorization');
    next();
});
*/



require('./server/index')(app, passport,io);



// app.listen(port, function () {
//     console.log("app is running on localhost:"+port+"... ");
// })
httpServer.listen(port, function () {
  console.log("app is running on localhost:"+port+"... ");
})
































/*const express = require("express");
const fs = require("fs");
const sqlite = require("sql.js");

const filebuffer = fs.readFileSync("db/usda-nnd.sqlite3");

const db = new sqlite.Database(filebuffer);

const app = express();

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

const COLUMNS = [
  "carbohydrate_g",
  "protein_g",
  "fa_sat_g",
  "fa_mono_g",
  "fa_poly_g",
  "kcal",
  "description"
];
app.get("/api/food", (req, res) => {
  const param = req.query.q;

  if (!param) {
    res.json({
      error: "Missing required parameter `q`"
    });
    return;
  }

  // WARNING: Not for production use! The following statement
  // is not protected against SQL injections.
  const r = db.exec(
    `
    select ${COLUMNS.join(", ")} from entries
    where description like '%${param}%'
    limit 100
  `
  );

  if (r[0]) {
    res.json(
      r[0].values.map(entry => {
        const e = {};
        COLUMNS.forEach((c, idx) => {
          // combine fat columns
          if (c.match(/^fa_/)) {
            e.fat_g = e.fat_g || 0.0;
            e.fat_g = (parseFloat(e.fat_g, 10) +
              parseFloat(entry[idx], 10)).toFixed(2);
          } else {
            e[c] = entry[idx];
          }
        });
        return e;
      })
    );
  } else {
    res.json([]);
  }
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
*/