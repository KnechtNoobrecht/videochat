const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const PORT = 80;

io.on('connection', (socket) => {
	socket.emit('ID', socket.id);

	socket.on('joinRoom', (roomID) => {
		socket.join(roomID);
		console.log('Subscribed', socket.id, 'to room', roomID);
	});

	socket.on('makePeerOffer', (data) => {
		console.log('Peer offer made by', socket.id);
		socket.to(data.roomID).emit('incomingPeerOffer', { offer: data.offer, offerer: socket.id });
	});

	socket.on('makePeerAnswer', (data) => {
		console.log(data);
		console.log('Peer answer made by', socket.id);
		io.to(data.offerer).emit('incomingPeerAnswer', data.answer);
	});

	socket.on('new-ice-candidate', (data) => {
		console.log('ICE CANDIDATE');
		socket.to(data.roomID).emit('incomingICEcandidate', data.candidate); // wurde von standard-emit zu dem hier geändert, jetzt kein fehler mehr aber ?
	});

	socket.on('newIceCandidate', (data) => {
		console.log('ICE CANDIDATE');
		io.to(data.socketid).emit('newIceCandidate', data); // wurde von standard-emit zu dem hier geändert, jetzt kein fehler mehr aber ?
	});

	socket.on('peerOffer', (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log('Peer offer made by');
		io.to(data.toSocket).emit('peerOffer', data);
	});

	socket.on('peerAnswer', (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log('Peer offer made by');
		io.to(data.toSocket).emit('peerAnswer', data);
	});
});

io.on('joinRoom', (socket, roomID) => {
	console.log(socket, roomID);
});

//use public folder
app.use(express.static(__dirname + '/public/'));

app.get('/', function(req, res) {
	res.redirect('/rooms/' + uuidv4());
});

app.get('/rooms/:id', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/video.html'));
});

// reference test
app.get('/test', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/reference.html'));
});

server.listen(PORT, () => {
	console.log('Server started on port ' + PORT);
});
