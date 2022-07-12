const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const {
	v4: uuidv4
} = require("uuid");
var sass = require('node-sass');
fs = require('fs');

const PORT = 80;

var identitys = {};
var roomChatMsgs = {};
var rooms = {};

class Room {
	constructor(id, name, pw) {
		this.id = id
		this.name = name
		this.admins = []
		this.members = []
		this.blocked = []
		this.identitys = {}
		this.password = pw
	}
	addMember(sid, identity) {
		this.members.push()
	}
	removeMember(sid, identity) {
		if (this.members[sid]) {

		} else {
			console.log('Member not in room')
		}
	}
	changeMember(sid, identity) {

	}
	isMember(id) {
		if (this.members.indexOf(id) > -1) {
			return true
		}
		return false
	}
	isAdmin(id) {
		if (this.admins.indexOf(id) > -1) {
			return true
		}
		return false
	}
	isBlocked(id) {
		if (this.blocked.indexOf(id) > -1) {
			return true
		}
		return false
	}
	sendMsg(msg) {
		var data = {
			room: this.id,
			msg: msg
		}
		socket.emit('chatMSG', data);
	}
}

const bcrypt = require('bcrypt'); //Importing the NPM bcrypt package.
const saltRounds = 10; //We are setting salt rounds, higher is safer.
const myPlaintextPassword = 's0/\/\P4$$w0rD'; //Unprotected password

// JOIN Room Codes 

// 0 beigetreten
// 1 room not found
// 2 
// 3 room blocked you 
// 4 room password wrong
// 5 error


io.on("connection", (socket) => {
	socket.emit("ID", socket.id);

	socket.on("joinRoom", async (roomID, identity, pw, cb) => {
		//identity.sid = socket.id;
		try {
			console.log("joinRoom", roomID, identity);
			identity.isStreaming = false;
			identity.thumbnail = null;
			var room = rooms[roomID]
			var userIsAdmin = isAdmin(roomID, identity.id);
			var userIsBlocked = isBlocked(roomID, identity.id);
			var userIsMember = isMember(roomID, identity.id);

			identity.isAdmin = userIsAdmin;

			if (!userIsAdmin && userIsBlocked) {
				cb({
					room: roomID,
					joined: false,
					code: 3,
					msg: 'You are blocked from this room'
				})
				return;
			}

			if (!rooms[roomID]) {
				cb({
					room: roomID,
					joined: false,
					code: 1,
					msg: 'Room not found'
				})
			} else {
				console.log("room is passworded");
				console.log("bcrypt.compare = ", await bcrypt.compare(pw, room.password));
				console.log("userIsMember = ", userIsMember);
				console.log("userIsAdmin = ", userIsAdmin);
				console.log("userIsAdmin || userIsMember || await bcrypt.compare(pw, room.password) = ", userIsAdmin || userIsMember || await bcrypt.compare(pw, room.password));

				if (userIsAdmin || userIsMember || await bcrypt.compare(pw, room.password)) {
					console.log("Raum Beitreten", roomID, identity);
					socket.join(roomID);
					cb({
						room: roomID,
						joined: true,
						code: 0,
						msg: 'Room joined',
						isAdmin: userIsAdmin
					})
					identitys[socket.id] = identity;
					var sockets = await getSocketsOfRoom(roomID);
					socket.emit("membersLoaded", sockets);
					socket.emit("loadChatMsgs", roomChatMsgs[roomID]);
					console.log("Raum identitys = ", identitys[socket.id]);
					console.log("Raum Beitreten", roomID, identity);
				} else {
					cb({
						room: roomID,
						joined: false,
						code: 4,
						msg: 'Room password incorrect'
					})
				}
			}
		} catch (error) {
			console.log("JOIN ROOM error = ", error);
			cb({
				room: roomID,
				joined: false,
				code: 5,
				msg: error
			})
		}

	});

	// 0 erstellt
	// 1 room existiert bereits
	// 2 
	// 3 
	// 4 
	// 5 error

	socket.on("createRoom", async (roomID, identity, pw, roomname, cb) => {
		//identity.sid = socket.id;
		try {
			console.log("createRoom", roomID, identity);

			if (!rooms[roomID]) {
				var hpw = await bcrypt.hash(pw, saltRounds);
				console.log(" pw", pw);
				console.log("hashed pw", hpw);
				rooms[roomID] = new Room(roomID, roomname, hpw)

				rooms[roomID].admins.push(identity.id)
				console.log("new room", rooms[roomID]);
				cb({
					room: roomID,
					created: true,
					code: 0,
					msg: 'Room created'
				})

			} else {
				cb({
					room: roomID,
					created: false,
					code: 1,
					msg: 'Room already exist'
				})
			}

		} catch (error) {
			console.log("create Room error = ", error);
			console.log("create Room error = ", cb);
			cb({
				room: roomID,
				created: false,
				code: 5,
				msg: error
			})
		}

	});

	socket.on("getRoomMember", async (roomID, cb) => {
		cb(await getSocketsOfRoom(roomID));
	});
	socket.on("getRoomMemberThumbnails", async (roomID, cb) => {
		cb(await getSocketsThumbnailsOfRoom(roomID));
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

	socket.on("chatMSG", async (data) => {
		// data = { room: this.id, msg: msg }
		//console.log("chatMSG made by", data);
		data.fromSocket = socket.id;
		data.fromIdentity = identitys[socket.id];

		if (rooms[data.room].members.indexOf(data.fromSocket) > -1) {
			console.log("from user is in room");
		} else {
			console.log("from user is not in room");
		}


		data.time = new Date().getTime();
		data.msg = await parseText(data.msg)
		console.log("chatMSG made by", data);
		if (roomChatMsgs[data.room]) {
			roomChatMsgs[data.room].push(data);
		} else {
			roomChatMsgs[data.room] = [data];
		}

		//console.log(roomChatMsgs);
		io.to(data.room).emit("chatMSG", data);
	});

	socket.on("memberStartStreaming", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		//console.log("To Room = ", data);
		identitys[socket.id].isStreaming = true;
		io.sockets.in(data).emit("memberStreamingState", socket.id, identitys[socket.id]);
	});

	socket.on("memberChangeIdentity", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		try {
			console.log("To Room memberChangeIdentity = ", data);
			console.log();
			identitys[socket.id].username = data.username;
			identitys[socket.id].avatar = data.avatar;
			if (roomChatMsgs[data.room]) {
				for (let index = 0; index < roomChatMsgs[data.room].length; index++) {
					if (roomChatMsgs[data.room][index].fromSocket == socket.id) {
						roomChatMsgs[data.room][index].fromIdentity = identitys[socket.id];
					}
				}
			}
			io.sockets.in(data.room).emit("memberStreamingState", socket.id, identitys[socket.id]);
		} catch (error) {
			console.log("memberChangeIdentity error = ", error);
		}

	});

	socket.on("memberStopStreaming", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("To Room = ", data);
		identitys[socket.id].isStreaming = false;
		io.sockets.in(data).emit("memberStreamingState", socket.id, identitys[socket.id]);
	});

	socket.on("streamThumbnail", (data) => {
		//console.log("streamThumbnail = ", data);
		identitys[socket.id].thumbnail = data.data
		//io.sockets.in(data.room).emit("memberStreamingState", socket.id, identitys[socket.id]);
	});
	socket.on("load_ids", (roomID, cb) => {
		console.log("load_ids = ");
		cb(getSocketsOfRoom(roomID));
	});

	socket.on("kickMember", (sid, roomID) => {
		console.log("kickMember = ", sid);
		//console.log("kickMember = ", io.sockets);
		//socket.clients[id].connection.end();

		console.log("kickMember = ", identitys[sid]);
		var isA = isAdmin(roomID, identitys[socket.id].id)
		console.log("is admin = ", isA);
		if (isA) {
			console.log(io.sockets.sockets.get(sid));
			io.sockets.sockets.get(sid).leave(roomID)
			rooms[roomID].members.splice(rooms[roomID].members.indexOf(sid), 1);
			rooms[roomID].admins.splice(rooms[roomID].admins.indexOf(sid), 1);
			//room[roomID].blocked.push(sid);
			//io.sockets.sockets[sid].leave(roomID)
		}
	});

	socket.on("banMember", (sid, roomID) => {
		console.log("banMember = ", sid);
		//console.log("kickMember = ", io.sockets);
		//socket.clients[id].connection.end();

		console.log("banMember = ", identitys[sid]);
		var isA = isAdmin(roomID, identitys[socket.id].id)
		console.log("is admin = ", isA);
		if (isA) {
			console.log(io.sockets.sockets.get(sid));
			io.sockets.sockets.get(sid).leave(roomID)
			rooms[roomID].members.splice(rooms[roomID].members.indexOf(sid), 1);
			rooms[roomID].admins.splice(rooms[roomID].admins.indexOf(sid), 1);
			rooms[roomID].blocked.push(sid);
			//io.sockets.sockets[sid].leave(roomID)
		}
	});

	socket.on("makeAdmin", (sid, roomID) => {

		var isA = isAdmin(roomID, identitys[socket.id].id)

		if (isA) {

			rooms[roomID].admins.push(identitys[sid].id);
			identitys[sid].isAdmin = true;
			io.sockets.in(roomID).emit("memberStreamingState", sid, identitys[sid]);
		}
	});

	socket.on("removeAdmin", (sid, roomID) => {

		var isA = isAdmin(roomID, identitys[socket.id].id)

		if (isA) {

			rooms[roomID].admins.splice(rooms[roomID].admins.indexOf(identitys[sid].id), 1);
			identitys[sid].isAdmin = false;
			io.sockets.in(roomID).emit("memberStreamingState", sid, identitys[sid]);
		}
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


app.get("/", async function (req, res) {
	console.log("get /");
	//await renderSCSS()
	res.redirect("/rooms/" + uuidv4());
});

app.get("/css/dist/main.css", async function (req, res) {
	console.log("get /css/dist/main.css", mainCSS);
	//mainCSS
	res.send(mainCSS);
});

app.get("/rooms/:id", async function (req, res) {
	//await renderSCSS()

	res.sendFile(path.join(__dirname + "/public/video.html"));
});

app.get("/rooms", async function (req, res) {
	//await renderSCSS()
	res.redirect("/rooms/" + uuidv4());
	//res.sendFile(path.join(__dirname + "/public/video.html"));
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
			socketids.push({
				socket: sockets[index].id,
				identity: identitys[sockets[index].id]
			});
		}
		resolve(socketids);
	});
}

function getSocketsThumbnailsOfRoom(roomID) {
	return new Promise(async (resolve, reject) => {
		var sockets = await io.in(roomID).fetchSockets();
		var socketids = [];
		for (let index = 0; index < sockets.length; index++) {
			socketids.push({
				socket: sockets[index].id,
				thumbnail: identitys[sockets[index].id].thumbnail
			});
		}
		resolve(socketids);
	});
}

async function parseText(message) {
	var urls = detectURLs(message)
	console.log(urls);
	if (urls) {
		for (let index = 0; index < urls.length; index++) {
			const element = urls[index];
			console.log("element", element);
			try {
				var type = await getContentType(element)
				var html = renderTypeHTML(type)
				message = message.replace(element, html)
			} catch (error) {
				console.log("error for ", error);
			}



		}
	}
	return message
}

function renderTypeHTML(type) {
	var ret = ""
	switch (type.content.type) {
		case 'video':
			console.log("renderTypeHTML video");
			ret = `<video controls src="${type.url}"></video>`
			break;
		case 'image':
			console.log("renderTypeHTML image");
			ret = `<a href="${type.url}" target="_blank" rel="noopener noreferrer"><img src="${type.url}"></a>`
			break;
		case 'text':
			console.log("renderTypeHTML text");
			ret = `<a href="${type.url}" target="_blank" rel="noopener noreferrer">${type.url}</a>`
			break;
		default:
			break;
	}
	return ret;
}

function detectURLs(message) {
	var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
	return message.match(urlRegex)
}

function isValidURL(str) {
	console.log("isValidURL", str);
	var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	return !!pattern.test(str);
}

function matchYoutubeUrl(url) {
	var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	if (url.match(p)) {
		return url.match(p)[1];
	}
	return false;
}

function youtubeUrlParser(url) {

	var timeToSec = function (str) {
		var sec = 0;
		if (/h/.test(str)) {
			sec += parseInt(str.match(/(\d+)h/, '$1')[0], 10) * 60 * 60;
		}
		if (/m/.test(str)) {
			sec += parseInt(str.match(/(\d+)m/, '$1')[0], 10) * 60;
		}
		if (/s/.test(str)) {
			sec += parseInt(str.match(/(\d+)s/, '$1')[0], 10);
		}
		return sec;
	};

	var videoId = /^https?\:\/\/(www\.)?youtu\.be/.test(url) ? url.replace(/^https?\:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, "$2") : url.replace(/.*\?v\=([\w-]{11}).*/, "$1");
	var videoStartTime = /[^a-z]t\=/.test(url) ? url.replace(/^.+t\=([\dhms]+).*$/, '$1') : 0;
	var videoStartSeconds = videoStartTime ? timeToSec(videoStartTime) : 0;
	var videoShowRelated = ~~/rel\=1/.test(url);

	return {
		id: videoId,
		startString: videoStartTime,
		startSeconds: videoStartSeconds,
		showRelated: videoShowRelated
	};

}; // youtubeParser();


async function getContentType(url) {
	return new Promise(async function (resolve, reject) {
		console.log("getContentType = ", url);

		/* const myURL = new URL(url);

		console.log("myURL", myURL);
		const res1 = await fetch(myURL, { method: 'HEAD' });
		console.log("myURL", res1.headers.get("content-type")); */

		var res;
		try {
			res = await fetch(url, {
				method: 'HEAD'
			});
			if (res.ok) {
				var ct = res.headers.get("content-type");
				var index = ct.indexOf(";");
				var contentType
				if (index > 0) {
					contentType = ct.substring(0, index);
				} else {
					contentType = ct.substring(0, ct.length);
				}
				var splittedType = contentType.split('/');
				let charset = ct.substring(index + 1, ct.length).split("=")[1];
				var d = {
					url: url,
					content: {
						type: splittedType[0],
						format: splittedType[1]
					},
					charset: charset
				};
				resolve(d);
			} else {
				reject(res.status);
			}
		} catch (error) {
			console.log("error", error);
			reject(null);

		}


	})
}

function isAdmin(roomid, userid) {
	console.log("isAdmin", roomid, userid);
	var room = rooms[roomid];
	if (room) {
		if (room.admins.indexOf(userid) > -1) {
			return true;
		}
	}
	return false;
}

function isMember(roomid, userid) {
	console.log("isMember", roomid, userid);
	var room = rooms[roomid];
	if (room) {
		if (room.members.indexOf(userid) > -1) {
			return true;
		}
	}
	return false;
}

function isBlocked(roomid, userid) {
	console.log("isBlocked", roomid, userid);
	var room = rooms[roomid];
	if (room) {
		if (room.blocked.indexOf(userid) > -1) {
			return true;
		}
	}
	return false;
}

// SCSS Compiler and Reloader 
var mainCSS = ""
var sassFiles = ['main'];
async function renderSCSS(reloadClients) {
	return new Promise(async function (resolve, reject) {
		for (const key in sassFiles) {
			const element = path.join(__dirname, 'public', 'css', sassFiles[key] + '.scss');
			try {
				sass.render({
					file: element,
				}, function (err, result) {
					if (err) {
						console.log("err", err.formatted);
						//reject(err);
					} else {
						console.log('SCSS compiled!');
						fs.writeFile(path.join(__dirname, 'public', 'css', 'dist', sassFiles[key] + '.css'), result.css, function (err) {
							//

							if (err) {
								console.log('SCSS File write to Disk Error = ', err);
							} else {
								if (reloadClients) {
									io.emit('reloadCSS');
								}
								resolve(result);
							}
						});

					}
				});
			} catch (error) {
				console.log("error", error);
			}
		}
	})
}

renderSCSS()

var sassWatcherFiles = ['vars', 'main', 'mediaqueries'];

function watchSCSS() {
	for (const key in sassWatcherFiles) {
		const element = path.join(__dirname, 'public', 'css', sassWatcherFiles[key] + '.scss');
		console.log("watchSCSS", element);
		fs.watchFile(element, function (curr, prev) {
			renderSCSS(true);
		});
	}
}

watchSCSS()