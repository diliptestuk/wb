var showException = require('http-errors');
var express = require('express');
var dir = require('path');
var cookiesToDecode = require('cookie-parser');
var user_logged = require('morgan');
var introRouter = require('./routes/intro');
var checkuserlogin = require('./routes/login');
var userName = require('./routes/welcome');
var socket_io = require('socket.io');
var app = express();
var io = socket_io({wsEngine: 'ws'});
app.io = io;
var indexRouter = require('./routes/index')(io);
// view engine setup
app.set('views', dir.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.users = [
  {
    email : "join@whiteboard.com",
    password: "leuni123",
    token:[]
  }
];

const requireAuth = (req, res, next) => {
  const authToken = req.cookies['AuthToken'];
  console.log("authToken::::");
  const user = req.app.locals.users.find(u => {
      return u.token.find(t =>{
         return t == authToken ;
      }) 
  });
  console.log(user);
  if (user) {
    console.log("render login 2")
      next();
  } else {
    console.log("render login 1")
      res.render('login', {
          title : "Login",
          message: 'Login to get the access to the Whiteboard!',
          messageClass: 'alert-danger'
      });
  }

};

app.use(user_logged('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookiesToDecode());
app.use(express.static(dir.join(__dirname, 'public')));

app.use('/',  introRouter);
app.use('/login', checkuserlogin);
app.use('/welcome', requireAuth, userName);
app.use('/learning_whiteboard', requireAuth, indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(showException(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
