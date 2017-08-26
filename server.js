var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Room = require('./room.js');  
var uuid = require('uuid/v4');  
var people = {};  
var rooms = {};  
var usernames = [];
var name
app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.htm');
});
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/index.htm');
});
io.on('connection', function(socket, name){
	console.log('user connected');
	io.emit('user logged in', name + " has logged in.");
  socket.on('chat message', function(msg){
    socket.broadcast.emit('chat message', msg);
  });
  socket.on('disconnect', function(socket){
	  console.log('a user disconnected')
	  io.emit('user logged out', name + " has logged out.");
  });
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});