const constants = require('./constants.js');
const sessionManagement = require('./sessionManagement.js');
const dataManagement = require('./dataManagement.js');
const app = require('express')();
const http = require('http').Server(app);
const alfresco = require('alfresco-js-api');
var io = require('socket.io')(http);  
var uuid = require('node-uuid'); 
module.exports.uuid = uuid;
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies 
var people = {};  
var rooms = {};  
var usernames = [];
var items = []
var CryptoJS = require('crypto-js');
var connection = alfrescoJsApi = new alfresco(constants.ALFRESCO_IP, {provider:'ALL'});

io.on('connection', function(socket){
  socket.on('vote', function(vote){
	//Intended Room is current session for this user
	var key = vote.key;
	var room = vote.room;
	var intendedRoom = rooms[room];
	var choice1 = vote.choice1;
	var choice2 = vote.choice2;
	var mode = intendedRoom["mode"];

	if (!sessionManagement.isRequestValid(intendedRoom, key, mode)){
		socket.emit("fail");
	}
	var userHasVotingPrivlege = sessionManagement.acquireVotingLock(intendedRoom);
	if (sessionManagement.isMapVote(mode, room) && userHasVotingPrivlege){
		if (sessionManagement.whichTeamisAllowedToVote(key, room) == constants.TEAM_A && !sessionManagement.hasTeamAVoteBeenCast(intendedRoom)){
			sessionManagement.vote(mode, room, choice1, choice2)
			sessionManagement.teamAHasVoted(room);
			socket.emit("successVote", choice1);
		}
		else if (sessionManagement.whichTeamisAllowedToVote(key, room) == constants.TEAM_B && !sessionManagement.hasTeamBVoteBeenCast(intendedRoom)){
			vote(mode, room, choice1, choice2)
			sessionManagement.teamBHasVoted(room);
			socket.emit("successVote", choice1);
		}
	}
	else if (sessionManagement.isCharacterVote(mode, room) && userHasVotingPrivlege){
		if (whichTeamisAllowedToVote(key, room) == constants.TEAM_A && !sessionManagement.hasTeamAVoteBeenCast(intendedRoom)){ 
			vote(mode, room, choice1, choice2)
			sessionManagement.teamAHasVoted(room);
			socket.emit("successVote", choice2);
		}
		else if (sessionManagement.whichTeamisAllowedToVote(key, room) == constants.TEAM_B && !sessionManagement.hasTeamBVoteBeenCast(intendedRoom)){
			vote(mode, room, choice1, choice2)
			sessionManagement.teamBHasVoted(room);
			socket.emit("successVote", choice2);
		}
	}
	
	
	//reset for next round of voting
	sessionManagement.startNewVotingRoundIfNeeded(intendedRoom);
	sessionManagement.allowOtherTeamToVote(key, room);
	sessionManagement.releaseVotingLock(intendedRoom);
	
  });
  
  socket.on('join', function(msg){
    console.log('message: ' + msg);
  });
});
    
app.get('/', function(req, res){
  res.sendFile(__dirname + '\\public\\index.htm');
});

/* Mode must be either character or map; it is used to determine which data set to use.
 KeyA and KeyB are the portions of the identifier sent to the client for team a and b that the user must submit when voting for verification
 Phrase is the encrypting string */
app.get('/chat/:game/:type', function(req, res){
	var data;
	if (req.params["type"] == "Maps"){
		var data = dataManagement.getGameDetails(connection, req.params['game']).then(function(data){
			return data;
		});
		dataManagement.getMaps(connection, req.params['game']).then(function(data){
			sessionManagement.createRoom(req.params["type"], rooms, data);
			console.log(rooms);
			res.sendFile(__dirname + '/chat.htm');
			return data;
		});
	} else if (req.params["type"] == "Characters"){
		dataManagement.getCharacters(connection, req.params['game']).then(function(data){
			sessionManagement.createRoom(req.params["mode"], rooms, data);
			res.sendFile(__dirname + '/chat.htm');
		}
		
	);
}});
app.get('/chat/:room/:team', function(req, res){
  var user = uuid();
  var join = {"team": req.params["team"], 
			 "room": req.params["room"]};
  res.sendFile(__dirname + '/chat.htm');
});

//Deprecated to be removed
app.post('/vote', function(req, res){
	var key = req.params["key"];
	var room = req.params["room"];
	var mode = req.params["mode"];

	if (!sessionManagement.isRequestValid(rooms[room], key, mode)){
		res.sendFile(__dirname + '/index.htm');
	}
	var userHasVotingPrivlege = sessionManagement.acquireVotingLock(rooms[room]);
	if (sessionManagement.isMapVote(mode, room) && userHasVotingPrivlege){
		if (sessionManagement.whichTeamisAllowedToVote(key, room) == constants.TEAM_A && !sessionManagement.hasTeamAVoteBeenCast(rooms[room])){
			sessionManagement.vote(mode, room, choice1, choice2)
			sessionManagement.teamAHasVoted(room);
		}
		else if (sessionManagement.whichTeamisAllowedToVote(key, room) == constants.TEAM_B && !sessionManagement.hasTeamBVoteBeenCast(rooms[room])){
			vote(mode, room, choice1, choice2)
			sessionManagement.teamBHasVoted(room);
		}
	}
	else if (sessionManagement.isCharacterVote(mode, room) && userHasVotingPrivlege){
		if (whichTeamisAllowedToVote(key, room) == constants.TEAM_A && !hasTeamAVoteBeenCast(rooms[room])){ 
			vote(mode, room, choice1, choice2)
			sessionManagement.teamAHasVoted(room);
		}
		else if (sessionManagement.whichTeamisAllowedToVote(key, room) == constants.TEAM_B && !sessionManagement.hasTeamBVoteBeenCast(rooms[room])){
			vote(mode, room, choice1, choice2)
			sessionManagement.teamBHasVoted(room);
		}
	}
	
	
	//reset for next round of voting
	sessionManagement.startNewVotingRoundIfNeeded(rooms[room]);
	sessionManagement.allowOtherTeamToVote(key, room);
	sessionManagement.releaseVotingLock(res, rooms[room]);
	res.sendFile(__dirname + '/index.htm');
});
//end
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
	sessionManagement.login(connection, "admin", "admin");
	dataManagement.getGames(connection).then(function(data){
		res.send(data);
	});
	
});
app.post('/login', function(req, res) {
	sessionManagement.login(connection, req.body.name, req.body.password);
});
app.get('/details/:game', function(req, res){
	sessionManagement.login(connection, "admin", "admin");
	dataManagement.getGameDetails(connection, req.params['game']).then(function(data){
		return data;
	});
	
});
app.get('/maps/:game', function(req, res){
	sessionManagement.login(connection, "admin", "admin");
	dataManagement.getMaps(connection, req.params['game']).then(function(data){
		return data;
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