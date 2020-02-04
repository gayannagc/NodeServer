const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const rd_sign = require('./models/road_sign');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const multer = require('multer');
const async = require('async');
const cookieSession = require('cookie-session');

//db connection
mongoose.connect(config.database, {useNewUrlParser : config.useNewUrlParser})
let conn = mongoose.connection;

//check connection
conn.once('open', function(){
    console.log('connected to mongoDB');
});

//check database errors
conn.on('error', function(err){
    console.log('db connection error: ',err);
});

//init app
const app = express();

//setting up view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');
app.use(methodOverride('_method'));

// parse application/x-www-form-urlencoded, body parser middlewear
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//passport config
require('./config/passport')(passport);

//cookie-session middleware
app.use(cookieSession({
  maxAge : 24*60*60*1000,
  keys : ['hhjaakldjddnkdl']
}))


//express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
   res.locals.messages = require('express-messages')(req, res);   
   next();
  });

//express-validator middleware 
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next){
  res.locals.user = req.user || null;
  next();
})

//home page
app.get('/',  function(req,res){
    rd_sign.find({}, function(err,road_signs){
        if(err){
            console.log('querry error: ',err);
        }else{
            res.render('index',{
                title : 'Road Signs',
                road_signs : road_signs,
            });
        }
    });
});


//bringing route files
let roadsign = require('./routes/roadsign');
app.use('/roadsign',roadsign);
let users = require('./routes/users');
app.use('/users',users);
let image_upload = require('./routes/image_upload');
app.use('/image_upload',image_upload);
let androidApp = require('./routes/androidApp')
app.use('/androidApp',androidApp)

//starting the server
app.listen(80, function(err){
    if(err){
        console.log('Server interrupted',err);
    }else{
        console.log('server started!');
    }
});
