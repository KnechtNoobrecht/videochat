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
    value: function init(offer) {
      var _this = this;

      return regeneratorRuntime.async(function init$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function _callee(resolve, reject) {
                var _offer, answer;

                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        peers[_this.connectionID] = _this;

                        if (!_this.initiator) {
                          _context.next = 12;
                          break;
                        }

                        _this.dataChannel = _this.peer.createDataChannel('data');
                        /* for (const track of stream.getTracks()) {
                          this.peer.addTrack(track, stream);
                        } */

                        _context.next = 5;
                        return regeneratorRuntime.awrap(_this.peer.createOffer());

                      case 5:
                        _offer = _context.sent;
                        _context.next = 8;
                        return regeneratorRuntime.awrap(_this.peer.setLocalDescription(_offer));

                      case 8:
                        socket.emit('peerOffer', {
                          fromSocket: _this.localsid,
                          toSocket: _this.remotesid,
                          connectionID: _this.connectionID,
                          data: {
                            offer: _offer
                          }
                        });
                        resolve(_this.id);
                        _context.next = 21;
                        break;

                      case 12:
                        _context.next = 14;
                        return regeneratorRuntime.awrap(_this.peer.setRemoteDescription(new RTCSessionDescription(offer)));

                      case 14:
                        console.log(_this.peer);
                        _context.next = 17;
                        return regeneratorRuntime.awrap(_this.peer.createAnswer());

                      case 17:
                        answer = _context.sent;
                        _context.next = 20;
                        return regeneratorRuntime.awrap(_this.peer.setLocalDescription(answer));

                      case 20:
                        resolve(answer);

                      case 21:
                        /* ===============================================================================================
                           =============================================================================================== */
                        _this.peer.addEventListener('connectionstatechange', function (event) {
                          //console.log(event);
                          if (_this.peer.connectionState === 'connected') {
                            console.log('P2P connection established! ', _this.connectionID);
                            _this.connected = true;
                          }

                          if (_this.peer.connectionState === 'disconnected') {
                            console.log('P2P connection closed!');
                            _this.connected = false;
                          }
                        }); //this.peer.addEventListener('icecandidate', (event) => {});


                        _this.peer.addEventListener('icecandidateerror', function (event) {
                          console.log('onicecandidateerror');
                          console.log(event);
                        });

                        _this.peer.addEventListener('icecandidate', function (event) {
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
                          var _event$streams = _slicedToArray(event.streams, 1),
                              remoteStream = _event$streams[0];

                          _this.remoteStream = remoteStream;
                        });

                        _this.peer.addEventListener('datachannel', function (event) {
                          _this.dataChannel = event.channel;
                          /* this.peer.addEventListener('message', (event) => {
                            console.log('DATA CHANNEL MESSAGE:', event.data);
                          }); */

                          _this.dataChannel.onmessage = function (event) {
                            console.log('DATA CHANNEL MESSAGE:', event.data);
                          };
                        });

                      case 26:
                      case "end":
                        return _context.stop();
                    }
                  }
                });
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
} //{ id: this.id, username: this.username, avatar: this.avatar }


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
} //listen for incoming peer offers
//{ fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } }


socket.on('peerOffer', function _callee2(indata) {
  var options, peer, outdata;
  return regeneratorRuntime.async(function _callee2$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          //console.log('incoming Peer offer = ', indata);
          // { offer: offer, initiatorsid: this.sid, connectionID: this.id }
          options = {
            initiator: false,
            remotesid: indata.fromSocket,
            connectionID: indata.connectionID
          };
          peer = new Peer(options);
          _context5.next = 4;
          return regeneratorRuntime.awrap(peer.init(indata.data.offer));

        case 4:
          outdata = _context5.sent;
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
          return _context5.stop();
      }
    }
  });
});
socket.on('newIceCandidate', function _callee3(indata) {
  return regeneratorRuntime.async(function _callee3$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(peers[indata.connectionID].peer.addIceCandidate(new RTCIceCandidate(indata.data.candidate)));

        case 3:
          _context6.next = 8;
          break;

        case 5:
          _context6.prev = 5;
          _context6.t0 = _context6["catch"](0);
          console.error('Error adding received ice candidate', _context6.t0);

        case 8:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 5]]);
});
socket.on('peerAnswer', function (indata) {
  //console.log('peerAnswer = ', indata);
  //indata = { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { candidate: candidate } }
  peers[indata.connectionID].peer.setRemoteDescription(new RTCSessionDescription(indata.data.answer));
});
socket.on('connect', function () {
  //console.log('connected to server');
  socket.emit('joinRoom', roomID);
});
socket.on('newRoomMember', function (socketids) {
  console.log('New Members = ', socketids);
  renderButtons(socketids);
});
var pm = new PeersManager();
var ido = getCookieObject('ep_Identitys');
var identitys = [];

if (ido) {
  Object.keys(ido).forEach(function (id) {
    console.log('Identity = ', id, ido[id]);
    identitys.push(new Identity(ido[id]));
  });
}