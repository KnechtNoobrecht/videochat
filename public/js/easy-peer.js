/*
Steffen Reimann
07.05.2022
*/
const socket = io() // individuelle socketid in jedem neuen Peer-objekt ? nein! :D
const roomID = window.location.pathname.split('/').pop()
var localStream = null;
/**
 * @var peers
 * @type {Object}
 * @description Holds all peer 2 peer connections
 * @prop
 */
var peers = {}

class Peer { /**
    * @constructor
    * @method init()
    * @param {boolean}  initiator  - true if initiator
    * @param {String}  remotesid - The SocketIO id of the other client
    * @param {String}  connectionID - The from this p2p Connection
    * @example
    */
    constructor({ initiator: initiator, remotesid: remotesid, connectionID: connectionID, identity: identity }) {
        if (initiator) {
            this.connectionID = uuid()
        } else {
            this.connectionID = connectionID
        }

        this.peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })

        this.stream
        this.remoteStream

        this.initiator = initiator
        this.remotesid = remotesid
        this.localsid = socket.id
        this.connected = false
        this.identity = identity || new Identity()
    }

    /**
    * @method init
    * @description Try To connect to socketid
    * @returns {Promise}  Returns a Promise
    * @example
    */
    async init(offer) {
        return new Promise(async (resolve, reject) => {
            peers[this.connectionID] = this

            for (const track of localStream.getTracks()) {
                this.peer.addTrack(track, localStream);
                console.log('addTrack', this.peer);
                //localStream
            }

            this.dataChannel = this.peer.createDataChannel('data'); // dummy channel to trigger ICE

            if (this.initiator) {

                const offer = await this.peer.createOffer()

                await this.peer.setLocalDescription(offer)

                socket.emit('peerOffer', {
                    fromSocket: this.localsid,
                    toSocket: this.remotesid,
                    connectionID: this.connectionID,
                    data: {
                        offer: offer
                    }
                })

                resolve(this.id)
            } else {
                await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
                console.log(this.peer)
                const answer = await this.peer.createAnswer()
                await this.peer.setLocalDescription(answer)
                resolve(answer)
            }

            /* ===============================================================================================
        =============================================================================================== */

            this.peer.addEventListener('connectionstatechange', (event) => { // console.log(event);
                if (this.peer.connectionState === 'connected') {
                    console.log('P2P connection established! ', this.connectionID)
                    this.connected = true
                }
                if (this.peer.connectionState === 'disconnected') {
                    console.log('P2P connection closed!')
                    this.connected = false
                }
            })
            // this.peer.addEventListener('icecandidate', (event) => {});
            this.peer.addEventListener('icecandidateerror', (event) => {
                console.log('onicecandidateerror')
                console.log(event)
            })
            this.peer.addEventListener('icecandidate', (event) => {
                if (event.candidate) {
                    socket.emit('newIceCandidate', {
                        fromSocket: this.localsid,
                        toSocket: this.remotesid,
                        connectionID: this.connectionID,
                        data: {
                            candidate: event.candidate
                        }
                    })
                }
            })
            this.peer.addEventListener('track', (event) => {
                console.log('ontrack');
                const [remoteStream] = event.streams
                this.remoteStream = remoteStream
                remoteVideo.srcObject = remoteStream;
                remoteVideo.onloadedmetadata = (e) => remoteVideo.play();
            })
            this.peer.ontrack = async (event) => {
                console.log('INCOMING TRACK', event);
                const [remoteStream] = event.streams;
                remoteVideo.srcObject = remoteStream;
                remoteVideo.onloadedmetadata = (e) => remoteVideo.play();
            };
            /* this.peer.onaddstream = async (event) => {
                console.log('INCOMING TRACK', event);
                const [remoteStream] = event.streams;
                remoteVideo.srcObject = remoteStream;
                remoteVideo.onloadedmetadata = (e) => remoteVideo.play();
            }; */

            this.peer.addEventListener('datachannel', (event) => {
                //this.dataChannel = event.channel
                console.log('datachannel', event.channel);
                event.channel.addEventListener('message', (event) => {
                    console.log('event.channel DATA CHANNEL MESSAGE:', event.data);
                });
                this.dataChannel.onmessage = (event) => {
                    console.log('this.dataChannel DATA CHANNEL MESSAGE:', event.data)
                }
            })
        })
    }

    sendData(data) {
        this.dataChannel.send(data)
    }
    setStream(stream) {
        this.stream = stream
        if (stream) {
            for (const track of stream.getTracks()) {
                this.peer.addTrack(track, stream);
                console.log('addTrack', this.peer);
                //localStream
            }
        } else {

        }
    }
    removeStream() {
        this.peer.removeStream(this.stream)
    }
    close() {
        this.peer.close()
    }
    connect() {
        this.init()
    }
    remove() {
        this.peer.close()
        delete peers[this.connectionID]
        delete this
    }
}

class PeersManager {
    constructor() {
        this.peers = {}
    }
    addPeer(peer) {
        this.peers[peer.connectionID] = peer
    }
    getPeers() {
        return peers
    }

    getPeerBySocketID(socketID) {
        for (const peer in peers) {
            if (peers[peer.connectionID].remotesid === socketID) {
                return peers[peer]
            }
        }
        return null
    }

    getPeerByConnectionID(connectionID) {
        try {
            return peers[connectionID]
        } catch (error) {
            return null
        }
    }

    getPeerByIndex(index) {
        return peers[Object.keys(peers)[index]]
    }

    setAllPeersStream(stream) {
        for (const peer in peers) {
            console.log('setAllPeersStream', peer);
            console.log('setAllPeersStream', this.peers[peer]);
            this.peers[peer].setStream(stream)
        }
    }

    closeAllPeers() {
        for (const peer in peers) {
            peers[peer.connectionID].remove()
        }
        return peers
    }
    reconnectAllPeers() {
        for (const peer in peers) {
            peers[peer.connectionID].close()
            peers[peer.connectionID].connect()
        }
        return peers
    }
}

/* async function test() {
  console.log("Identity Created", await checkUsernameTaken(this.username));
  
  test(); */

class Identity {
    constructor(id, username, avatar) {
        this.id = id || uuid()
        this.username = username || 'Anonymous'
        this.avatar = avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        addIdentityToObjects(this)
    }

    setIdentity(data) { // data = {id: id, username:username, avatar: avatar}
        this.id = data.id || this.id
        this.username = data.username || this.username
        this.avatar = data.avatar || this.avatar
        addCookieObjectElement({ id: this.id, username: this.username, avatar: this.avatar })
        return { id: this.id, username: this.username, avatar: this.avatar }
    }

    getIdentity() {
        return { id: this.id, username: this.username, avatar: this.avatar }
    }
    loadIdentitys() {
        let coockies = getCookieObject('ep_Identitys')
        return coockies
    }
    removeIdentity() {
        removeCookieObjectElement()
        delete this
        return { id: this.id, username: this.username, avatar: this.avatar }
    }
    checkIdentity() {
        let coockies = getCookieObject('ep_Identitys')
        if (coockies.length > 0) { }
    }
}
// Helper Functions

function uuid() {
    function ff(s) {
        var pt = (Math.random().toString(16) + '000000000').substr(2, 8)
        return s ? '-' + pt.substr(0, 4) + '-' + pt.substr(4, 4) : pt
    }
    return ff() + ff(true) + ff(true) + ff()
}

// { id: this.id, username: this.username, avatar: this.avatar }
function addCookieObjectElement(params) {
    var iCookie = getCookie('ep_Identitys')
    if (iCookie == '') {
        var iCookie = JSON.stringify({})
    }

    var iCookieObj = JSON.parse(iCookie)
    iCookieObj[params.id] = params
    setCookie('ep_Identitys', JSON.stringify(iCookieObj), 365)
    return getCookieObject('ep_Identitys')
}
function removeCookieObjectElement(id) {
    var iCookie = getCookie('ep_Identitys')
    if (iCookie == '') {
        var iCookie = JSON.stringify({})
    }

    var iCookieObj = JSON.parse(iCookie)
    delete iCookieObj[id]
    setCookie('ep_Identitys', JSON.stringify(iCookieObj), 365)
    return getCookieObject(id)
}
function getIdentityByUsernameInCookie(username) {
    var coo = getCookieObject('ep_Identitys')
    for (var i in coo) {
        if (coo[i].username === username) {
            return coo[i]
        }
    }
    return null
}
function getIdentityByUsernameInIdentityObject(username) {
    for (var i in identitys) {
        if (identitys[i].username === username) {
            return identitys[i]
        }
    }
    return null
}
async function checkUsernameTaken(username) {
    var a = await getIdentityByUsernameInCookie(username)
    var b = await getIdentityByUsernameInIdentityObject(username)
    if (a === null && b === null) {
        return false
    } else {
        return true
    }
}
async function addIdentityToObjects(data) {
    var a = await getIdentityByUsernameInCookie(data.username)
    if (a === null) {
        addCookieObjectElement({ id: data.id, username: data.username, avatar: data.avatar })
    }

    var b = await getIdentityByUsernameInIdentityObject(data.username)
    if (b === null) {
        identitys.push({ id: data.id, username: data.username, avatar: data.avatar })
    }
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
    let expires = 'expires=' + d.toUTCString()
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}
function getCookie(cname) {
    let name = cname + '='
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ''
}
function getCookieObject(cname) {
    try {
        return JSON.parse(getCookie(cname))
    } catch (error) {
        return null
    }
}
function selectStream() {
    var resolution = { width: 1920, height: 1080, framerate: 30 };
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
        .then(async (stream) => {
            localStream = stream;
            localVideo.srcObject = stream;
            console.log('Streaming started', pm);
            //pm.setAllPeersStream(stream);
            //makeCall(stream);
            //p.addStream(stream);
        })
        .catch((err) => {
            console.log('nay', err);
        });
}

// listen for incoming peer offers
// { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } }
socket.on('peerOffer', async (indata) => {
    // console.log('incoming Peer offer = ', indata);

    // { offer: offer, initiatorsid: this.sid, connectionID: this.id }
    let options = {
        initiator: false,
        remotesid: indata.fromSocket,
        connectionID: indata.connectionID
    }
    let peer = new Peer(options)
    var outdata = await peer.init(indata.data.offer)
    pm.addPeer(peer)
    socket.emit('peerAnswer', {
        fromSocket: indata.toSocket,
        toSocket: indata.fromSocket,
        connectionID: peer.connectionID,
        data: {
            answer: outdata
        }
    })


})

socket.on('newIceCandidate', async (indata) => {
    //console.log('incoming ice candidate = ', indata);
    //indata = { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { candidate: candidate } }
    try {
        await peers[indata.connectionID].peer.addIceCandidate(new RTCIceCandidate(indata.data.candidate))
    } catch (e) {
        console.error('Error adding received ice candidate', e)
    }
})

socket.on('peerAnswer', (indata) => {
    // console.log('peerAnswer = ', indata);
    // indata = { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { candidate: candidate } }
    peers[indata.connectionID].peer.setRemoteDescription(new RTCSessionDescription(indata.data.answer),)
})

socket.on('connect', () => { // console.log('connected to server');

    socket.emit('joinRoom', roomID, identitys[0])
})

socket.on('newRoomMember', (socketids) => {
    console.log('New Members = ', socketids)
    renderButtons(socketids)
})

var pm = new PeersManager()

var ido = getCookieObject('ep_Identitys')
var identitys = []
if (ido) {
    Object.keys(ido).forEach((id) => {
        console.log('Identity = ', id, ido[id])
        identitys.push(new Identity(ido[id].id, ido[id].username, ido[id].avatar))
    })
}

selectStream();
