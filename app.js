var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var reload = require('reload');

var mongoose = require('mongoose');
var passport = require('passport');
require('./models/Questions');
require('./models/Answers');
require('./models/Users');
require('./models/Discussions');
require('./config/passport');
mongoose.connect('mongodb://localhost/qa');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var people = [];

server.listen('3005', function(){
  console.log("Web server listening on port 3005");
});

var nsp = io.of('/qa-app');

var loadPeeps = function(){
    for(var i=0;people.length>i;i++){

      //console.log( nsp.connected[people[i].socket] );
      //console.log( people[i].socket );

      if( typeof nsp.connected[people[i].socket] === 'undefined' ){
        console.log( 'sliced::::' + people[i].socket );
        people.splice(i,1);
        console.log( people );
      }
    }

    // socket.broadcast send to others
    // nsp send to everyone
    nsp.emit('peopleNames', people);
    nsp.emit('rooms', nsp.server.nsps['/qa-app'].adapter.rooms);
}

nsp.on('connection', function(socket){

  console.log('a user connected');

  loadPeeps();

  socket.on('disconnect', function(){
    console.log('user disconnected');
    loadPeeps();
  });

  socket.on('chat message', function(msg){
    console.log('got message: ' + msg);
  });

  socket.on('joinDiscussion', function(data){

    if( socket.lastRoom ){
      socket.leave(socket.lastRoom);
      socket.lastRoom = null;
    }

    socket.join(data.discussion);
    socket.lastRoom = data.discussion;

    socket.username = data.user;

    console.log( 'Someone (' + data.user + ') joined ' + data.discussion) ;
    console.log( people );

    console.log( '-- ');
    console.log( nsp.server.nsps['/qa-app'].adapter.rooms[data.discussion] ); //.adapter.rooms[data.discussion]
    console.log( '-- ');

    var unique = true;
    for(var i=0;people.length>i;i++){
      if( people[i].socket == socket.id && people[i].user == data.user ){
        unique = false;
      }
      if( people[i].socket == socket.id ){
        unique = false;
      }
    }

    if(unique){
      people.push({
        socket: socket.id,
        user: data.user
      }); 
    }
    loadPeeps();
    

  });

  /*socket.on('changedQuestion', function(question){
    console.log('someone changed a question');
    console.log(question);
  });*/

  socket.on('changedQuestion', function(question){
    // Send to all other sockets...
    socket.broadcast.emit('changedQuestion', question);
  });

  socket.on('pushQuestions', function(){
    socket.broadcast.emit('pushQuestions');
  });

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;


