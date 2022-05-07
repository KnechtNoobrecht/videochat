const socket = io()
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const roomID = window.location.pathname.split('/').pop() //last element of window.location.pathname.split('/')
const configuration = { iceServers: [ { urls: 'stun:stun.l.google.com:19302' }, ] }
const peerConnection = new RTCPeerConnection(configuration)
let dataChannel
let myDataChannel
var localStream
var selfID = ''
var resolution = { width: 1920, height: 1080, framerate: 30 }

socket.on('ID', (data) => {
	console.log('My ID is', data)
	selfID = data
	socket.emit('joinRoom', roomID)
})

function initiateStream() {
	navigator.mediaDevices
		.getDisplayMedia({
			audio: false,
			video: {
				chromeMediaSource: 'desktop',
				width: resolution.width,
				height: resolution.height,
				frameRate: resolution.framerate
			}
		})
		.then((stream) => {
			localVideo.srcObject = stream
			makeCall(stream)
		})
		.catch((err) => {
			console.log('nay', err)
		})
}

async function makeCall(stream) {
	console.log('Initiating Peer connection')

	//socket listen for accepted offers / answers
	socket.on('incomingPeerAnswer', async (answer) => {
		console.log('incomingPeerAnswer')
		console.log(answer)
		const remoteDesc = new RTCSessionDescription(answer)
		await peerConnection.setRemoteDescription(remoteDesc)
		console.log('remote description set:')
		console.log(peerConnection.currentRemoteDescription);
	});

	if(stream) {
		for(const track of stream.getTracks()) {
			peerConnection.addTrack(track, stream)
		}
	} else {
		dataChannel = peerConnection.createDataChannel('foo')	// dummy channel to trigger ICE		
	}

	const offer = await peerConnection.createOffer()
	//console.log('made offer:');
	//console.log(offer);
	await peerConnection.setLocalDescription(offer)
	//console.log('local description set:');
	//console.log(peerConnection.currentLocalDescription);

	//socket send offer
	socket.emit('makePeerOffer', { offer: offer, roomID: roomID })

	//signalingChannel.send({'offer': offer})
}

//listen for incoming peer offers
socket.on('incomingPeerOffer', async (data) => {
	console.log('incoming Peer offer')
	console.log(data.offer)
	peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
	console.log('remote description set:')
	console.log(peerConnection.currentRemoteDescription);
	const answer = await peerConnection.createAnswer()
	await peerConnection.setLocalDescription(answer)
	console.log('local description set:');
	console.log(peerConnection.currentLocalDescription);
	console.log('created answer:')
	console.log(answer)
	socket.emit('makePeerAnswer', { answer: answer, offerer: data.offerer })
})



//              ICE CANDIDATES

// Listen for local ICE candidates on the local RTCPeerConnection
//peerConnection.addEventListener('icecandidate', event => {
//    if (event.candidate) {
//        socket.emit('new-ice-candidate', {candidate: event.candidate})
//    }
//})
peerConnection.onicecandidate = function(event) {
	//console.log('new ice candidate:')
	//console.log(event)
	if (event.candidate) {
		socket.emit('new-ice-candidate', { candidate: event.candidate, roomID: roomID })
	}
};

// Listen for remote ICE candidates and add them to the local RTCPeerConnection
socket.on('incomingICEcandidate', async (candidate) => {
	//console.log('incoming ice candidate:')
	//console.log(candidate)

	try {
		await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
	} catch (e) {
		console.error('Error adding received ice candidate', e)
	}
});

peerConnection.addEventListener('connectionstatechange', (event) => {
	console.log('CONNECTION STATE CHANGE:')
	console.log(event);
	if (peerConnection.connectionState === 'connected') {
		console.log('P2P connection established!')
	}
})

//peerConnection.oniceconnectionstatechange = event => {
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

peerConnection.ontrack = async (event) => {
	console.log('INCOMING TRACK', event)
	const [remoteStream] = event.streams
	console.log('remoteStream:',remoteStream);
	remoteVideo.srcObject = remoteStream
	remoteVideo.onloadedmetadata = e => remoteVideo.play()
}

function sendData(){
	dataChannel.send(document.getElementById('testinput').value)
	console.log('msg sent:')
	console.log(document.getElementById('testinput').value);
}

peerConnection.ondatachannel = event => {
	console.log('ondatachannel event triggered:',event);
	dataChannel = event.channel
	dataChannel.onmessage = logData
}

function logData(event) {
	console.log('datachannel onmessage event fired:', event);
	console.log('datachannel msg received:',event.data)
}

//window.onload = makeCall;
