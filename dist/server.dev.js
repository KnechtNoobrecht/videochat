"use strict";

var express = require("express");

var path = require("path");

var app = express();

var server = require("http").createServer(app);

var io = require("socket.io")(server);

var _require = require("uuid"),
    uuidv4 = _require.v4;

var PORT = 80;
io.on("connection", function (socket) {
  socket.emit("ID", socket.id);
  socket.on("joinRoom", function _callee(roomID) {
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            socket.join(roomID);
            console.log("Subscribed", socket.id, "to room", roomID);
            _context.t0 = console;
            _context.t1 = roomID;
            _context.next = 6;
            return regeneratorRuntime.awrap(getSocketsOfRoom(roomID));

          case 6:
            _context.t2 = _context.sent;

            _context.t0.log.call(_context.t0, "Userser in Room = ", _context.t1, " || ", _context.t2);

            _context.t3 = io.to(roomID);
            _context.next = 11;
            return regeneratorRuntime.awrap(getSocketsOfRoom(roomID));

          case 11:
            _context.t4 = _context.sent;

            _context.t3.emit.call(_context.t3, "newRoomMember", _context.t4);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    });
  });
  socket.on("getRoomMember", function _callee2(roomID, cb) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.t0 = cb;
            _context2.next = 3;
            return regeneratorRuntime.awrap(getSocketsOfRoom(roomID));

          case 3:
            _context2.t1 = _context2.sent;
            (0, _context2.t0)(_context2.t1);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
  socket.on("makePeerOffer", function (data) {
    console.log("Peer offer made by", socket.id);
    socket.to(data.roomID).emit("incomingPeerOffer", {
      offer: data.offer,
      offerer: socket.id
    });
  });
  socket.on("makePeerAnswer", function (data) {
    console.log(data);
    console.log("Peer answer made by", socket.id);
    io.to(data.offerer).emit("incomingPeerAnswer", data.answer);
  });
  socket.on("new-ice-candidate", function (data) {
    console.log("ICE CANDIDATE");
    socket.to(data.roomID).emit("incomingICEcandidate", data.candidate); // wurde von standard-emit zu dem hier geändert, jetzt kein fehler mehr aber ?
  });
  socket.on("newIceCandidate", function (data) {
    //console.log('ICE CANDIDATE', data);
    io.to(data.toSocket).emit("newIceCandidate", data); // wurde von standard-emit zu dem hier geändert, jetzt kein fehler mehr aber ?
  });
  socket.on("peerOffer", function (data) {
    // data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
    console.log("Peer offer made by", data.fromSocket, " -> ", data.toSocket);
    io.to(data.toSocket).emit("peerOffer", data);
  });
  socket.on("peerAnswer", function (data) {
    // data = { offer: offer, initiatorsid: this.sid, connectionID: this.id }
    console.log("Peer Answer made by", data.fromSocket, " -> ", data.toSocket);
    io.to(data.toSocket).emit("peerAnswer", data);
  });
  io.of("/").adapter.on("create-room", function (room) {//console.log(`room ${room} was created`);
  });
  io.of("/").adapter.on("join-room", function _callee3(room, id) {
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
          case "end":
            return _context3.stop();
        }
      }
    });
  });
});
io.on("joinRoom", function (socket, roomID) {
  console.log(socket, roomID);
}); //use public folder

app.use(express["static"](__dirname + "/public/"));
app.get("/", function (req, res) {
  res.redirect("/rooms/" + uuidv4());
});
app.get("/rooms/:id", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/video.html"));
}); // reference test

app.get("/test", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/reference.html"));
});
server.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});

function getSocketsOfRoom(roomID) {
  return new Promise(function _callee4(resolve, reject) {
    var sockets, socketids, index;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return regeneratorRuntime.awrap(io["in"](roomID).fetchSockets());

          case 2:
            sockets = _context4.sent;
            socketids = [];

            for (index = 0; index < sockets.length; index++) {
              socketids.push(sockets[index].id);
            }

            resolve(socketids);

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
}