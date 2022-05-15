"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var socket = io();
var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');
var roomID = window.location.pathname.split('/').pop(); //last element of window.location.pathname.split('/')

var configuration = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302'
  }]
};
var peerConnection = new RTCPeerConnection(configuration);
var dataChannel;
var myDataChannel;
var localStream;
var selfID = '';
var resolution = {
  width: 1920,
  height: 1080,
  framerate: 30
};
socket.on('ID', function (data) {
  console.log('My ID is', data);
  selfID = data;
  socket.emit('joinRoom', roomID);
});

function initiateStream() {
  navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: {
      chromeMediaSource: 'desktop',
      width: resolution.width,
      height: resolution.height,
      frameRate: resolution.framerate
    }
  }).then(function (stream) {
    //var mediaRecorder = new MediaRecorder(stream);
    //var myStream = mediaRecorder.stream;
    //makeCall(stream)
    localVideo.srcObject = stream;
    makeCall(stream);
  })["catch"](function (err) {
    console.log('nay', err);
  });
}

function makeCall(stream) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, track, offer;

  return regeneratorRuntime.async(function makeCall$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('Initiating Peer connection'); //socket listen for accepted offers / answers

          socket.on('incomingPeerAnswer', function _callee(answer) {
            var remoteDesc;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    console.log('incomingPeerAnswer');
                    console.log(answer);
                    remoteDesc = new RTCSessionDescription(answer);
                    _context.next = 5;
                    return regeneratorRuntime.awrap(peerConnection.setRemoteDescription(remoteDesc));

                  case 5:
                    console.log('remote description set:');
                    console.log(peerConnection.currentRemoteDescription);

                  case 7:
                  case "end":
                    return _context.stop();
                }
              }
            });
          });

          if (!stream) {
            _context2.next = 24;
            break;
          }

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context2.prev = 6;

          for (_iterator = stream.getTracks()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            track = _step.value;
            peerConnection.addTrack(track, stream);
          }

          _context2.next = 14;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](6);
          _didIteratorError = true;
          _iteratorError = _context2.t0;

        case 14:
          _context2.prev = 14;
          _context2.prev = 15;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 17:
          _context2.prev = 17;

          if (!_didIteratorError) {
            _context2.next = 20;
            break;
          }

          throw _iteratorError;

        case 20:
          return _context2.finish(17);

        case 21:
          return _context2.finish(14);

        case 22:
          _context2.next = 25;
          break;

        case 24:
          dataChannel = peerConnection.createDataChannel('foo'); // dummy channel to trigger ICE

        case 25:
          _context2.next = 27;
          return regeneratorRuntime.awrap(peerConnection.createOffer());

        case 27:
          offer = _context2.sent;
          _context2.next = 30;
          return regeneratorRuntime.awrap(peerConnection.setLocalDescription(offer));

        case 30:
          //console.log('local description set:');
          //console.log(peerConnection.currentLocalDescription);
          //socket send offer
          socket.emit('makePeerOffer', {
            offer: offer,
            roomID: roomID
          }); //signalingChannel.send({'offer': offer})

        case 31:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[6, 10, 14, 22], [15,, 17, 21]]);
} //listen for incoming peer offers


socket.on('incomingPeerOffer', function _callee2(data) {
  var answer;
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log('incoming Peer offer');
          console.log(data.offer);
          peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          console.log('remote description set:');
          console.log(peerConnection.currentRemoteDescription);
          _context3.next = 7;
          return regeneratorRuntime.awrap(peerConnection.createAnswer());

        case 7:
          answer = _context3.sent;
          _context3.next = 10;
          return regeneratorRuntime.awrap(peerConnection.setLocalDescription(answer));

        case 10:
          console.log('local description set:');
          console.log(peerConnection.currentLocalDescription);
          console.log('created answer:');
          console.log(answer);
          socket.emit('makePeerAnswer', {
            answer: answer,
            offerer: data.offerer
          });

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //              ICE CANDIDATES
// Listen for local ICE candidates on the local RTCPeerConnection
//peerConnection.addEventListener('icecandidate', event => {
//    if (event.candidate) {
//        socket.emit('new-ice-candidate', {candidate: event.candidate})
//    }
//})

peerConnection.onicecandidate = function (event) {
  //console.log('new ice candidate:')
  //console.log(event)
  if (event.candidate) {
    socket.emit('new-ice-candidate', {
      candidate: event.candidate,
      roomID: roomID
    });
  }
}; // Listen for remote ICE candidates and add them to the local RTCPeerConnection


socket.on('incomingICEcandidate', function _callee3(candidate) {
  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(peerConnection.addIceCandidate(new RTCIceCandidate(candidate)));

        case 3:
          _context4.next = 8;
          break;

        case 5:
          _context4.prev = 5;
          _context4.t0 = _context4["catch"](0);
          console.error('Error adding received ice candidate', _context4.t0);

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 5]]);
});
peerConnection.addEventListener('connectionstatechange', function (event) {
  console.log('CONNECTION STATE CHANGE:', peerConnection.connectionState);

  if (peerConnection.connectionState === 'connected') {
    console.log('P2P connection established!');
  }
}); //peerConnection.oniceconnectionstatechange = event => {
//	console.log('ice connection state change:', event);
//}
//
//peerConnection.addEventListener('icegatheringstatechange', (ev) => {
//	console.log(peerConnection.iceGatheringState, ' || ', ev)
//})
//
//peerConnection.addEventListener('iceccandidate', (ev) => {
//	console.log('iceccandidate', ev)
//})
//
//peerConnection.onnegotiationneeded = event => {
//	console.log('negotiationneeded:',event);
//}

peerConnection.ontrack = function _callee4(event) {
  var _event$streams, remoteStream;

  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          console.log('INCOMING TRACK', event);
          _event$streams = _slicedToArray(event.streams, 1), remoteStream = _event$streams[0];
          console.log('remoteStream:', remoteStream);
          remoteVideo.srcObject = remoteStream;

          remoteVideo.onloadedmetadata = function (e) {
            return remoteVideo.play();
          };

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  });
};

function sendData() {
  dataChannel.send(document.getElementById('testinput').value);
  console.log('msg sent:');
  console.log(document.getElementById('testinput').value);
}

peerConnection.ondatachannel = function (event) {
  console.log('ondatachannel event triggered:', event);
  dataChannel = event.channel;
  dataChannel.onmessage = logData;
};

function logData(event) {
  console.log('datachannel onmessage event fired:', event);
  console.log('datachannel msg received:', event.data);
} //window.onload = makeCall;