const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const roomID = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
const configuration = { iceServers: [ { urls: 'stun:stun.l.google.com:19302' } ] };
const peerConnection = new RTCPeerConnection(configuration);
var selfID = '';
var resolution = { width: 1280, height: 720, framerate: 30 };

socket.on('ID', (data) => {
	console.log('My ID is', data);
	selfID = data;
	socket.emit('joinRoom', roomID);
});

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
			localVideo.srcObject = stream;
		})
		.catch((err) => {
			console.log('nay', err);
		});
}

async function gotPeerAnswer(answer) {
	console.log('incomingPeerAnswer');
	console.log(answer);
	const remoteDesc = new RTCSessionDescription(answer);
	await peerConnection.setRemoteDescription(remoteDesc);
}

async function answerIncomingPeerOffer(data) {
	console.log('incoming Peer offer');
	console.log(data.offer);
	peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
	const answer = await peerConnection.createAnswer();
	await peerConnection.setLocalDescription(answer);
	console.log('created answer:');
	console.log(answer);
	socket.emit('makePeerAnswer', { answer: answer, offerer: data.offerer });
}

async function handleICEcandidate(candidate) {
	try {
		await peerConnection.addIceCandidate(candidate);
	} catch (e) {
		console.error('Error adding received ice candidate', e);
	}
}

async function makeCall() {
	console.log('Initiating Peer connection');

	//socket listen for accepted offers / answers

	socket.on('incomingPeerAnswer', (answer) => {
		gotPeerAnswer(answer);
	});

	//signalingChannel.addEventListener('message', async message => {
	//    if (message.answer) {
	//        const remoteDesc = new RTCSessionDescription(message.answer)
	//        await peerConnection.setRemoteDescription(remoteDesc)
	//    }
	//})

	const offer = await peerConnection.createOffer();
	await peerConnection.setLocalDescription(offer);

	//socket send offer
	socket.emit('makePeerOffer', { offer: offer, roomID: roomID });

	//signalingChannel.send({'offer': offer})
}

//listen for incoming peer offers
socket.on('incomingPeerOffer', (data) => {
	answerIncomingPeerOffer(data);
});

//              ICE CANDIDATES

// Listen for local ICE candidates on the local RTCPeerConnection
//peerConnection.addEventListener('icecandidate', event => {
//    if (event.candidate) {
//        socket.emit('new-ice-candidate', {candidate: event.candidate})
//    }
//})
peerConnection.onicecandidate = function(event) {
	console.log('ON ICE CANDIDATE');
	console.log(event);
	if (event.candidate) {
		socket.emit('new-ice-candidate', { candidate: event.candidate });
	}
};

// Listen for remote ICE candidates and add them to the local RTCPeerConnection
socket.on('incomingICEcandidate', (candidate) => {
	console.log('incoming ice candidate');
	handleICEcandidate(candidate);
});

peerConnection.addEventListener('connectionstatechange', (event) => {
	console.log('connection state change ', event);
	if (peerConnection.connectionState === 'connected') {
		console.log('P2P connection established!');
	}
});

peerConnection.addEventListener('icegatheringstatechange', (ev) => {
	console.log(peerConnection.iceGatheringState, ' || ', ev);
	switch (peerConnection.iceGatheringState) {
		case 'new':
			/* gathering is either just starting or has been reset */
			break;
		case 'gathering':
			/* gathering has begun or is ongoing */
			break;
		case 'complete':
			/* gathering has ended */
			break;
	}
});

window.onload = makeCall;
