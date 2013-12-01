// var http = require('http');
var util = require('util');
var connect = require('connect');
var port = process.env.PORT || 5000;

var app = connect.createServer(
	connect.static(__dirname + '/public')
	).listen(port);

util.log('server running at port: ' + port);

var io = require('socket.io').listen(app);

var numPlayers = 0;
var player1Name;
var player2Name;
var users = []; // useful?

io.set('log level', 2);
io.sockets.on('connection', function(clientmessage) {
	util.log('the user ' + clientmessage.id + ' has just connected');

	clientmessage.on('player name', function(data) {
		numPlayers++;
		// save user information as an object; don't know if will be useful
		users.push({number: numPlayers, id: clientmessage.id, name: data.name});
		util.log('there are ' + numPlayers + ' users ready');
		util.log(data.name + ' just pushed the button');

		// sent that player's number back to him/her immediately
		clientmessage.emit('player number', numPlayers);

		// if the first player, send that player number back to the player who pushed the button
		if (users.length == 1) {
			player1Name = data.name;
		} else if (users.length ==2) {
			player2Name = data.name;
			// if this is the second player, send both names to both players
			io.sockets.emit('both names', {
				name1: player1Name, 
				name2: player2Name
			})
		}
	})
})

