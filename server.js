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
//TODO: validate number of items against allowed votes per round; for example, is this a two pick round and have two valid choices been provided ?
function isVoteValid(room, choice1, choice2){
	
}

function vote(mode, room, choice1, choice2){
		var isValid = isVoteValid(room, choice1, choice2);
		
		if(isValid){
			delete room[mode[req.params[constants.CHOICE1]]];
			if (req.params[constants.CHOICE2] != null){
				delete room[mode[req.params[constants.CHOICE2]]];
			}
			return constants.CAST;
		}
		else{
			return constants.FAIL;
		}
}
//Takes user provided key and creates encypted version with server key and phrase then compares to against the server copy of encrypted key for authenricity
function whichTeamisAllowedToVote(userKey, room){
	if (room["votingTeam"] == constants.TEAM_A && computeKey(room["serverKeyA"], userKey, room["phrase"]) == room["serverEncryptedKeyA"])
		return constants.TEAM_A;
	else if (room["votingTeam"] == constants.TEAM_B && computeKey(room["serverKeyB"], userKey, room["phrase"]) == room["serverEncryptedKeyB"])
		return constants.TEAM_B;
	else
		return constants.FAIL;
}

function startNewVotingRoundIfNeeded(room){
	//If both teams have voted start new round
	if(room["teamAHasVoted"] && room["teamBHasVoted"]){
		room["teamAHasVoted"] = false;
		room["teamBHasVoted"] = false;
	}
}

function computeKey(serverKey, userKey, phrase){
	//The key will be created by taking the user key and the server key for the room and encrypting with a string unique to the room
	return CryptoJS.AES.encrypt(userKey + serverKey), phrase);
}
function verifyKey(serverKey, userKey, serverEncryptedKey, phrase){
	//Does the provided user key match the unaltered server copy?
	var userEncryptedKey = computeKey(serverKey, userKey, phrase);
	return (userEncryptedKey == serverEncryptedKey);
}
function isRequestValid(room, key, mode){
	if(room == null || key == null && (mode != constants.MAPS && mode != constants.CHAR){
		res.sendFile(__dirname + '/index.htm');
	}
}
function isMapVote(mode, room){
	return mode == constants.MAP && room["mode"] == constants.MAP;
}
function isCharacterVote(mode, room){
	return mode == constants.CHAR && room["mode"] == constants.CHAR;
}
function allowOtherTeamToVote(key, room){
	if (whichTeamisAllowedToVote(key, room) == constants.TEAM_A)
		room["votingTeam"] = constants.TEAM_B;
	else if (whichTeamisAllowedToVote(key, room) == constants.TEAM_B)
		room["votingTeam"] = constants.TEAM_A;;
}
function acquireVotingLock(res, room){
	//This is needed so that only one person per team can vote
		if (room["voteInProgress"] == false && whichTeamisAllowedToVote(key, room) == room["votingTeam"]){
			room["voteInProgress"] = true;
			return true;
		}
		else {
			return false;
		}
}
function releaseVotingLock(room){
		room["voteInProgress"] = false;
}
function hasTeamBVoteBeenCast(room){
	return room["teamBHasVoted"] == true;
}
function hasTeamAVoteBeenCast(room){
	return room["teamAHasVoted"] == true;
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
	"votingRound":"",
	"votingTeam":"", 
	"eliminationType":",
	"voteInProgress":false,
	"encyptedKeyA":"",
	"encryptedKeyB":"",
	"phrase": uuid(),
	"serverKeyA": uuid(),
	"serverKeyB":uuid(),
	"maps":{},
	"characters":{},
	"teamAHasVoted": false,
	"teamBHasVoted":false
  }
  room["encryptedKeyA"]  = computeKey(room["serverKeyA"], room["keyA"], room["phrase"]);
  room["encryptedKeyB"]  = computeKey(room["serverKeyB"], room["keyB"], room["phrase"]);
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
	var mode = req.params["mode"];

	isRequestValid(rooms[room], key, mode);
	var userHasVotingPrivlege = acquireVotingLock(rooms[room]);
	if (isMapVote(mode, room) && userHasVotingPrivlege){
		if (whichTeamisAllowedToVote(key, room) == constants.TEAM_A && !hasTeamAVoteBeenCast(rooms[room])){
			vote(mode, room, choice1, choice2)
			room["teamAHasVoted"] = true;
		}
		else if (whichTeamisAllowedToVote(key, room) == constants.TEAM_B && !hasTeamBVoteBeenCast(rooms[room])){
			vote(mode, room, choice1, choice2)
			room["teamBHasVoted"] = true;
		}
	}
	else if (isCharacterVote(mode, room) && userHasVotingPrivlege){
		if (whichTeamisAllowedToVote(key, room) == constants.TEAM_A && !hasTeamAVoteBeenCast(rooms[room])){ 
			vote(mode, room, choice1, choice2)
			room["teamAHasVoted"] = true;
		}
		else if (whichTeamisAllowedToVote(key, room) == constants.TEAM_B && !hasTeamBVoteBeenCast(rooms[room])){
			vote(mode, room, choice1, choice2)
			room["teamBHasVoted"] = true;
		}
	}
	
	
	//reset for next round of voting
	startNewVotingRoundIfNeeded(rooms[room]);
	allowOtherTeamToVote(key, room);
	releaseVotingLock(res, rooms[room]);
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