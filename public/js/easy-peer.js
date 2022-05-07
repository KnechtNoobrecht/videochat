/*
Steffen Reimann
07.05.2022
*/
const socket = io()
const roomID = window.location.pathname.split('/').pop()

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
        this.id = uuid()
        this.stream 
        this.sid 
        this.peer = new RTCPeerConnection({ iceServers: [ { urls: 'stun:stun.l.google.com:19302' } ] })
        peers[this.id] = this
    }


    /** 
    * @method init
    * @description Try To connect to socketid 
    * @returns {Promise}  Returns a Promise
    * @example 
    * @example 
    */
	async init(initiator, socketid) {
		return new Promise(async (resolve, reject) => {

			
            if(this.stream) {
                for(const track of stream.getTracks()) {
                    this.peer.addTrack(track, stream)
                }
            } else {
                dataChannel = this.peer.createDataChannel('foo')	// dummy channel to trigger ICE		
            }

            const offer = await peerConnection.createOffer()

            await this.peer.setLocalDescription(offer)

            socket.emit('makePeerOfferToID', { offer: offer, initiatorsid: this.sid, connectionID: this.id })

            socket.on('sendPeerAnswerToID-' + this.id, (answer) => {
                const remoteDesc = new RTCSessionDescription(answer)
                this.peer.setRemoteDescription(remoteDesc)
            });


		});
	}

}

class LocalStream {

}



// Helper Functions

function uuid() {
    function ff(s) {
        var pt = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + pt.substr(0,4) + "-" + pt.substr(4,4) : pt ;
    }
    return ff() + ff(true) + ff(true) + ff();
}

//listen for incoming peer offers
socket.on('incomingPeerOffer', async (data) => {
	console.log('incoming Peer offer')
	
	peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
	
	const answer = await peerConnection.createAnswer()
	await peerConnection.setLocalDescription(answer)

	socket.emit('sendPeerAnswerToID', { answer: answer, offerer: data.offerer })
})