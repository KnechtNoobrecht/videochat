/*
Steffen Reimann
07.05.2022
*/
const socket = io();
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
    * @method init() - Init File
    * @example 
    */
	constructor() {
		this.id = uuid();
		this.stream;
		this.sid;
		this.peer = new RTCPeerConnection({ iceServers: [ { urls: 'stun:stun.l.google.com:19302' } ] });
		this.remoteStream;
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
			var initiator = data.initiator || false;
			var socketid = data.socketid || false;

			if (initiator) {
				this.dataChannel = this.peer.createDataChannel('data');

				for (const track of stream.getTracks()) {
					this.peer.addTrack(track, stream);
				}

				const offer = await this.peer.createOffer();

				await this.peer.setLocalDescription(offer);

				socket.emit('makePeerOfferToID', { offer: offer, initiatorsid: this.sid, connectionID: this.id });

				socket.on('peerAnswer-' + this.id, (answer) => {
					this.peer.setRemoteDescription(new RTCSessionDescription(answer));
				});
			} else {
				this.peer.setRemoteDescription(new RTCSessionDescription(data.offer));
				const answer = await this.peer.createAnswer();
				await this.peer.setLocalDescription(answer);
				resolve(answer);
			}
		});
	}

	initevents() {
		this.peer.ontrack = async (event) => {
			const [ remoteStream ] = event.streams;
			this.remoteStream = remoteStream;
		};
		this.peer.ondatachannel = (event) => {
			this.dataChannel = event.channel;
		};
		this.dataChannel.onmessage = (event) => {
			console.log('DATA CHANNEL MESSAGE:', event.data);
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
socket.on('peerOffer', async (data) => {
	console.log('incoming Peer offer');

	// { offer: offer, initiatorsid: this.sid, connectionID: this.id }
	const peer = new Peer();
	var p = peer.init();
	socket.emit('peerAnswer', { answer: p, initiatorsid: data.initiatorsid });
});
