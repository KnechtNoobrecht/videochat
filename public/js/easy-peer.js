/*
Steffen Reimann
07.05.2022
*/
const socket = io() // individuelle socketid in jedem neuen Peer-objekt ? nein! :D
const roomID = window.location.pathname.split('/').pop()


// We now have a merged MediaStream!
var localStream = null



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
            this.connectionID = connectionID || uuid()
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
        this.identity = identity || new Identity({})
        this.tracks = []
    }

    /**
    * @method init
    * @description Try To connect to socketid
    * @returns {Promise}  Returns a Promise
    * @example
    */
    async init(offer, stream) {
        return new Promise(async (resolve, reject) => {
            peers[this.connectionID] = this

            var prevReport = null;
            var that = this;
            var t = setInterval(function () {
                // console.log('jo hi');
                if (!that.peer) {
                    prevReport = null;
                    return;
                }
                that.peer.getStats(null).then(reporter => {
                    reporter.forEach(report => {
                        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                            if (!prevReport) {
                                prevReport = report;
                            } else {
                                //console.log((report.bytesReceived * 8 - prevReport.bytesReceived * 8) / (report.timestamp - prevReport.timestamp));
                            }
                        }
                    });
                });
            }, 100);

            this.peer.addEventListener('connectionstatechange', (event) => { // console.log(event);
                if (this.peer.connectionState === 'connected') {
                    console.log('P2P connection established! ', this.connectionID)
                    this.connected = true
                }
                if (this.peer.connectionState === 'disconnected') {
                    console.log('P2P connection closed!')
                    this.connected = false
                    var remoteVideo = document.getElementById("remoteVideo-" + this.connectionID)
                    remoteVideo.remove()
                }
            })
            // this.peer.addEventListener('icecandidate', (event) => {});
            this.peer.addEventListener('icecandidateerror', (event) => {
                console.log('onicecandidateerror')
                console.log(event)
            })
            this.peer.addEventListener('icecandidate', (event) => {
                console.log('icecandidate')
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
                console.log('ontrack', event);
                this.remoteStream = event.streams[0]
                var remoteVideo = document.getElementById("remoteVideo-" + this.connectionID)

                if (remoteVideo) {
                    remoteVideo.srcObject = this.remoteStream;
                } else {
                    remoteVideo = document.createElement('video')
                    remoteVideo.id = "remoteVideo-" + this.connectionID
                    remoteVideo.controls = true
                    remoteVideo.autoplay = true
                    remoteVideo.srcObject = this.remoteStream;
                    videoWrapper.appendChild(remoteVideo)
                }
                remoteVideo.onloadedmetadata = (e) => remoteVideo.play();
            })
            this.peer.addEventListener('datachannel', (event) => {
                //this.dataChannel = event.channel
                console.log('datachannel', event.channel);
                event.channel.addEventListener('message', (event) => {
                    console.log('event.channel DATA CHANNEL MESSAGE:', event.data);
                });
                this.dataChannel.onmessage = (event) => {
                    var incommingdata
                    try {
                        incommingdata = JSON.parse(event.data)
                    } catch (error) {
                        incommingdata = event.data
                    }
                    console.log('this.dataChannel DATA CHANNEL MESSAGE:', incommingdata)
                    console.log('typeof incommingdata:', typeof incommingdata)
                }
            })

            if (stream) {
                //console.log(stream)
                for (const track of stream.getTracks()) {
                    console.log('addTrack', track);
                    var t = this.peer.addTrack(track, stream);
                    this.tracks.push(t)
                    console.log('addTrack', this.peer);
                }
            }

            this.dataChannel = this.peer.createDataChannel('data'); // dummy channel to trigger ICE

            if (this.initiator) {
                this.peer.createOffer().then(sdp => {
                    var arr = sdp.sdp.split('\r\n');
                    arr.forEach((str, i) => {
                        if (/^a=fmtp:\d*/.test(str)) {
                            arr[i] = str + ';x-google-max-bitrate=28000;x-google-min-bitrate=10000;x-google-start-bitrate=20000';
                        } else if (/^a=mid:(1|video)/.test(str)) {
                            arr[i] += '\r\nb=AS:20000';
                        }
                    });
                    sdp = new RTCSessionDescription({
                        type: 'offer',
                        sdp: arr.join('\r\n'),
                    })

                    console.log('setLocalDescription', sdp);

                    this.peer.setLocalDescription(sdp);
                    console.log('setLocalDescription remotesid = ', this.remotesid);
                    socket.emit('peerOffer', {
                        fromSocket: this.localsid,
                        toSocket: this.remotesid,
                        connectionID: this.connectionID,
                        data: {
                            offer: sdp
                        }
                    })
                    resolve(sdp)
                });


                return
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
                this.peer.createAnswer().then(sdp => {
                    var arr = sdp.sdp.split('\r\n');
                    arr.forEach((str, i) => {
                        if (/^a=fmtp:\d*/.test(str)) {
                            arr[i] = str + ';x-google-max-bitrate=28000;x-google-min-bitrate=10000;x-google-start-bitrate=20000';
                        } else if (/^a=mid:(1|video)/.test(str)) {
                            arr[i] += '\r\nb=AS:20000';
                        }
                    });
                    sdp = new RTCSessionDescription({
                        type: 'answer',
                        sdp: arr.join('\r\n'),
                    })
                    sdp.sdp = sdp.sdp.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=510000')
                    console.log('setRemoteDescription', offer);
                    console.log('setLocalDescription', sdp);
                    this.peer.setLocalDescription(sdp);
                    resolve(sdp)
                });


                console.log('after resolve', this.peer)
                //const answer = await this.peer.createAnswer()
                //await this.peer.setLocalDescription(answer)
                //resolve(answer)
            }
        })
    }

    send(data) {
        console.log('send data ');
        this.dataChannel.send(data)
    }
    close() {
        this.peer.close()
    }
    connect() {
        this.init()
    }
    removeTracks() {
        this.sendData({ removeTracks: true })
        for (const key in this.tracks) {
            const element = this.tracks[key];
            console.log('removeTrack', element);
            this.peer.removeTrack(element);
        }
    }
    remove() {
        this.removeTracks()
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

    async getPeerBySocketID(socketID) {
        return new Promise((resolve, reject) => {

            for (const peer in peers) {
                if (peers[peer].remotesid === socketID) {
                    resolve(peers[peer])
                }
            }
            reject(null)
            //return null
        })
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

    async changeStream() {

        await startStreaming()

        for (const peer in this.peers) {
            console.log('changeStream', this.peers[peer]);
            var element = this.peers[peer]
            //this.peers[peer.id].init();
            if (element.initiator) {

                let options = {
                    initiator: true,
                    remotesid: element.remotesid,
                    connectionID: element.connectionID
                }
                let peer = new Peer(options)
                var outdata = await peer.init(null, localStream);
            }
        }
    }
}

/* async function test() {
  console.log("Identity Created", await checkUsernameTaken(this.username));
  
  test(); */
/**
 * @var Identity
 * @type {Object}
 * @description Holds all peer 2 peer connections
 * @prop
 */
class Identity {
    /**
    * @constructor
    * @param {id}  ID  - ID 
    * @param {username}  DisplayedUsername - Displayed Username
    * @param {avatar}  AvatarURL - Avatar URL
    * @example
    */
    constructor({ id: id, username: username, avatar: avatar }) {
        //console.log('Identity Created', id, username, avatar);
        this.id = id || uuid()
        this.username = username || 'Anonymous'
        this.avatar = avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        addIdentityToObjects(this)
    }

    /**
    * @method setIdentity
    * @param {id}  ID  - ID 
    * @param {username}  DisplayedUsername - Displayed Username
    * @param {avatar}  AvatarURL - Avatar URL
    * @example
    */
    set(data) { // data = {id: id, username:username, avatar: avatar}
        this.id = data.id || this.id
        this.username = data.username || this.username
        this.avatar = data.avatar || this.avatar
        addCookieObjectElement({ id: this.id, username: this.username, avatar: this.avatar })
        return { id: this.id, username: this.username, avatar: this.avatar }
    }

    /**
    * @method getIdentity - get Identity Object
    * @returns {id}  ID  - { id: this.id, username: this.username, avatar: this.avatar }
    * @example
    */
    get() {
        return { id: this.id, username: this.username, avatar: this.avatar }
    }

    /**
    * @method loadIdentitys - load Identitys from cookies
    * @returns {Object} Identitys - { id: this.id, username: this.username, avatar: this.avatar }
    * @example
    */
    loadIdentitys() {
        let coockies = getCookieObject('ep_Identitys')
        return coockies
    }

    /**
    * @method removeIdentity
    * @returns {id}  ID  - Loads all identities from cookies
    * @example
    */
    removeIdentity() {
        removeCookieObjectElement()
        delete this
        return { id: this.id, username: this.username, avatar: this.avatar }
    }
    /**
    * @method checkIdentity
    * @returns {id}  ID  - Loads all identities from cookies
    * @example
    */
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
    //console.log('addCookieObjectElement', params);
    var iCookie = getCookie('ep_Identitys')
    if (iCookie == '') {
        iCookie = JSON.stringify({})
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
function whatIsIt(object) {
    if (object === null) {
        return "null";
    }
    if (object === undefined) {
        return "undefined";
    }
    if (object.constructor === ''.constructor) {
        return "String";
    }
    if (object.constructor === [].constructor) {
        return "Array";
    }
    if (object.constructor === {}.constructor) {
        return "Object";
    }
    {
        return "don't know";
    }
}

function startStreaming() {
    return new Promise((resolve, reject) => {

        var options = {
            resolution: {
                width: 1920,
                height: 1080,
                framerate: 30
            },
            mediaRecorderOptions: {
                mimeType: 'video/webm;codecs=opus,vp8',
                videoBitsPerSecond: 2500000,
                audioBitsPerSecond: 128000
            },
        }

        var resolution = { width: 2560, height: 1440, framerate: 30 };
        navigator.mediaDevices
            .getDisplayMedia({
                audio: {
                    autoGainControl: false,
                    channelCount: 2,
                    echoCancellation: false,
                    latency: 0,
                    noiseSuppression: false,
                    sampleRate: 48000,
                    sampleSize: 16,
                    volume: 1.0
                },
                video: {
                    chromeMediaSource: 'desktop',
                    width: options.resolution.width,
                    height: options.resolution.height,
                    frameRate: options.resolution.framerate
                }
            })
            .then(async (stream) => {
                stopStream()
                var mediaRecorder = new MediaRecorder(stream, options.mediaRecorderOptions);
                stream = mediaRecorder.stream;
                localStream = stream;
                localVideo.srcObject = localStream;
                resolve(localStream);
            })
            .catch((err) => {
                console.log('nay', err);
                reject(err);
            });
    })
}

function getStream(remotesid) {
    socket.emit('getStream', { fromSocket: socket.id, toSocket: remotesid });
}

function stopStream() {
    try {
        let tracks = localVideo.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        localVideo.srcObject = null;
    } catch (error) {

    }

}

async function readFile(input, toSocketID) {

    let options = {
        initiator: true,
        remotesid: toSocketID
    }
    let peer = new Peer(options)
    var outdata = await peer.init(null);
    pm.addPeer(peer)

    var reciver = await pm.getPeerBySocketID(toSocketID)
    console.log('readFile', input, toSocketID, reciver);

    peer.peer.addEventListener('datachannel', (event) => {
        //this.dataChannel = event.channel
        console.log('readyState ', event.channel.readyState);
        if (event.channel.readyState) {
            let file = input.files[0];
            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            //fileReader.readAsDataURL(file);
            fileReader.onload = function () {
                // alert(fileReader.result);
                //console.log(fileReader.result);
                peer.send('fileReader.result');
                peer.send(arrayBufferToString(fileReader.result));
            };
            fileReader.onerror = function () {
                alert(fileReader.error);
            };
        }
    })
}

function handleIncommingChatMSG(params) {
    
}
//{msg: ''}
function handleOutgoingChatMSG(params) {
    //console.log('handleOutgoingChatMSG', params);
    socket.emit('chatMSG', params);
}



var identitys = []
function initIdentity() {
    var ido = getCookieObject('ep_Identitys')
    //console.log('ido ', ido);
    if (ido) {
        Object.keys(ido).forEach((id) => {
            console.log('Identity = ', id, ido[id])
            //identitys.push(new Identity(ido[id].id, ido[id].username, ido[id].avatar))
            identitys.push(new Identity({ id: ido[id].id, username: ido[id].username, avatar: ido[id].avatar }))
        })
    } else {
        identitys.push(new Identity({}))
    }

}
initIdentity();




// listen for incoming peer offers
// { fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } }
socket.on('peerOffer', async (indata) => {
    console.log('incoming Peer offer = ', indata);

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
    peers[indata.connectionID].peer.setRemoteDescription(new RTCSessionDescription(indata.data.answer))
})

socket.on('connect', () => { // console.log('connected to server');
    socket.emit('joinRoom', roomID, identitys[0])
})

socket.on('newRoomMember', (socketids) => {
    //console.log('New Members = ', socketids)
    renderButtons(socketids)
})

//{ fromSocket: this.localsid, toSocket: this.remotesid, connectionID: this.connectionID, data: { offer: offer } }
socket.on('getStream', async (indata) => {
    console.log('getStream = ', indata);
    console.log('localStream = ', localStream);
    if (!localStream) {
        await startStreaming()
    }

    console.log('getStream = ')
    let options = {
        initiator: true,
        remotesid: indata.fromSocket
    }
    let peer = new Peer(options)
    var outdata = await peer.init(null, localStream);
    pm.addPeer(peer)
})

socket.on('chatMSG', async (data) => {
    console.log('chatMSG = ', data);
    handleIncommingChatMSG(data);
})

var pm = new PeersManager()




//selectStream();
