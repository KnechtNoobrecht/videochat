"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
Steffen Reimann
07.05.2022
*/
var socket = io(); // individuelle socketid in jedem neuen Peer-objekt ? nein! :D

var roomID = window.location.pathname.split('/').pop();
var localStream = null;
/**
 * @var peers
 * @type {Object}
 * @description Holds all peer 2 peer connections
 * @prop
 */

var peers = {};

var Peer =
/*#__PURE__*/
function () {
  /**
  * @constructor
  * @method init()
  * @param {boolean}  initiator  - true if initiator
  * @param {String}  remotesid - The SocketIO id of the other client
  * @param {String}  connectionID - The from this p2p Connection
  * @example
  */
  function Peer(_ref) {
    var initiator = _ref.initiator,
        remotesid = _ref.remotesid,
        connectionID = _ref.connectionID,
        identity = _ref.identity;

    _classCallCheck(this, Peer);

    if (initiator) {
      this.connectionID = uuid();
    } else {
      this.connectionID = connectionID;
    }

    this.peer = new RTCPeerConnection({
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
      }]
    });
    this.stream;
    this.remoteStream;
    this.initiator = initiator;
    this.remotesid = remotesid;
    this.localsid = socket.id;
    this.connected = false;
    this.identity = identity || new Identity();
  }
  /**
  * @method init
  * @description Try To connect to socketid
  * @returns {Promise}  Returns a Promise
  * @example
  */


  _createClass(Peer, [{
    key: "init",
    value: function init(offer, stream) {
      var _this = this;

      return regeneratorRuntime.async(function init$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function _callee(resolve, reject) {
                var prevReport, that, t, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, track, _offer;

                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        peers[_this.connectionID] = _this;
                        prevReport = null;
                        that = _this;
                        t = setInterval(function () {
                          // console.log('jo hi');
                          if (!that.peer) {
                            prevReport = null;
                            return;
                          }

                          that.peer.getStats(null).then(function (reporter) {
                            reporter.forEach(function (report) {
                              if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                                if (!prevReport) {
                                  prevReport = report;
                                } else {
                                  console.log((report.bytesReceived * 8 - prevReport.bytesReceived * 8) / (report.timestamp - prevReport.timestamp));
                                }
                              }
                            });
                          });
                        }, 100);

                        _this.peer.addEventListener('connectionstatechange', function (event) {
                          // console.log(event);
                          if (_this.peer.connectionState === 'connected') {
                            console.log('P2P connection established! ', _this.connectionID);
                            _this.connected = true;
                          }

                          if (_this.peer.connectionState === 'disconnected') {
                            console.log('P2P connection closed!');
                            _this.connected = false;
                          }
                        }); // this.peer.addEventListener('icecandidate', (event) => {});


                        _this.peer.addEventListener('icecandidateerror', function (event) {
                          console.log('onicecandidateerror');
                          console.log(event);
                        });

                        _this.peer.addEventListener('icecandidate', function (event) {
                          console.log('icecandidate');

                          if (event.candidate) {
                            socket.emit('newIceCandidate', {
                              fromSocket: _this.localsid,
                              toSocket: _this.remotesid,
                              connectionID: _this.connectionID,
                              data: {
                                candidate: event.candidate
                              }
                            });
                          }
                        });

                        _this.peer.addEventListener('track', function (event) {
                          console.log('ontrack');

                          var _event$streams = _slicedToArray(event.streams, 1),
                              remoteStream = _event$streams[0];

                          _this.remoteStream = remoteStream;
                          remoteVideo.srcObject = remoteStream;

                          remoteVideo.onloadedmetadata = function (e) {
                            return remoteVideo.play();
                          };
                        });

                        _this.peer.addEventListener('datachannel', function (event) {
                          //this.dataChannel = event.channel
                          console.log('datachannel', event.channel);
                          event.channel.addEventListener('message', function (event) {
                            console.log('event.channel DATA CHANNEL MESSAGE:', event.data);
                          });

                          _this.dataChannel.onmessage = function (event) {
                            console.log('this.dataChannel DATA CHANNEL MESSAGE:', event.data);
                          };
                        });

                        if (!stream) {
                          _context.next = 31;
                          break;
                        }

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 13;

                        for (_iterator = stream.getTracks()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                          track = _step.value;
                          console.log('addTrack', track);

                          _this.peer.addTrack(track, stream);

                          console.log('addTrack', _this.peer);
                        }

                        _context.next = 21;
                        break;

                      case 17:
                        _context.prev = 17;
                        _context.t0 = _context["catch"](13);
                        _didIteratorError = true;
                        _iteratorError = _context.t0;

                      case 21:
                        _context.prev = 21;
                        _context.prev = 22;

                        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                          _iterator["return"]();
                        }

                      case 24:
                        _context.prev = 24;

                        if (!_didIteratorError) {
                          _context.next = 27;
                          break;
                        }

                        throw _iteratorError;

                      case 27:
                        return _context.finish(24);

                      case 28:
                        return _context.finish(21);

                      case 29:
                        _context.next = 32;
                        break;

                      case 31:
                        _this.dataChannel = _this.peer.createDataChannel('data'); // dummy channel to trigger ICE

                      case 32:
                        if (!_this.initiator) {
                          _context.next = 44;
                          break;
                        }

                        _this.peer.createOffer().then(function (sdp) {
                          var arr = sdp.sdp.split('\r\n');
                          arr.forEach(function (str, i) {
                            if (/^a=fmtp:\d*/.test(str)) {
                              arr[i] = str + ';x-google-max-bitrate=28000;x-google-min-bitrate=10000;x-google-start-bitrate=20000';
                            } else if (/^a=mid:(1|video)/.test(str)) {
                              arr[i] += '\r\nb=AS:20000';
                            }
                          });
                          sdp = new RTCSessionDescription({
                            type: 'offer',
                            sdp: arr.join('\r\n')
                          });
                          console.log('setLocalDescription', sdp);

                          _this.peer.setLocalDescription(sdp);

                          socket.emit('peerOffer', {
                            fromSocket: _this.localsid,
                            toSocket: _this.remotesid,
                            connectionID: _this.connectionID,
                            data: {
                              offer: sdp
                            }
                          });
                          resolve(sdp);
                        });

                        return _context.abrupt("return");

                      case 37:
                        _offer = _context.sent;
                        _context.next = 40;
                        return regeneratorRuntime.awrap(_this.peer.setLocalDescription(_offer));

                      case 40:
                        socket.emit('peerOffer', {
                          fromSocket: _this.localsid,
                          toSocket: _this.remotesid,
                          connectionID: _this.connectionID,
                          data: {
                            offer: _offer
                          }
                        });
                        resolve(_this.id);
                        _context.next = 48;
                        break;

                      case 44:
                        _context.next = 46;
                        return regeneratorRuntime.awrap(_this.peer.setRemoteDescription(new RTCSessionDescription(offer)));

                      case 46:
                        _this.peer.createAnswer().then(function (sdp) {
                          var arr = sdp.sdp.split('\r\n');
                          arr.forEach(function (str, i) {
                            if (/^a=fmtp:\d*/.test(str)) {
                              arr[i] = str + ';x-google-max-bitrate=28000;x-google-min-bitrate=10000;x-google-start-bitrate=20000';
                            } else if (/^a=mid:(1|video)/.test(str)) {
                              arr[i] += '\r\nb=AS:20000';
                            }
                          });
                          sdp = new RTCSessionDescription({
                            type: 'answer',
                            sdp: arr.join('\r\n')
                          });
                          console.log('setRemoteDescription', offer);
                          console.log('setLocalDescription', sdp);

                          _this.peer.setLocalDescription(sdp);

                          resolve(sdp);
                        });

                        console.log('after resolve', _this.peer); //const answer = await this.peer.createAnswer()
                        //await this.peer.setLocalDescription(answer)
                        //resolve(answer)

                      case 48:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, null, null, [[13, 17, 21, 29], [22,, 24, 28]]);
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "sendData",
    value: function sendData(data) {
      this.dataChannel.send(data);
    }
  }, {
    key: "setStream",
    value: function setStream(stream) {
      this.stream = stream;

      if (stream) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = stream.getTracks()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var track = _step2.value;
            this.peer.addTrack(track, stream);
            console.log('addTrack', this.peer); //localStream
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } else {}
    }
  }, {
    key: "removeStream",
    value: function removeStream() {
      this.peer.removeStream(this.stream);
    }
  }, {
    key: "close",
    value: function close() {
      this.peer.close();
    }
  }, {
    key: "connect",
    value: function connect() {
      this.init();
    }
  }, {
    key: "remove",
    value: function remove() {
      this.peer.close();
      delete peers[this.connectionID];
      delete this;
    }
  }]);

  return Peer;
}();

var PeersManager =
/*#__PURE__*/
function () {
  function PeersManager() {
    _classCallCheck(this, PeersManager);

    this.peers = {};
  }

  _createClass(PeersManager, [{
    key: "addPeer",
    value: function addPeer(peer) {
      this.peers[peer.connectionID] = peer;
    }
  }, {
    key: "getPeers",
    value: function getPeers() {
      return peers;
    }
  }, {
    key: "getPeerBySocketID",
    value: function getPeerBySocketID(socketID) {
      for (var peer in peers) {
        if (peers[peer.connectionID].remotesid === socketID) {
          return peers[peer];
        }
      }

      return null;
    }
  }, {
    key: "getPeerByConnectionID",
    value: function getPeerByConnectionID(connectionID) {
      try {
        return peers[connectionID];
      } catch (error) {
        return null;
      }
    }
  }, {
    key: "getPeerByIndex",
    value: function getPeerByIndex(index) {
      return peers[Object.keys(peers)[index]];
    }
  }, {
    key: "setAllPeersStream",
    value: function setAllPeersStream(stream) {
      for (var peer in peers) {
        console.log('setAllPeersStream', peer);
        console.log('setAllPeersStream', this.peers[peer]);
        this.peers[peer].setStream(stream);
      }
    }
  }, {
    key: "closeAllPeers",
    value: function closeAllPeers() {
      for (var peer in peers) {
        peers[peer.connectionID].remove();
      }

      return peers;
    }
  }, {
    key: "reconnectAllPeers",
    value: function reconnectAllPeers() {
      for (var peer in peers) {
        peers[peer.connectionID].close();
        peers[peer.connectionID].connect();
      }

      return peers;
    }
  }]);

  return PeersManager;
}();
/* async function test() {
  console.log("Identity Created", await checkUsernameTaken(this.username));
  
  test(); */


var Identity =
/*#__PURE__*/
function () {
  function Identity(id, username, avatar) {
    _classCallCheck(this, Identity);

    this.id = id || uuid();
    this.username = username || 'Anonymous';
    this.avatar = avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    addIdentityToObjects(this);
  }

  _createClass(Identity, [{
    key: "setIdentity",
    value: function setIdentity(data) {
      // data = {id: id, username:username, avatar: avatar}
      this.id = data.id || this.id;
      this.username = data.username || this.username;
      this.avatar = data.avatar || this.avatar;
      addCookieObjectElement({
        id: this.id,
        username: this.username,
        avatar: this.avatar
      });
      return {
        id: this.id,
        username: this.username,
        avatar: this.avatar
      };
    }
  }, {
    key: "getIdentity",
    value: function getIdentity() {
      return {
        id: this.id,
        username: this.username,
        avatar: this.avatar
      };
    }
  }, {
    key: "loadIdentitys",
    value: function loadIdentitys() {
      var coockies = getCookieObject('ep_Identitys');
      return coockies;
    }
  }, {
    key: "removeIdentity",
    value: function removeIdentity() {
      removeCookieObjectElement();
      delete this;
      return {
        id: this.id,
        username: this.username,
        avatar: this.avatar
      };
    }
  }, {
    key: "checkIdentity",
    value: function checkIdentity() {
      var coockies = getCookieObject('ep_Identitys');

      if (coockies.length > 0) {}
    }
  }]);

  return Identity;
}(); // Helper Functions


function uuid() {
  function ff(s) {
    var pt = (Math.random().toString(16) + '000000000').substr(2, 8);
    return s ? '-' + pt.substr(0, 4) + '-' + pt.substr(4, 4) : pt;
  }

  return ff() + ff(true) + ff(true) + ff();
} // { id: this.id, username: this.username, avatar: this.avatar }


function addCookieObjectElement(params) {
  var iCookie = getCookie('ep_Identitys');

  if (iCookie == '') {
    var iCookie = JSON.stringify({});
  }

  var iCookieObj = JSON.parse(iCookie);
  iCookieObj[params.id] = params;
  setCookie('ep_Identitys', JSON.stringify(iCookieObj), 365);
  return getCookieObject('ep_Identitys');
}

function removeCookieObjectElement(id) {
  var iCookie = getCookie('ep_Identitys');

  if (iCookie == '') {
    var iCookie = JSON.stringify({});
  }

  var iCookieObj = JSON.parse(iCookie);
  delete iCookieObj[id];
  setCookie('ep_Identitys', JSON.stringify(iCookieObj), 365);
  return getCookieObject(id);
}

function getIdentityByUsernameInCookie(username) {
  var coo = getCookieObject('ep_Identitys');

  for (var i in coo) {
    if (coo[i].username === username) {
      return coo[i];
    }
  }

  return null;
}

function getIdentityByUsernameInIdentityObject(username) {
  for (var i in identitys) {
    if (identitys[i].username === username) {
      return identitys[i];
    }
  }

  return null;
}

function checkUsernameTaken(username) {
  var a, b;
  return regeneratorRuntime.async(function checkUsernameTaken$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(getIdentityByUsernameInCookie(username));

        case 2:
          a = _context3.sent;
          _context3.next = 5;
          return regeneratorRuntime.awrap(getIdentityByUsernameInIdentityObject(username));

        case 5:
          b = _context3.sent;

          if (!(a === null && b === null)) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", false);

        case 10:
          return _context3.abrupt("return", true);

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function addIdentityToObjects(data) {
  var a, b;
  return regeneratorRuntime.async(function addIdentityToObjects$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(getIdentityByUsernameInCookie(data.username));

        case 2:
          a = _context4.sent;

          if (a === null) {
            addCookieObjectElement({
              id: data.id,
              username: data.username,
              avatar: data.avatar
            });
          }

          _context4.next = 6;
          return regeneratorRuntime.awrap(getIdentityByUsernameInIdentityObject(data.username));

        case 6:
          b = _context4.sent;

          if (b === null) {
            identitys.push({
              id: data.id,
              username: data.username,
              avatar: data.avatar
            });
          }

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
}

function getCookieObject(cname) {
  try {
    return JSON.parse(getCookie(cname));
  } catch (error) {
    return null;
  }
}

function selectStream() {
  var resolution = {
    width: 3840,
    height: 2160,
    framerate: 60
  };
  navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: {
      chromeMediaSource: 'desktop',
      width: resolution.width,
      height: resolution.height,
      frameRate: resolution.framerate
    }
  }).then(function _callee2(stream) {
    return regeneratorRuntime.async(function _callee2$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            localStream = stream;
            localVideo.srcObject = stream;
            console.log('Streaming started', pm);
            pm.setAllPeersStream(stream); //makeCall(stream);
            //p.addStream(stream);

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    });
  })["catch"](function (err) {
    console.log('nay', err);
  });
}

function startStreaming() {
  return new Promise(function (resolve, reject) {
    var resolution = {
      width: 3840,
      height: 2160,
      framerate: 30
    };
    navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        chromeMediaSource: 'desktop',
        width: resolution.width,
        height: resolution.height,
        frameRate: resolution.framerate
      }
    }).then(function _callee3(stream) {
      return regeneratorRuntime.async(function _callee3$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              localStream = stream;
              localVideo.srcObject = stream;
              resolve(stream);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      });
    })["catch"](function (err) {
      console.log('nay', err);
      reject(err);
    });
  });
}

function getStream(remotesid) {
  socket.emit('getStream', {
    fromSocket: socket.id,
    toSocket: remotesid
  });
}

function setLocalStream(stream) {
  localStream = stream;
} // listen for incoming peer offers
// { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } }


socket.on('peerOffer', function _callee4(indata) {
  var options, peer, outdata;
  return regeneratorRuntime.async(function _callee4$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          // console.log('incoming Peer offer = ', indata);
          // { offer: offer, initiatorsid: this.sid, connectionID: this.id }
          options = {
            initiator: false,
            remotesid: indata.fromSocket,
            connectionID: indata.connectionID
          };
          peer = new Peer(options);
          _context7.next = 4;
          return regeneratorRuntime.awrap(peer.init(indata.data.offer));

        case 4:
          outdata = _context7.sent;
          pm.addPeer(peer);
          socket.emit('peerAnswer', {
            fromSocket: indata.toSocket,
            toSocket: indata.fromSocket,
            connectionID: peer.connectionID,
            data: {
              answer: outdata
            }
          });

        case 7:
        case "end":
          return _context7.stop();
      }
    }
  });
});
socket.on('newIceCandidate', function _callee5(indata) {
  return regeneratorRuntime.async(function _callee5$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(peers[indata.connectionID].peer.addIceCandidate(new RTCIceCandidate(indata.data.candidate)));

        case 3:
          _context8.next = 8;
          break;

        case 5:
          _context8.prev = 5;
          _context8.t0 = _context8["catch"](0);
          console.error('Error adding received ice candidate', _context8.t0);

        case 8:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 5]]);
});
socket.on('peerAnswer', function (indata) {
  // console.log('peerAnswer = ', indata);
  // indata = { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { candidate: candidate } }
  peers[indata.connectionID].peer.setRemoteDescription(new RTCSessionDescription(indata.data.answer));
});
socket.on('connect', function () {
  // console.log('connected to server');
  socket.emit('joinRoom', roomID, identitys[0]);
});
socket.on('newRoomMember', function (socketids) {
  console.log('New Members = ', socketids);
  renderButtons(socketids);
}); //{ fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } }

socket.on('getStream', function _callee6(indata) {
  var options, peer, outdata;
  return regeneratorRuntime.async(function _callee6$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          console.log('getStream = ', indata);
          console.log('localStream = ', localStream);

          if (localStream) {
            _context9.next = 5;
            break;
          }

          _context9.next = 5;
          return regeneratorRuntime.awrap(startStreaming());

        case 5:
          console.log('getStream = ');
          options = {
            initiator: true,
            remotesid: indata.fromSocket
          };
          peer = new Peer(options);
          _context9.next = 10;
          return regeneratorRuntime.awrap(peer.init(null, localStream));

        case 10:
          outdata = _context9.sent;
          pm.addPeer(peer);

        case 12:
        case "end":
          return _context9.stop();
      }
    }
  });
});
var pm = new PeersManager();
var ido = getCookieObject('ep_Identitys');
var identitys = [];

if (ido) {
  Object.keys(ido).forEach(function (id) {
    console.log('Identity = ', id, ido[id]);
    identitys.push(new Identity(ido[id].id, ido[id].username, ido[id].avatar));
  });
} //selectStream();