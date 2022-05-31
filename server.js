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
		socket.emit("loadChatMsgs", roomChatMsgs[roomID]);
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


	socket.on("chatMSG", async (data) => {
		// data = { room: this.id, msg: msg }
		console.log("chatMSG made by", data);
		data.fromSocket = socket.id;
		data.fromIdentity = identitys[socket.id];
		data.time = new Date().getTime();
		data.msg = await parseText(data.msg)
		if (roomChatMsgs[data.room]) {
			roomChatMsgs[data.room].push(data);
		} else {
			roomChatMsgs[data.room] = [data];
		}

		console.log(roomChatMsgs);
		io.to(data.room).emit("chatMSG", data);
	});

	socket.on("memberStartStreaming", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("To Room = ", data);
		identitys[socket.id].isStreaming = true;
		io.sockets.in(data).emit("memberStreamingState", socket.id, identitys[socket.id]);
	});

	socket.on("memberChangeIdentity", (data) => {
		// data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
		console.log("To Room memberChangeIdentity = ", data);
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

var sassWatcherFiles = ['vars', 'main'];

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