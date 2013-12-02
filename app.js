/**
*Module dependencies.
*/

var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    routes = require('./routes'),
    http = require('http');

/**
*App.
*/

var app =  express();
var server = http.createServer(app);

/** 
* App configuration
*/
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(stylus.middleware({ 
    src: __dirname + '/stylus',
    dest: __dirname + '/public',
    compile: function (str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib())
        .import('nib');
      }
  }));
  //app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// app.configure('development', function(){
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
// });

app.configure('production', function(){
  app.use(express.errorHandler()); 
});



/**
* Socket-io
*/

/**
*init socket.io server side
* create object nicknames
**/
var io = require('socket.io').listen(server),
    nicknames = {};

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


io.sockets.on('connection', function (socket) {
  socket.on('sendData',function(data){
    console.log(data);
    //io.socket.emit('getData',data);
    io.sockets.emit('getdata', data);
  });

  /**
  *implementation nicksnames of the clients
  **/
  socket.on('nickname', function (nick, fn) {
    console.log(fn);
    if (nicknames[nick]) {
       fn(true);
    } else {
       fn(false);
       nicknames[nick] = socket.nickname = nick;
       socket.broadcast.emit('announcement', nick + ' connected');
       io.sockets.emit('nicknames', nicknames);
    }
  });

  /**
  *when the client disconnect
  **/
  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
  });
});

/**
* App routes.
*/
app.get('/', routes.index);

server.listen(3000);
var addr = server.address();
console.log('its running on localhost'+':'+addr.port);