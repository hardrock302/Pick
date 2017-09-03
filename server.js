const app = require('express')();
const http = require('http').Server(app);
const alfresco = require('alfresco-js-api');
const constants = require('./constants.js');
//const alfrescoIP = 'http://127.0.0.1:8080';
var io = require('socket.io')(http);
var Room = require('./room.js');  
var uuid = require('node-uuid');  
var people = {};  
var rooms = {};  
var usernames = [];
var connection = alfrescoJsApi = new alfresco(constants.alfrescoIP, {provider:'ALL'});
function login(username, password){
	connection.login(username, password).then(function (data) {
		console.log('API called successfully Login in  BPM and ECM performed ');
	}, function (error) {
		console.error(error);
	});
}
function login(){
	connection.login('admin', 'admin').then(function (data) {
		console.log('API called successfully Login in  BPM and ECM performed ');
	}, function (error) {
		console.error(error);
	});
}
function logout(){
	 connection.logout().then(function(){
		console.log("Logout complete");
	},function(error){
		console.log(error);
	});
}
app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.htm');
});
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/index.htm');
});
app.get('/games/', function(req, res){
	login();
	connection.search.searchApi.search({
        "query": {
            "query": "select cmis:objectId, pb:Name from pb:Game",
            "language": "cmis"
            }
        }).then(function (data) {
            res.send(data.list.entries);
        }, function (error) {
            res.send(error);
        });
});
app.get('/maps/:game', function(req, res){
	login();
		connection.search.searchApi.search({
        "query": {
            "query": "select * from pb:Map where pb:parentGame ='" + req.params['game'] +"'",
            "language": "cmis"
            }
        }).then(function (data) {
            res.send(data);
        }, function (error) {
            res.send(error);
        });
	
});
io.on('connection', function(socket){
	socket.on("connected", function(data){
		io.emit('user logged in', data.name + " has logged in.");
		usernames[data.name] = [uuid.v4(), data.name];
		
	});
	
  socket.on('chat message', function(data){
	if(usernames.has(data.name)){
		socket.broadcast.emit('chat message', data.msg);
	}
  });
  socket.on("disconnected", function(socket){
	io.emit('user logged out', "A user has logged out.");
	usernames[data.name] = null;
		
});

});
http.listen(3000, function(){
  console.log('listening on *:3000');
});