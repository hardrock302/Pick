module.exports = {
login: function (connection, user, pass){
	connection.login(user, pass).then(function (data) {
	console.log('API called successfully login in  BPM and ECM performed ');
	}, function (error) {
		console.error(error);
	});
},
logout: function (connection){
	 connection.logout().then(function(){
	},function(error){
	});
},
//TODO: validate number of items against allowed votes per round; for example, is this a two pick round and have two valid choices been provided ?
isVoteValid: function(room, choice1, choice2){
	
},

vote: function(mode, room, choice1, choice2){
		var isVoteValid = isVoteValid(room, choice1, choice2);
		
		if(isVoteValid){
			delete room[mode[req.params[constants.CHOICE1]]];
			if (req.params[constants.CHOICE2] != null){
				delete room[mode[req.params[constants.CHOICE2]]];
			}
			return constants.CAST;
		}
		else{
			return constants.FAIL;
		}
},
//Takes user provided key and creates encypted version with server key and phrase then compares to against the server copy of encrypted key for authenricity
whichTeamisAllowedToVote: function (userKey, room){
	if (room["votingTeam"] == constants.TEAM_A && computeKey(room["serverKeyA"], userKey, room["phrase"]) == room["serverEncryptedKeyA"])
		return constants.TEAM_A;
	else if (room["votingTeam"] == constants.TEAM_B && computeKey(room["serverKeyB"], userKey, room["phrase"]) == room["serverEncryptedKeyB"])
		return constants.TEAM_B;
	else
		return constants.FAIL;
},

startNewVotingRoundIfNeeded: function(room){
	//If both teams have voted start new round
	if(room["teamAHasVoted"] && room["teamBHasVoted"]){
		room["teamAHasVoted"] = false;
		room["teamBHasVoted"] = false;
	}
},

encryptKey: function(key, phrase){
	//The key will be created by taking the user key and the server key for the room and encrypting with a string unique to the room
	var CryptoJS = require('crypto-js');
	var cipherText = CryptoJS.AES.encrypt(key, phrase);
	return cipherText;
},
verifyKey: function (serverKey, userKey, votingKey, phrase){
	//Does the provided user key match the unaltered server copy?
	var bytes  = CryptoJS.AES.decrypt(userKey.toString(), phrase);
	var plaintext = bytes.toString(CryptoJS.enc.Utf8);
	console.log(plaintext);
	return (votingKey == (serverKey + userKey));
},
isRequestValid: function(room, key, mode){
	if(room == null || key == null && (mode != constants.MAPS && mode != constants.CHAR)){
		return false;
	}
},
isMapVote: function(mode, room){
	return mode == constants.MAP && room["mode"] == constants.MAP;
},
isCharacterVote: function (mode, room){
	return mode == constants.CHAR && room["mode"] == constants.CHAR;
},
allowOtherTeamToVote: function (key, room){
	if (whichTeamisAllowedToVote(key, room) == constants.TEAM_A)
		room["votingTeam"] = constants.TEAM_B;
	else if (whichTeamisAllowedToVote(key, room) == constants.TEAM_B)
		room["votingTeam"] = constants.TEAM_A;;
},
acquireVotingLock: function(res, room){
	//This is needed so that only one person per team can vote
		if (room["voteInProgress"] == false && whichTeamisAllowedToVote(key, room) == room["votingTeam"]){
			room["voteInProgress"] = true;
			return true;
		}
		else {
			return false;
		}
},
releaseVotingLock: function (room){
		room["voteInProgress"] = false;
},
hasTeamBVoteBeenCast: function(room){
	return room["teamBHasVoted"] == true;
},
hasTeamAVoteBeenCast: function (room){
	return room["teamAHasVoted"] == true;
},
teamAHasVoted: function(room){
	room["teamAHasVoted"] = true;
},
teamBHasVoted: function(room){
	room["teamBHasVoted"] = true;
},
createRoom: function (mode,rooms,data){
  var uuid = require('node-uuid'); 
  var user = uuid();
  var roomId = uuid();
  var room = {
	"userKeyA": uuid(),
	"userKeyB": uuid(),
	"mode": mode,
	"votingRound":"",
	"votingTeam":"", 
	"voteInProgress":false,
	"votingKeyA":"",
	"votingKeyB":"",
	"phrase": uuid(),
	"serverKeyA": uuid(),
	"serverKeyB":uuid(),
	"maps":{},
	"characters":{},
	"teamAHasVoted": false,
	"teamBHasVoted":false,
	"activeUsers":1,
	"teamA":{},
	"teamB":{},
  }
  if (mode == "CHAR"){
	  room["characters"] = data;
  } 
  else if (mode == "MAPS"){
	  room["maps"] = data;
  }
  var encryptedKeyA = this.encryptKey(room["userKeyA"], room["phrase"]);
  var encryptedKeyB = this.encryptKey(room["userKeyB"], room["phrase"]);
  room["votingKeyA"]  = room["serverKeyA"] + room["userKeyA"];
  room["votingKeyB"]  = room["serverKeyB"] + room["userKeyB"];
  room["teamA"] = new Map();
  room["teamB"] = new Map();
  rooms[roomId] = room;
  var userKey = uuid();
  room["teamA"].set(userKey,true);
  var result = {roomId: roomId, userKey:userKey, teamAKey: encryptedKeyA, teamBkey: encryptedKeyB};
  return result;
},
joinRoom: function(rooms, room, user, team){
	var intendedRoom = rooms[room];
	intendedRoom[team].set(user, true);
	intendedRoom["activeUsers"] = intendedRoom["activeUsers"] + 1;
},
deleteRoom: function(rooms, room){
	var intendedRoom = rooms[room];
	if (intendedRoom["activeUsers"] == 0){
		delete rooms[room];
	}
},
leaveRoom: function(rooms, room, user, team){
	var intendedRoom = rooms[room];
	intendedRoom[team].set(user, false);
	delete intendedRoom[user];
	intendedRoom["activeUsers"] = intendedRoom["activeUsers"] - 1;
	if (intendedRoom["activeUsers"] == 0){
		delete rooms[room];
	}
},
refresh: function(rooms, room, dataType){
	var intendedRoom = rooms[room];
	return intendedRoom[dataType]
}
};

