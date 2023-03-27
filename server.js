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
const multer = require('multer')
const upload = multer({ dest: 'multerTemp/' })
//const upload = multer({ dest: 'multerTemp/', limits: { fileSize: 10485760 } })

const bcrypt = require('bcrypt'); //Importing the NPM bcrypt package.
const saltRounds = 10; //We are setting salt rounds, higher is safer.

const PORT = process.env.PORT || 6001;

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
		this.msgs = []
	}
	addMember(sid, identity) {
		console.log('addMember');
		console.log(sid, identity);
		this.identitys[sid] = identity;
		this.members.push(identity.id);
	}
	removeMember(sid) {
		console.log('removeMember');
		console.log(sid);
		if (this.members[sid]) {
			delete this.members[this.identitys[sid].id];
			delete this.identitys[sid];

		} else {
			console.log('Member not in room')
		}
	}
	changeMember(sid, identity) { }
	isMember(id) {

		if (this.members.indexOf(id) > -1) {
			console.log(id, 'isMember');
			return true
		}
		console.log(id, 'is not member');
		return false
	}
	isAdmin(id) {
		if (this.admins.indexOf(id) > -1) {
			console.log(id, 'isAdmin');
			return true
		}
		console.log(id, 'is not admin');
		return false
	}
	isBlocked(id) {
		console.log('this.blocked= ', this.blocked);
		console.log('id= ', id);
		if (this.blocked.indexOf(id) > -1) {
			console.log(id, 'isBlocked');
			return true
		}
		console.log(id, 'is not blocked');
		return false
	}
	sendMsg(msg) {
		var data = {
			room: this.id,
			msg: msg,
            attachments:attachments
		}
		socket.emit('chatMSG', data);
	}
}


// JOIN Room Codes 

// 0 beigetreten
// 1 room not found
// 2 
// 3 room blocked you 
// 4 room password wrong
// 5 error


io.on("connection", (socket) => {
	//socket.emit("ID", socket.id);

	socket.on("joinRoom", async (roomID, identity, pw, cb) => {
		//identity.sid = socket.id;
		try {
			//console.log("joinRoom", roomID, identity.username);
			console.log(`User ${identity.username} is trying to join room ${roomID}`);
			identity.isStreaming = false;
			identity.thumbnail = null;
			var room = rooms[roomID]

			if (!room) {
				cb({
					room: roomID,
					joined: false,
					code: 1,
					msg: 'Room not found'
				})

			} else {

				var userIsAdmin = room.isAdmin(identity.id);
				var userIsBlocked = room.isBlocked(identity.id);
				var userIsMember = room.isMember(identity.id);

				identity.isAdmin = userIsAdmin;

				console.log('User trying to join room is admin? = ', userIsAdmin, ' // is user blocked? = ', userIsBlocked);
				console.log('!userIsAdmin && userIsBlocked = ', !userIsAdmin && userIsBlocked);

				if (!userIsAdmin && userIsBlocked) {
					cb({
						room: roomID,
						joined: false,
						code: 3,
						msg: 'You are blocked from this room'
					})
					return;
				}


				if (userIsAdmin || userIsMember || await bcrypt.compare(pw, room.password)) {
					socket.join(roomID);
					cb({
						room: roomID,
						joined: true,
						code: 0,
						msg: 'Room joined',
						isAdmin: userIsAdmin
					})

					rooms[roomID].addMember(socket.id, identity)
					var sockets = await getSocketsOfRoom(roomID);
					socket.emit("membersLoaded", sockets);
					socket.emit("loadChatMsgs", roomChatMsgs[roomID]);
					console.log(`User ${identity.username} joined room ${roomID}`);
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
			console.log(`User ${identity.username} try to create room ${roomID}`);

			if (!rooms[roomID]) {
				var hpw = await bcrypt.hash(pw, saltRounds);
				rooms[roomID] = new Room(roomID, roomname, hpw)
				rooms[roomID].admins.push(identity.id)

				cb({
					room: roomID,
					created: true,
					code: 0,
					msg: 'Room created'
				})

				console.log(`User ${identity.username} created room ${roomID}`);
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

	socket.on("getRooms", (cb) => {
		var temp_rooms = [];
		for (const key in rooms) {
			if (Object.hasOwnProperty.call(rooms, key)) {
				const element = rooms[key];
				var temp_element = {
					id: element.id,
					name: element.name,
					admins: element.admins,
					members: element.members,
					blocked: element.blocked,
					identitys: element.identitys
				}
				temp_rooms.push(temp_element);
			}
		}
		console.log(temp_rooms);
		cb(temp_rooms)
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
		data.fromIdentity = rooms[data.room].identitys[socket.id];

		if (rooms[data.room].members.indexOf(data.fromSocket) > -1) {
			console.log("from user is in room");
		} else {
			console.log("from user is not in room");
		}


		data.time = new Date().getTime();
		data.msg = await parseText(data.msg)
		data.id = uuidv4();
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
		console.log("To Room = ", data);
		rooms[data].identitys[socket.id].isStreaming = true;
		io.sockets.in(data).emit("memberStreamingState", socket.id, rooms[data].identitys[socket.id]);
	});

	socket.on("memberChangeIdentity", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		try {
			console.log("To Room memberChangeIdentity = ", data);
			console.log();
			rooms[data.room].identitys[socket.id].username = data.username;
			rooms[data.room].identitys[socket.id].avatar = data.avatar;
			if (roomChatMsgs[data.room]) {
				for (let index = 0; index < roomChatMsgs[data.room].length; index++) {
					if (roomChatMsgs[data.room][index].fromSocket == socket.id) {
						roomChatMsgs[data.room][index].fromIdentity = rooms[data.room].identitys[socket.id];
					}
				}
			}
			io.sockets.in(data.room).emit("memberStreamingState", socket.id, rooms[data.room].identitys[socket.id]);
		} catch (error) {
			console.log("memberChangeIdentity error = ", error);
		}

	});

	socket.on("memberStopStreaming", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		//console.log("To Room = ", data);
		rooms[data].identitys[socket.id].isStreaming = false;
		io.sockets.in(data).emit("memberStreamingState", socket.id, rooms[data].identitys[socket.id]);
	});

	socket.on("streamThumbnail", (data) => {
		//console.log("streamThumbnail = ", data);
		rooms[data.room].identitys[socket.id].thumbnail = data.data
		io.sockets.in(data.room).emit("memberStreamingState", socket.id, rooms[data.room].identitys[socket.id]);
	});

	socket.on("load_ids", (roomID, cb) => {
		console.log("load_ids = ");
		cb(getSocketsOfRoom(roomID));
	});

	socket.on("kickMember", (sid, roomID) => {
		var room = rooms[roomID]
		var isA = room.isAdmin(room.identitys[socket.id].id);
		console.log("kickMember = ", room.identitys[sid]);
		if (isA) {
			console.log(io.sockets.sockets.get(sid));
			io.sockets.sockets.get(sid).leave(roomID)
			rooms[roomID].members.splice(rooms[roomID].members.indexOf(sid), 1);
			rooms[roomID].admins.splice(rooms[roomID].admins.indexOf(sid), 1);
		}
	});

	socket.on("banMember", (sid, roomID) => {
		var room = rooms[roomID]
		var isA = room.isAdmin(room.identitys[socket.id].id);
		console.log("banMember = ", room.identitys[sid]);
		if (isA) {
			io.to(sid).emit("ban");
			io.sockets.sockets.get(sid).leave(roomID)
			rooms[roomID].members.splice(rooms[roomID].members.indexOf(sid), 1);
			rooms[roomID].admins.splice(rooms[roomID].admins.indexOf(sid), 1);
			rooms[roomID].blocked.push(rooms[roomID].identitys[sid].id);
		}
	});

	socket.on("makeAdmin", (sid, roomID) => {
		var room = rooms[roomID]
		var isA = room.isAdmin(room.identitys[socket.id].id);

		if (isA) {
			rooms[roomID].admins.push(rooms[roomID].identitys[sid].id);
			rooms[roomID].identitys[sid].isAdmin = true;
			io.sockets.in(roomID).emit("memberStreamingState", sid, rooms[roomID].identitys[sid]);
		}
	});

	socket.on("removeAdmin", (sid, roomID) => {
		var room = rooms[roomID]
		var isA = room.isAdmin(room.identitys[socket.id].id);
		if (isA) {
			rooms[roomID].admins.splice(rooms[roomID].admins.indexOf(rooms[roomID].identitys[sid].id), 1);
			rooms[roomID].identitys[sid].isAdmin = false;
			io.sockets.in(roomID).emit("memberStreamingState", sid, rooms[roomID].identitys[sid]);
		}
	});
});



io.of("/").adapter.on("create-room", (room) => {
	//console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", async (room, id) => {
	var sockets = await getSocketsOfRoom(room);
	if (sockets[0]) {
		io.to(room).emit("memberAdded", sockets, id, rooms[room].identitys[id]);
	}
});

io.of("/").adapter.on("leave-room", async (room, id) => {
	if (rooms[room]) {
		rooms[room].removeMember(id)
		var sockets = await getSocketsOfRoom(room);
		io.to(room).emit('memberRemoved', sockets, id, rooms[room].identitys[id]);
	}
});

//use public folder
app.use(express.static(__dirname + "/public/"));

// parse application/json
app.use(express.json({ limit: '20mb', parameterLimit: 50000 }))

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({
	extended: true,
	limit: '20mb',
	parameterLimit: 50000
}));

app.use((req, res, next) => {
	req.rawBody = new Promise(resolve => {
		buf = '';
		req.on('data', x => buf += x);
		req.on('end', () => {
			resolve(buf);
		});
	});
	next();
});

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

app.get("/rooms/:roomid/:file", function (req, res) {
	const filePath = path.join(__dirname, 'public', 'uploads', req.params.roomid, req.params.file);

	if (!fs.existsSync(filePath)) {
		res.sendStatus(204)
		return;
	}

	reader = fs.createReadStream(filePath);
	reader.on('data', (chunk) => { res.write(chunk) });
	reader.on('close', () => { res.end() });
	reader.on('error', err => { res.sendStatus(500) });
});

var fileUpload = upload.single('file')

app.post('/upload/file', async (req, res) => {

	fileUpload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			// A Multer error occurred when uploading.
			res.status(500)
			res.send(JSON.stringify({ code: err.code }))
			return
		} else if (err) {
			// An unknown error occurred when uploading.
			console.log(err);
			res.status(500)
			res.send(JSON.stringify({ code: 'UNKNOWN_ERROR' }))
			return
		}

		const file = req.file;
		const userID = req.body.user;
		const filename = req.body.filename;

		console.log(file);

		if (file) {
			var oldPath = path.join(__dirname, file.path);
			var dirPath = path.join(__dirname, 'public','uploads','files', userID);
			var filePath = path.join(dirPath, filename);

			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath);
			}

			fs.rename(oldPath, filePath, (err) => {
				if (err) console.error(err)
			})
			res.status(201)
			res.send(JSON.stringify({ code: 'SUCCESS', url: path.join('uploads','files', userID, filename), fileExt: path.parse(filePath).ext }))
		} else {
			res.status(500)
			res.send(JSON.stringify({ code: 'NO_FILE' }))
		}

	})
	//res.end();
});

var avatarUpload = upload.single('avatar')
app.put('/upload/avatar', (req, res) => {

	avatarUpload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			// A Multer error occurred when uploading.
			res.status(500)
			res.send(JSON.stringify({ code: err.code }))
			return
		} else if (err) {
			// An unknown error occurred when uploading.
			console.log(err);
			res.status(500)
			res.send(JSON.stringify({ code: 'UNKNOWN_ERROR' }))
			return
		}

		const file = req.file;
		const userID = req.body.user;

		if (file) {
			var oldPath = path.join(__dirname, file.path);
			var newPath = path.join(__dirname, 'public/uploads/avatars/') + userID + '.png';

			fs.rename(oldPath, newPath, (err) => {
				if (err) console.error(err)
			})
			res.status(201)
			res.send(JSON.stringify({ code: 'SUCCESS', url: path.join('uploads/avatars/') + userID + '.png' }))
		} else {
			res.status(500)
			res.send(JSON.stringify({ code: 'NO_FILE' }))
		}

	})

})

server.listen(PORT, () => {
	if (process.env.NODE_ENV) {
		console.log('https://vs-dev.h2899502.stratoserver.net/');
	} else {
		console.log('https://vs.h2899502.stratoserver.net/');
	}
});

function uploadFile(req, filePath) {
	return new Promise((resolve, reject) => {
		var parsedPath = path.parse(filePath);

		if (!fs.existsSync(parsedPath.dir)) {
			fs.mkdirSync(parsedPath.dir);
		}

		const stream = fs.createWriteStream(filePath);

		stream.on('open', () => {
			console.log('Stream open ...  0.00%');
			req.pipe(stream);
		});

		stream.on('drain', () => {
			const written = parseInt(stream.bytesWritten);
			const total = parseInt(req.headers['content-length']);
			const pWritten = ((written / total) * 100).toFixed(2);
			console.log(`Processing  ...  ${pWritten}% done`);
		});

		stream.on('close', () => {
			console.log('Processing  ...  100%');
			resolve(filePath);
		});

		stream.on('error', err => {
			console.error(err);
			reject(err);
		});
	});
};

function getSocketsOfRoom(roomID) {
	return new Promise(async (resolve, reject) => {
		if (rooms[roomID]) {
			var sockets = await io.in(roomID).fetchSockets();
			var socketids = [];
			for (let index = 0; index < sockets.length; index++) {
				socketids.push({
					socket: sockets[index].id,
					identity: rooms[roomID].identitys[sockets[index].id]
				});
			}
			resolve(socketids);
		} else {
			resolve([]);
		}

	});
}

function getSocketsThumbnailsOfRoom(roomID) {
	return new Promise(async (resolve, reject) => {
		var sockets = await io.in(roomID).fetchSockets();
		var socketids = [];
		for (let index = 0; index < sockets.length; index++) {
			socketids.push({
				socket: sockets[index].id,
				thumbnail: rooms[roomID].identitys[sockets[index].id].thumbnail
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
					outFile: path.join(__dirname, 'public', 'css', 'dist', sassFiles[key] + '.css'),
					sourceMap: true
				}, function (err, result) {
					if (err) {
						console.log("err", err.formatted);
						//reject(err);
					} else {

						console.log('SCSS compiled!', result);
						fs.writeFile(path.join(__dirname, 'public', 'css', 'dist', sassFiles[key] + '.css'), result.css, function (err) {
							//

							if (err) {
								console.log('SCSS File write to Disk Error = ', err);
							} else {
								if (reloadClients) {

									io.emit('reloadCSS');
									duration = Date.now() - renderBegin;
									console.log('CSS Reload - Compiled in ', duration, 'ms');
								}
								resolve(result);
							}
						});


						fs.writeFile(path.join(__dirname, 'public', 'css', 'dist', sassFiles[key] + '.css.map'), result.map, function (err) {
							//

							if (err) {
								console.log('SCSS File write to Disk Error = ', err);
							} else {
								if (reloadClients) {

									io.emit('reloadCSS');
									duration = Date.now() - renderBegin;
									console.log('CSS Reload - Compiled in ', duration, 'ms');
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

renderSCSS(true)

var sassWatcherFiles = ['vars', 'main', 'mediaqueries'];

function watchSCSS() {
	for (const key in sassWatcherFiles) {
		const element = path.join(__dirname, 'public', 'css', sassWatcherFiles[key] + '.scss');
		//console.log("watchSCSS", element);

		fs.watchFile(element, function (curr, prev) {
			renderBegin = new Date();
			renderSCSS(true);
		});
	}
}


var renderBegin = new Date();
watchSCSS()