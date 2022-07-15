/*
Steffen Reimann
07.05.2022
*/


class BitrateObject {
    constructor() {
        this.bitrate = 0
        this.totalBytes = 0
    }
    getFormattedBitrate() {
        var ret = {
            value: 0,
            unit: 'bps'
        }
        if (this.bitrate > 1000000) {
            ret.value = (this.bitrate / 1000000).toFixed(2)
            ret.unit = 'gbps'
            return ret
        } else if (this.bitrate > 1000) {
            ret.value = (this.bitrate / 1000).toFixed(2)
            ret.unit = 'mbps'
            return ret
        } else {
            ret.value = this.bitrate.toFixed(2)
            ret.unit = 'kbps'
            return ret
        }
    }
}

class Peer extends EventTarget {
    #event;
    /**
     * @constructor
     * @method init()
     * @param {boolean}  initiator  - true if initiator
     * @param {String}  remotesid - The SocketIO id of the other client
     * @param {String}  connectionID - The from this p2p Connection
     * @example
     */
    constructor({
        initiator: initiator,
        remotesid: remotesid,
        connectionID: connectionID,
        identity: identity,
        type: type
    }) {
        super();
        if (initiator) {
            this.connectionID = connectionID || uuid()
            //this.connectionID = uuid()
        } else {
            //this.connectionID = uuid()
            this.connectionID = connectionID
        }
        console.log('peerServerOptions ', peerServerOptions);
        this.peer = new RTCPeerConnection(peerServerOptions)

        this.stream
        this.remoteStream

        this.initiator = initiator
        this.remotesid = remotesid
        this.localsid = socket.id
        this.connected = false
        this.type = type || 'video'
        this.tracks = []
        this.sended = new BitrateObject()
        this.received = new BitrateObject()

        console.log('Peer Constructor = ', this);
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
            console.log('init peer start');
            var prevReport = null;
            var that = this;
            var infoDataIn = document.getElementById('videoElement_' + this.remotesid).querySelector('#infoData_In')
            var infoDataOut = document.getElementById('videoElement_' + this.localsid).querySelector('#infoData_Out')
            var infoElement = renderDataInfo(this.connectionID)
            infoElement.querySelector('.infoDataHeader').innerHTML = this.connectionID


            this.timer = setInterval(function () {

                if (!that.peer) {
                    prevReport = null;
                    return;
                }
                that.peer.getStats(null).then(reporter => {
                    reporter.forEach(report => {
                        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                            if (report.framesPerSecond == undefined) {
                                return;
                            }

                            if (!prevReport) {
                                prevReport = report;
                            } else {
                                //console.log(report);
                                //console.log('infoData', infoData);
                                var bitrateReceived = Math.round((report.bytesReceived * 8 - prevReport.bytesReceived * 8) / (report.timestamp - prevReport.timestamp));

                                that.received.bitrate = bitrateReceived;
                                that.received.totalBytes = report.bytesReceived

                                //infoData.innerHTML = '<p>' + (report.bytesReceived * 8 - prevReport.bytesReceived * 8) / (report.timestamp - prevReport.timestamp) + 'Bit</p>'


                                infoElement.querySelector('.infoDataBody').innerHTML = `<p>Received <br>
                                Bitrate = ${bitrateReceived} kBit <br> 
                                Frames Dropped = ${report.framesDropped} <br>
                                FPS = ${report.framesPerSecond} <br>
                                packets Lost = ${report.packetsLost} <br>
                                Res = ${report.frameHeight} x ${report.frameWidth} <br>
                                </p>`
                                //console.log((report.bytesReceived * 8 - prevReport.bytesReceived * 8) / (report.timestamp - prevReport.timestamp));

                            }
                        } else if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                            if (!prevReport) {
                                prevReport = report;
                            } else {
                                //console.log('report outbound-rtp = ', report);
                                var bitrateSent = Math.round((report.bytesSent * 8 - prevReport.bytesSent * 8) / (report.timestamp - prevReport.timestamp));


                                that.sended.bitrate = bitrateSent;
                                that.sended.totalBytes = report.bytesSent

                                infoElement.querySelector('.infoDataBody').innerHTML = `<p>Sent <br> 
                                Bitrate = ${bitrateSent} kBit <br> 
                                FPS = ${report.framesPerSecond} <br>
                                Res = ${report.frameHeight} x ${report.frameWidth} <br>
                                </p>`
                            }
                        }
                    });
                });
            }, 500);

            this.peer.addEventListener('connectionstatechange', (event) => { // console.log(event);
                //console.log('--- connectionstatechange = ', this.peer.connectionState);
                if (this.peer.connectionState === 'connected') {
                    console.log('P2P connection established! ', this.connectionID)
                    this.connected = true
                    this.#event = new CustomEvent("connected");
                    this.dispatchEvent(this.#event);
                }
                if (this.peer.connectionState === 'disconnected') {
                    console.log('P2P connection closed!')
                    this.connected = false
                    //infoElement.parentNode.removeChild(infoElement);
                    this.remove();
                    //var remoteVideo = document.getElementById("remoteVideo-" + this.connectionID)
                    //remoteVideo.remove()
                }
                if (this.peer.connectionState === 'failed') {
                    console.log('P2P connection failed!', this.peer)
                    this.connected = false
                    this.remove();
                }
            })
            // this.peer.addEventListener('icecandidate', (event) => {});
            this.peer.addEventListener('icecandidateerror', (event) => {
                // console.log('onicecandidateerror')
                // console.log(event)
            });
            this.peer.addEventListener('negotiationneeded', (event) => {
                console.log('negotiation needed')
                console.log(event)
            });
            this.peer.addEventListener('icecandidate', (event) => {
                //console.log('icecandidate')
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
            });
            this.peer.addEventListener('track', (event) => {
                //console.log('ontrack', event);
                this.remoteStream = event.streams[0]
                setStreamToWindow(this)
                /*                this.remoteStream = event.streams[0]
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
                               remoteVideo.onloadedmetadata = (e) => remoteVideo.play(); */
            });
            this.peer.addEventListener('datachannel', (event) => {
                //this.dataChannel = event.channel
                //console.log('datachannel', event.channel);
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

                    this.#event = new CustomEvent("message", {
                        detail: {
                            data: incommingdata
                        }
                    });
                    this.dispatchEvent(this.#event);
                }
            });

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

                    //console.log('setLocalDescription', sdp);

                    this.peer.setLocalDescription(sdp);
                    //console.log('setLocalDescription remotesid = ', this.remotesid);
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
                    //console.log('setRemoteDescription', offer);
                    //console.log('setLocalDescription', sdp);
                    this.peer.setLocalDescription(sdp);
                    resolve(sdp)
                });


                console.log('after resolve', this.peer)
                //const answer = await this.peer.createAnswer()
                //await this.peer.setLocalDescription(answer)
                //resolve(answer)
            }
            console.log('init peer finished');
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
        this.send({
            removeTracks: true
        })
        for (const key in this.tracks) {
            const element = this.tracks[key];
            //console.log('removeTrack', element);
            this.peer.removeTrack(element);
        }
    }
    remove() {
        //this.removeTracks()

        console.log('remove peer start');

        var debugNode = document.getElementById(this.connectionID + '_dataInfo')
        debugNode.parentNode.removeChild(debugNode);

        //document.getElementById('videoElement_' + this.remotesid).getElementsByTagName('video')[0].srcObject = null;
        document.getElementById('videoElement_' + this.remotesid).querySelector('video').srcObject = null;
        this.peer.close()
        delete peers[this.connectionID]
        delete pm.peers[this.connectionID]
        this.#event = new CustomEvent("removed", {
            detail: {
                sid: this.remotesid,
                identity: this.identity
            }
        });
        this.dispatchEvent(this.#event);
        delete this
        console.log('remove peer end ', peers);
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
            resolve(null)
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
        console.log('closeAllPeers');
        for (const peer in peers) {
            this.peers[peer].remove()
            // peers[peer.connectionID].remove()
        }
        return peers
    }
    closeAllInitializedPeers() {
        console.log('closeAllInitializedPeers');
        for (const peer in peers) {
            if (peers[peer].initiator) {
                this.peers[peer].remove()
            }
        }
        return peers
    }
    async reconnectAllPeers() {
        console.log('reconnectAllPeers = ', this.peers);
        for (const peer in this.peers) {
            console.log('reconnectAllPeers', this.peers[peer]);
            var oldpeer = this.peers[peer]
            //this.peers[peer.id].init();
            if (oldpeer.initiator) {
                clearInterval(oldpeer.timer)
                let options = {
                    initiator: true,
                    remotesid: oldpeer.remotesid
                }
                let peer = new Peer(options)
                var outdata = await peer.init(null, localStream);
                pm.addPeer(peer)
                oldpeer.remove()
            }
        }
        return peers
    }
    getBitrateStats() {
        var stats = {
            sended: {
                currentBitrate: 0,
                totalBytes: 0
            },
            received: {
                currentBitrate: 0,
                totalBytes: 0
            }
        }
        for (const peer in peers) {
            var peerA = peers[peer]
            console.log('getBitrateStats', peerA);
            stats.sended.currentBitrate += peerA.sended.currentBitrate
            stats.sended.totalBytes += peerA.sended.totalBytes
            stats.received.currentBitrate += peerA.received.currentBitrate
            stats.received.totalBytes += peerA.received.totalBytes
        }
        return stats
    }
}

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
    constructor({
        id: id,
        username: username,
        avatar: avatar
    }) {
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
        addCookieObjectElement({
            id: this.id,
            username: this.username,
            avatar: this.avatar
        })

        return {
            id: this.id,
            username: this.username,
            avatar: this.avatar
        }
    }

    /**
     * @method getIdentity - get Identity Object
     * @returns {id}  ID  - { id: this.id, username: this.username, avatar: this.avatar }
     * @example
     */
    get() {
        return {
            id: this.id,
            username: this.username,
            avatar: this.avatar
        }
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
        return {
            id: this.id,
            username: this.username,
            avatar: this.avatar
        }
    }
    /**
     * @method checkIdentity
     * @returns {id}  ID  - Loads all identities from cookies
     * @example
     */
    checkIdentity() {
        let coockies = getCookieObject('ep_Identitys')
        if (coockies.length > 0) {}
    }
}

class Room extends EventTarget {
    #event;
    constructor() {
        super();
        this.id = window.location.pathname.split('/').pop()
        this.members = {}
    }
    addMember(sid, identity) {
        if (!this.members[sid]) {
            this.members[sid] = {
                sid: sid,
                identity: identity
            }

            this.#event = new CustomEvent("memberAdded", {
                detail: {
                    sid: sid,
                    identity: identity
                }
            });
            this.dispatchEvent(this.#event);
        } else {
            //console.log('Member already in room')
        }
    }
    removeMember(sid, identity) {
        if (this.members[sid]) {
            delete this.members[sid]
            this.#event = new CustomEvent("memberRemoved", {
                detail: {
                    sid: sid,
                    identity: identity
                }
            });
            this.dispatchEvent(this.#event);
        } else {
            console.log('Member not in room')
        }
    }
    changeMember(sid, identity) {
        console.log('changeMember', sid, identity);
        this.#event = new CustomEvent("memberChanged", {
            detail: {
                sid: sid,
                identity: identity
            }
        });
        this.dispatchEvent(this.#event);
        this.members[sid] = {
            sid: sid,
            identity: identity
        }
        console.log('Member changed');
    }
    sendMsg(msg) {
        var data = {
            room: this.id,
            msg: msg
        }
        socket.emit('chatMSG', data);
    }
}

class SoundsPlayer {
    constructor(options) {
        this.sounds = options
    }
    play(key) {
        // console.log('play', key);
        // console.log('this.sounds', this.sounds);
        var audio = new Audio(this.sounds[key].path);
        audio.volume = this.sounds[key].volume;
        audio.play();
    }

}

class Once {
    constructor(cb) {
        this.isDone = false;
        this.cb = cb;
    }
    exec() {
        if (!this.isDone) {
            this.cb();
            this.isDone = true;
            return true;
        }
        return false;
    }
    reset() {
        this.isDone = false;
    }
}