const app = require('express')();
const http = require('http').Server(app);
const alfresco = require('alfresco-js-api');
const constants = require('./constants.js');
var io = require('socket.io')(http);
var Room = require('./room.js');  
var uuid = require('node-uuid'); 
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies 
var people = {};  
var rooms = {};  
var usernames = [];
var items = []

var connection = alfrescoJsApi = new alfresco(constants.ALFRESCO_IP, {provider:'ALL'});
function login(user, pass){
	connection.login(user, pass).then(function (data) {
		console.log('API called successfully Login in  BPM and ECM performed ');
	}, function (error) {
		console.error(error);
	});
}
function logout(){
	 connection.logout().then(function(){
	},function(error){
	});
}
app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.htm');
});
app.get('/chat', function(req, res){
  var user = uuidv4();
  var roomId = uuidv4();
  var room = {
	"voteKeyA": uuidv4(),
	"voteKeyB": uuidv4()
  }
  rooms.push(room);
  res.sendFile(__dirname + '/index.htm');
});
app.get('/chat/:room', function(req, res){
  var user = uuidv4();
  var join = {"user": user, 
			"room": room };
  rooms.push();
  res.sendFile(__dirname + '/index.htm');
});
app.get('/chat/:room/:key', function(req, res){
  var user = uuidv4();
  var join = {"user": user, 
			"room": room };
  rooms.push();
  res.sendFile(__dirname + '/index.htm');
});
app.post('/vote', function(req, res){
	var key = req.params["key"];
	var room = req.params["room"];
	if (rooms[room].voteKeyA == key){ 
		
	}
	else if (rooms[room].voteKeyB == key){
	
	}
	res.sendFile(__dirname + '/index.htm');
});
app.post('/createaccount', function(req, res){
	var nodeId = constants.usrHome;
	var node = {
		"name": req.params['name'],
		"nodeType":"cm:person",
		"password": req.params['password'],
	};
	connection.core.childAssociationsApi.addNode(nodeId, node, opts).then(function() {
		console.log('API called successfully.');
	}, function(error) {
		console.error(error);
	});
});
app.get('/games/', function(req, res){
	login();
	connection.search.searchApi.search({
        "query": {
            "query": "select cmis:objectId, pb:Name from pb:Game",
            "language": "cmis"
            }
        }).then(function (data) {
			var gamesList = [];
			var games = Object.keys(data.list.entries);
			for (var i=0; i<games.length; i++){
				var game = data.list.entries[i].entry;
				var obj = new Object();
				obj.name = game.name;
				obj.id = game.id;
				gamesList.push(obj);
			}
            res.send(gamesList);
        }, function (error) {
            res.send(error);
        });
});
app.post('/login', function(req, res) {
	login(req.body.name, req.body.password);
});
app.get('/details/:game', function(req, res){
	login("admin", "admin");
		connection.search.searchApi.search({
        "query": {
            "query": "select * from pb:Map where pb:parentGame = 'workspace://SpacesStore/" + req.params['game'] +"'",
            "language": "cmis"
			
            }
        }).then(function (data) {
            res.send(data);
        }, function (error) {
            res.send(error);
        });
	
});
app.get('/maps/:game', function(req, res){
	login("admin", "admin");
		connection.search.searchApi.search({
        "query": {
            "query": "select * from cmis:document where IN_FOLDER('workspace://SpacesStore/" + req.params['game'] +"') and cmis:name like '%.png'",
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