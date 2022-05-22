const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const PORT = 80;

var identitys = {};

io.on("connection", (socket) => {
	socket.emit("ID", socket.id);

	socket.on("joinRoom", async (roomID, identity) => {
		//identity.sid = socket.id;
		identity.isStreaming = false;
		identitys[socket.id] = identity;
		socket.join(roomID);
		console.log(identity.username + " joined room ", roomID);
		var sockets = await getSocketsOfRoom(roomID);
		socket.emit("membersLoaded", sockets);
	});

	socket.on("getRoomMember", async (roomID, cb) => {
		cb(await getSocketsOfRoom(roomID));
	});

	socket.on("makePeerOffer", (data) => {
		console.log("Peer offer made by", socket.id);
		socket.to(data.roomID).emit("incomingPeerOffer", {
			offer: data.offer,
			offerer: socket.id,
		});
	});

	socket.on("makePeerAnswer", (data) => {
		console.log(data);
		console.log("Peer answer made by", socket.id);
		io.to(data.offerer).emit("incomingPeerAnswer", data.answer);
	});

	socket.on("new-ice-candidate", (data) => {
		console.log("ICE CANDIDATE");
		socket.to(data.roomID).emit("incomingICEcandidate", data.candidate); // wurde von standard-emit zu dem hier geändert, jetzt kein fehler mehr aber ?
	});

	socket.on("newIceCandidate", (data) => {
		//console.log('ICE CANDIDATE', data);
		io.to(data.toSocket).emit("newIceCandidate", data); // wurde von standard-emit zu dem hier geändert, jetzt kein fehler mehr aber ?
	});

	socket.on("peerOffer", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("Peer offer made by", data.fromSocket, " -> ", data.toSocket);
		io.to(data.toSocket).emit("peerOffer", data);
	});

	socket.on("peerAnswer", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("Peer Answer made by", data.fromSocket, " -> ", data.toSocket);
		io.to(data.toSocket).emit("peerAnswer", data);
	});

	socket.on("getStream", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("getStream made by", data.fromSocket, " -> ", data.toSocket);
		io.to(data.toSocket).emit("getStream", data);
	});
	socket.on("chatMSG", (data) => {
		// data = { room: this.id, msg: msg }
		console.log("chatMSG made by", data);
		data.fromSocket = socket.id;
		data.fromIdentity = identitys[socket.id];

		io.to(data.room).emit("chatMSG", data);
	});

	socket.on("memberStartStreaming", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("To Room = ", data);
		identitys[socket.id].isStreaming = true;
		io.sockets.in(data).emit("memberStreamingState", socket.id, identitys[socket.id]);
	});

	socket.on("memberStopStreaming", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("To Room = ", data);
		identitys[socket.id].isStreaming = false;
		io.sockets.in(data).emit("memberStreamingState", socket.id, identitys[socket.id]);
	});
});

io.of("/").adapter.on("create-room", (room) => {
	console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", async (room, id) => {
	var sockets = await getSocketsOfRoom(room);
	if (sockets[0].identity != undefined) {
		io.to(room).emit("memberAdded", sockets, id, identitys[id]);
	}
});

io.of("/").adapter.on("leave-room", async (room, id) => {
	var sockets = await getSocketsOfRoom(room);
	console.log(`socket ${id} has leaved room ${room}`);
	io.to(room).emit('memberRemoved', sockets, id, identitys[id]);
});

//use public folder
app.use(express.static(__dirname + "/public/"));

app.get("/", function (req, res) {
	console.log("get /");
	res.redirect("/rooms/" + uuidv4());
});

app.get("/rooms/:id", function (req, res) {
	res.sendFile(path.join(__dirname + "/public/video.html"));
});

app.get("/testing/rooms/:id", function (req, res) {
	res.sendFile(path.join(__dirname + "/public/video-old.html"));
});

// reference test
app.get("/rooms/reference/:id", function (req, res) {
	res.sendFile(path.join(__dirname + "/public/reference.html"));
});

// reference test
app.get("/reference", function (req, res) {
	res.redirect("/rooms/reference/" + uuidv4());
});

server.listen(PORT, () => {
	console.log("Server started on port " + PORT);
});

function getSocketsOfRoom(roomID) {
	return new Promise(async (resolve, reject) => {
		var sockets = await io.in(roomID).fetchSockets();
		var socketids = [];
		for (let index = 0; index < sockets.length; index++) {
			socketids.push({ socket: sockets[index].id, identity: identitys[sockets[index].id] });
		}
		resolve(socketids);
	});
}
