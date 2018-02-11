var assert = require('assert');
var path = require('path');
var uuid = require('node-uuid'); 
var CryptoJS = require('crypto-js');
var rooms =[];
var roomKey;
const sessionManagement = require("./sessionManagement.js");

describe('Room Tests', function(){
	it('createRoom', function(done){
		roomKey = sessionManagement.createRoom("CHAR", rooms);
		assert(Object.keys(rooms).length > 0);
		//call done at the conclusion of the test
		done();
	});
	it('joinRoom', function(done){
		sessionManagement.joinRoom(rooms, roomKey, "A", "teamA");
		assert(rooms[roomKey]["teamA"].get("A") == true);
		done(); 
	});
	it('vote', function(done){
		roomKey = sessionManagement.createRoom("MAPS", rooms);
		sessionManagement.joinRoom(rooms, roomKey, "A", "teamA");
		rooms[roomKey]["characters"].push("Banana");
		var s = sessionManagement.vote("MAPS", rooms[roomKey], "Banana");
		assert(s == true);
	});
	it('leaveRoom', function(done){
		sessionManagement.joinRoom(rooms, roomKey, "A", "teamA");
		sessionManagement.leaveRoom(rooms, roomKey, "A", "teamA");
		assert(rooms[roomKey]["teamA"].get("A") == false);
		done(); 
	});
});