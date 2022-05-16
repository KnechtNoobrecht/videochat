"use strict";

//import { Peer, PeersManager } from 'easy-peer';
socket.on("connect", function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
        case "end":
          return _context.stop();
      }
    }
  });
});

function renderButtons(sioids) {
  var html = "";
  sioids.forEach(function (element) {
    if (element && element != socket.id) {
      html += "<button id=\"selectStreamButton\" onclick=\"getStream('".concat(element.socket, "')\">Call ").concat(element.identity.username, " - ").concat(element.socket, "</button><br>");
    }
  });
  document.getElementById("buttosdiv").innerHTML = html;
}

function callSID(sid) {
  var options, p;
  return regeneratorRuntime.async(function callSID$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          options = {
            initiator: true,
            remotesid: sid
          };
          p = new Peer(options);
          _context2.next = 4;
          return regeneratorRuntime.awrap(p.init(null));

        case 4:
          pm.addPeer(p);

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  });
}

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');