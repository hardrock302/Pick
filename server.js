const app = require(constants.EXPRESS)();
const http = require(constants.HTTP).Server(app);
const alfresco = require(constants.ALFRESCO_JS);
const constants = require(constants.CONSTANTS_FILE);
var io = require(constants.SOCKET_IO)(http);
var Room = require(constants.ROOM_FILE);  
var uuid = require(CONSTANTS.NODE_UUID); 
var bodyParser = require(CONSTANTS.BODY_PARSER);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies 
var people = {};  
var rooms = {};  
var usernames = [];
var items = []
var CryptoJS = require(constants.CRPYTO);
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
		var mode = req.params[constants.MODE];
		
		delete room[mode[req.params[constants.CHOICE1]]];
		if (req.params[constants.CHOICE2] != null){
			delete room[mode[req.params[constants.CHOICE2]]];
		}
}
app.get(constants.DEFAULT_URL, function(req, res){
  res.sendFile(__dirname +constants.LOGIN_URL);
});
app.get('constants.CHAT_URL, function(req, res){
  var user = uuidv4();
  var roomId = uuidv4();
  var room = {
	constants.KEY_A: uuidv4(),
	constants.KEY_B: uuidv4(),
	constants.MODE: req.params[constants.MODE];
	constants.HASH_A:"",
	constants.HASH_B:"",
	constants.SERVER_KEY:"",
	constants.MAPS:{},
	constants.CHAR:{}
	constants.VOTE_CAST_A: false,
	constants.VOTE_CAST_B:false
  }
  room[constants.SERVER_KEY] = uuidv4();
  room[constants.HASH_A]  = CryptoJS.AES.encrypt(JSON.stringify(room[constants.KEY_A]), room[constants.SERVER_KEY]);
  room[constants.HASH_B]  = CryptoJS.AES.encrypt(JSON.stringify(room[constants.KEY_B]), room[constants.SERVER_KEY]);
  rooms.push(room);
  res.sendFile(__dirname + constants.HOME);
});
app.get(constants.CREATE_ROOM_URL, function(req, res){
  var user = uuidv4();
  var join = {constants.USER: user, 
			constants.ROOM: room };
  res.sendFile(__dirname + constants.HOME);
});
app.get(constants.JOIN_ROOM_URL, function(req, res){
  var user = uuidv4();
  var join = {constants.USER: user, 
			constants.ROOM: room };
  rooms.push();
  res.sendFile(__dirname + constants.HOME);
});
app.post(constants.VOTE_URL, function(req, res){
	var key = req.params[constants.KEY];
	var room = req.params[constants.ROOM];
	var mode = req.params[constants.MODE]
	if(rooms[room] == null && key == null && (mode != constants.MAPS && room != constants.CHAR) && rooms[room[constants.VOTE_CAST_A]] == false || rooms[room[constants.voteCastB]] == false){
		res.sendFile(__dirname + constants.HOME);
	}
	//compute key and compare for security check
	var userHash = CryptoJS.AES.encrypt(JSON.stringify(room[constants.KEY]), room[constants.SERVER_KEY]);
	if(room[constants.VOTE_CAST_A] && room[constants.VOTE_CAST_B]){
		room[constants.VOTE_CAST_A] = false;
		room[constants.VOTE_CAST_B] = false;
	}
	if (mode == constants.MAP){
		if (rooms[room].hashKeyA == userHash && room[constants.VOTE_CAST_A] == false){
			vote(mode, room, choice1, choice2)
			room[constants.VOTE_CAST_A] = true;
		}
		else if (rooms[room].hashkeyB == userHash && room[constants.VOTE_CAST_B] == false){
			vote(mode, room, choice1, choice2)
			room[constants.VOTE_CAST_B] = true;
		}
	}
	else if (mode == constants.CHAR){
		if (rooms[room].hashKeyA == userHash && room[constants.VOTE_CAST_A] == false){ 
			vote(mode, room, choice1, choice2)
			room[constants.VOTE_CAST_A] = true;
		}
		else if (rooms[room].hashKeyB == userHash && room[constants.VOTE_CAST_B] == false){
			vote(mode, room, choice1, choice2)
			room[constants.VOTE_CAST_B] = true;
		}
	}
	res.sendFile(__dirname + constants.HOME);
});
app.post(constants.CREATE_ACCT_URL', function(req, res){
	var nodeId = constants.ALFRESCO_USER_HOME_REF;
	var node = {
		constants.NAME: req.params[constants.NAME_PARAM],
		constants.NODETYPE:constants.ALFRESCO_PERSON
		constants.PASSWORD: req.params[constants.PASS_PARAM],
	};
	connection.core.childAssociationsApi.addNode(nodeId, node, opts).then(function() {
		console.log('API called successfully.');
	}, function(error) {
		console.error(error);
	});
});
app.get(constants.GAMES_URL, function(req, res){
	login(constants.DEFAULT_USER, constants.DEFAULT_PASS);
	connection.search.searchApi.search({
        constants.QRY: {
            constants.QRY: "select cmis:objectId, pb:Name from pb:Game",
            constants.LANG: constants.QRY_LANG
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
app.post(constants.LOGIN_URL, function(req, res) {
	login(req.body.name, req.body.password);
});
app.get(constants.GET_DETAILS_URL, function(req, res){
	login(constants.DEFAULT_USER, constants.DEFAULT_PASS);
		connection.search.searchApi.search({
        constants.QRY: {
            constants.QRY: "select * from pb:Map where pb:parentGame = 'workspace://SpacesStore/" + req.params['game'] +"'",
            constants.LANG: constants.QRY_LANG
			
            }
        }).then(function (data) {
            res.send(data);
        }, function (error) {
            res.send(error);
        });
	
});
app.get(constants.GET_MAPS_IMG_URL, function(req, res){
	login(constants.DEFAULT_USER, constants.DEFAULT_PASS);
		connection.search.searchApi.search({
        constants.QRY: {
            constants.QRY: "select * from cmis:document where IN_FOLDER('workspace://SpacesStore/" + req.params['game'] +"') and cmis:name like '%.png'",
            constants.LANG: constants.QRY_LANG
			
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