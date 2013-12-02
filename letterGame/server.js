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

	// if Player 1 has already signed up by the time
	// Player 2 connects, give Player 1's name to Player 2
	if (numPlayers == 1) {
		clientmessage.emit('player one assigned', users[0].name);
	}

	// when one of the clients hits the button
	clientmessage.on('player name', function(data) {
		numPlayers++;
		// save user information as an object; don't know if will be useful
		users.push({number: numPlayers, id: clientmessage.id, name: data.name});
		util.log('there are ' + numPlayers + ' users ready');
		util.log(data.name + ' just pushed the button');

		// sent that player's number back to him/her immediately
		clientmessage.emit('assign number', numPlayers);

		// if player 2 is already connected, but hasn't yet pressed the button,
		// send player 1's name back to him/her
		if (numPlayers == 1) {
			clientmessage.broadcast.emit('player one assigned', data.name);
		}

		// if the first player, send that player number back to the player who pushed the button
		if (users.length == 1) {
			player1Name = data.name;
		} else if (users.length == 2) {
			player2Name = data.name;
			// if this is the second player, send both names to both players
			io.sockets.emit('both names', {
				name1: player1Name, 
				name2: player2Name
			})
		}
	})

	clientmessage.on('game data', function(data) {
		// // let's just take a look at some of it
		// for (var i = 0; i < data.length; i++) {
		// 	util.log('Data for [' + i + ']: x: ' + data[i].x + ', y: ' + data[i].y + ', w: ' + data[i].w);
		// }

		// let's send it right back to the other player
		clientmessage.broadcast.emit('enemy data', data);

	})
})