// var http = require('http');
var util = require('util');
var connect = require('connect');
var port = process.env.PORT || 5000;

var app = connect.createServer(
	connect.static(__dirname + '/public')
	).listen(port);

util.log('server running at port: ' + port);

var io = require('socket.io').listen(app);

var users = [];
var names = [];

// io.set('log level', 2);
io.sockets.on('connection', function(socket) {
	users.push(socket.id);
	util.log('the user ' + socket.id + ' has just connected');
	util.log('there are ' + users.length + ' users online right now');
})

io.sockets.on('player name', function(data) {
	util.log('for the love of God, just print something!');
	util.log(data.name + 'just pushed the button');
	// if (names.length < 2) {
	// 	names.push(data);
	// }
})