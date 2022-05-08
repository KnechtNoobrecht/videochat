/*
Steffen Reimann
07.05.2022
*/
const socket = io(); // individuelle socketid in jedem neuen Peer-objekt ?
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
    * @example 
    */
	constructor(initiator, socketid, id) {
		if (initiator) {
			this.id = uuid();
		} else {
			this.id = id;
		}
		this.stream;
		this.peer = new RTCPeerConnection({ iceServers: [ { urls: 'stun:stun.l.google.com:19302' } ] });
		this.remoteStream;
		this.initiator = initiator;
		this.socketid = socketid;
		peers[this.id] = this;
	}

	/** 
    * @method init
    * @param {Object} data - initiator , socketid
    * @description Try To connect to socketid 
    * @returns {Promise}  Returns a Promise
    * @example 
    * @example 
    */
	async init(data) {
		return new Promise(async (resolve, reject) => {
			if (this.initiator) {
				this.dataChannel = this.peer.createDataChannel('data');

				/* for (const track of stream.getTracks()) {
					this.peer.addTrack(track, stream);
				} */

				const offer = await this.peer.createOffer();

				await this.peer.setLocalDescription(offer);

				socket.emit('peerOffer', { offer: offer, initiatorsid: this.sid, connectionID: this.id });

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
			console.log('CONNECTION STATE CHANGE:');
			console.log(event);
			if (peerConnection.connectionState === 'connected') {
				console.log('P2P connection established!');
			}
		});

		this.peer.onicecandidate = function(event) {
			//console.log('new ice candidate:')
			//console.log(event)
			if (event.candidate) {
				socket.emit('newIceCandidate', { candidate: event.candidate, socketid: this.socketid, connectionID: this.id });
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
}

class LocalStream {}

// Helper Functions

function uuid() {
	function ff(s) {
		var pt = (Math.random().toString(16) + '000000000').substr(2, 8);
		return s ? '-' + pt.substr(0, 4) + '-' + pt.substr(4, 4) : pt;
	}
	return ff() + ff(true) + ff(true) + ff();
}

//listen for incoming peer offers
socket.on('peerOffer', async (indata) => {
	console.log('incoming Peer offer');

	// { offer: offer, initiatorsid: this.sid, connectionID: this.id }
	const peer = new Peer(false, indata.initiatorsid, indata.connectionID);
	var { err, id, outdata } = peer.init(indata.offer);
	socket.emit('peerAnswer', { answer: outdata, initiatorsid: indata.initiatorsid });
});

socket.on('newIceCandidate', async (data) => {
	try {
		await peers[data.connectionID].peer.addIceCandidate(new RTCIceCandidate(data.candidate));
	} catch (e) {
		console.error('Error adding received ice candidate', e);
	}
});

socket.on('peerAnswer', (answer) => {
	peers[data.connectionID].peer.setRemoteDescription(new RTCSessionDescription(answer));
});
