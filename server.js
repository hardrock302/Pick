const constants = require('./constants.js');
const app = require('express')();
const http = require('http').Server(app);
const alfresco = require('alfresco-js-api');
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
var CryptoJS = require('crypto-js');
var connection = alfrescoJsApi = new alfresco(constants.ALFRESCO_IP, {provider:'ALL'});
function login(user, pass){
	connection.login(user, pass).then(function (data) {
		console.log('API called successfully LOGIN_URL in  BPM and ECM performed ');
	}, function (error) {
		console.error(error);
	});
}
function logout(){
	 connection.logout().then(function(){
	},function(error){
	});
}
function vote(mode, room, choice1, choice2){
		var choice1 = req.params[constants.CHOICE1];
		var choice2 = req.params[constants.CHOICE2];
		var mode = req.params["mode"];
		
		delete room[mode[req.params[constants.CHOICE1]]];
		if (req.params[constants.CHOICE2] != null){
			delete room[mode[req.params[constants.CHOICE2]]];
		}
}
app.get('/', function(req, res){
  res.sendFile(__dirname +constants.LOGIN_URL);
});
app.get('/chat/', function(req, res){
  var user = uuid();
  var roomId = uuid();
  var room = {
	"keyA": uuid(),
	"keyB": uuid(),
	"mode": req.params["mode"],
	"hashKeyA":"",
	"hashKeyB":"",
	"serverKey":"",
	"maps":{},
	"characters":{},
	"voteCastA": false,
	"voteCastB":false
  }
  room["serverKey"] = uuid();
  room["hashKeyA"]  = CryptoJS.AES.encrypt(JSON.stringify(room["keyA"]), room["serverKey"]);
  room["hashKeyB"]  = CryptoJS.AES.encrypt(JSON.stringify(room["keyB"]), room["serverKey"]);
  rooms[roomId] = room;
  res.sendFile(__dirname + '/index.htm');
});
app.get('/chat/:room/:user', function(req, res){
  var user = uuid();
  var join = {"user": user, 
			"room": room };
  res.sendFile(__dirname + '/index.htm');
});
app.post('/vote', function(req, res){
	var key = req.params["key"];
	var room = req.params["room"];
	var mode = req.params["mode"]
	var voteCastA = room["voteCastA"];
	var voteCastB = room["voteCastB"];
	var hashA = room[hashKeyA];
	var hashB = room[hashKeyB];
	if(rooms[room] == null && key == null && (mode != constants.MAPS && mode != constants.CHAR) && rooms[voteCastA] == false || rooms[voteCastB] == false){
		res.sendFile(__dirname + '/index.htm');
	}
	//compute key and compare for security check
	var userHash = CryptoJS.AES.encrypt(JSON.stringify(room["key"]), room["serverKey"]);
	if(room["voteCastA"] && room["voteCastB"]){
		room["voteCastA"] = false;
		room["voteCastB"] = false;
	}
	if (mode == constants.MAP){
		if (rooms[hashA] == userHash && room["voteCastA"] == false){
			vote(mode, room, choice1, choice2)
			room["voteCastA"] = true;
		}
		else if (rooms[hashB] == userHash && room["voteCastB"] == false){
			vote(mode, room, choice1, choice2)
			room["voteCastB"] = true;
		}
	}
	else if (mode == constants.CHAR){
		if (rooms[hashA] == userHash && room["voteCastA"] == false){ 
			vote(mode, room, choice1, choice2)
			room["voteCastA"] = true;
		}
		else if (rooms[hashB] == userHash && room["voteCastB"] == false){
			vote(mode, room, choice1, choice2)
			room["voteCastB"] = true;
		}
	}
	res.sendFile(__dirname + '/index.htm');
});
app.post('/createaccount', function(req, res){
	var nodeId = constants.ALFRESCO_USER_HOME_REF;
	var node = {
		"name": req.params[constants.NAME_PARAM],
		"nodeType":constants.ALFRESCO_PERSON,
		"password": req.params[constants.PASS_PARAM],
	};
	connection.core.childAssociationsApi.addNode(nodeId, node, opts).then(function() {
		console.log('API called successfully.');
	}, function(error) {
		console.error(error);
	});
});
app.get('/games/', function(req, res){
	login("admin", "admin");
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