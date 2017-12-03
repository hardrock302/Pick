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
});