/*
Steffen Reimann
07.05.2022
*/
const socket = io(); // individuelle socketid in jedem neuen Peer-objekt ? nein! :D
const roomID = window.location.pathname.split('/').pop();

/**
* @var peers
* @type {Object}
* @description Holds all peer 2 peer connections
* @prop 
*/
var peers = {};

class Peer {
	/**
    * @constructor 
    * @method init() 
	* @param {boolean}  initiator  - true if initiator
	* @param {String}  remotesid - The SocketIO id of the other client
	* @param {String}  connectionID - The from this p2p Connection
    * @example 
    */
	constructor(initiator, remotesid, connectionID) {
		if (initiator) {
			this.connectionID = uuid();
		} else {
			this.connectionID = connectionID;
		}

		this.peer = new RTCPeerConnection({ iceServers: [ { urls: 'stun:stun.l.google.com:19302' } ] });

		this.stream;
		this.remoteStream;
		this.initiator = initiator;
		this.remotesid = remotesid;
		this.localsid = socket.id;
		this.connected = false;
	}

	/** 
    * @method init
    * @description Try To connect to socketid 
    * @returns {Promise}  Returns a Promise
    * @example 
    */
	async init() {
		return new Promise(async (resolve, reject) => {
			peers[this.connectionID] = this;

			if (this.initiator) {
				this.dataChannel = this.peer.createDataChannel('data');

				/* for (const track of stream.getTracks()) {
					this.peer.addTrack(track, stream);
				} */

				const offer = await this.peer.createOffer();

				await this.peer.setLocalDescription(offer);

				socket.emit('peerOffer', { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } });

				resolve(null, this.id, null);
			} else {
				this.peer.setRemoteDescription(new RTCSessionDescription(data.offer));
				const answer = await this.peer.createAnswer();
				await this.peer.setLocalDescription(answer);
				resolve(null, this.id, answer);
			}
			this.initevents();
		});
	}

	initevents() {
		this.peer.addEventListener('connectionstatechange', (event) => {
			//console.log('CONNECTION STATE CHANGE:');
			//console.log(event);
			if (peerConnection.connectionState === 'connected') {
				console.log('P2P connection established!');
				this.connected = true;
			}
			if (peerConnection.connectionState === 'disconnected') {
				console.log('P2P connection closed!');
				this.connected = false;
			}
		});

		this.peer.onicecandidate = function(event) {
			//console.log('new ice candidate:')
			//console.log(event)
			if (event.candidate) {
				socket.emit('newIceCandidate', { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { candidate: event.candidate } });
				//socket.emit('newIceCandidate', { candidate: event.candidate, socketid: this.socketid, connectionID: this.id });
			}
		};

		this.peer.ontrack = async (event) => {
			const [ remoteStream ] = event.streams;
			this.remoteStream = remoteStream;
		};
		this.peer.ondatachannel = (event) => {
			this.dataChannel = event.channel;
			this.dataChannel.onmessage = (event) => {
				console.log('DATA CHANNEL MESSAGE:', event.data);
			};
		};
	}

	sendData(data) {
		this.dataChannel.send(data);
	}
	close() {
		this.peer.close();
	}
	connect() {
		this.init();
	}
	remove() {
		this.peer.close();
		delete peers[this.connectionID];
		delete this;
	}
}

class PeersManager {
	constructor() {
		this.peers = {};
	}
	addPeer(peer) {
		peers[peer.connectionID] = peer;
	}
	getPeers() {
		return peers;
	}
	getPeerBySocketID(socketID) {
		for (const peer in peers) {
			if (peers[peer.connectionID].remotesid === socketID) {
				return peers[peer];
			}
		}
		return null;
	}
	getPeerByConnectionID(connectionID) {
		try {
			return peers[connectionID];
		} catch (error) {
			return null;
		}
	}
	closeAllPeers() {
		for (const peer in peers) {
			peers[peer.connectionID].remove();
		}
		return peers;
	}
	reconnectAllPeers() {
		for (const peer in peers) {
			peers[peer.connectionID].close();
			peers[peer.connectionID].connect();
		}
		return peers;
	}
}

// Helper Functions

function uuid() {
	function ff(s) {
		var pt = (Math.random().toString(16) + '000000000').substr(2, 8);
		return s ? '-' + pt.substr(0, 4) + '-' + pt.substr(4, 4) : pt;
	}
	return ff() + ff(true) + ff(true) + ff();
}

//listen for incoming peer offers
//{ fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } }
socket.on('peerOffer', async (indata) => {
	console.log('incoming Peer offer');

	// { offer: offer, initiatorsid: this.sid, connectionID: this.id }
	const peer = new Peer(false, indata.fromSocket, indata.connectionID);
	var { err, id, outdata } = await peer.init(indata.data.offer);
	socket.emit('peerAnswer', { fromSocket: peer.localsid, toSocket: peer.fromSocket, connectionID: peer.connectionID, data: { answer: outdata } });
});

socket.on('newIceCandidate', async (indata) => {
	//indata = { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { candidate: candidate } }
	try {
		await peers[indata.connectionID].peer.addIceCandidate(new RTCIceCandidate(indata.data.candidate));
	} catch (e) {
		console.error('Error adding received ice candidate', e);
	}
});

socket.on('peerAnswer', (indata) => {
	//indata = { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { candidate: candidate } }
	peers[indata.connectionID].peer.setRemoteDescription(new RTCSessionDescription(indata.data.answer));
});
