socket.on('peerOffer', async (indata) => {
    console.log('incoming Peer offer = ', indata);

    var currentPeer = await pm.getPeerByConnectionID(indata.connectionID)
    if (currentPeer) {
        clearInterval(currentPeer.timer)
        currentPeer.peer.close()
    }

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

socket.on('membersLoaded', (sockets) => {
    // console.log('membersLoaded = ', socket, identity);
    for (const key in sockets) {
        const element = sockets[key];
        room.addMember(element.socket, element.identity)
    }
})

socket.on('memberAdded', (sockets, sid, identity) => {
    //console.log('New Members = ', sid, identity);
    room.addMember(sid, identity)
})

socket.on('memberRemoved', (sockets, sid, identity) => {
    //console.log('memberRemoved = ', sid, identity)
    room.removeMember(sid, identity)
})

socket.on('memberStreamingState', (sid, identity) => {
    //console.log('memberStreamingState = ', identity)
    room.changeMember(sid, identity)
})

socket.on('getStream', async (indata) => {
    console.log('getStream = ', indata);
    console.log('localStream = ', localStream);
    if (!localStream) {
        await startStreaming()
    }

    var availablePeer = await pm.getPeerBySocketID(indata.fromSocket)
    console.log('Available Peer = ', availablePeer)
    if (availablePeer) {
        console.log('remove Available Peer = ')
        availablePeer.remove()
    }
    console.log('pm.peers = ', pm.peers)

    let options = {
        initiator: true,
        remotesid: indata.fromSocket,
        type: 'video'
    }
    let peer = new Peer(options)
    var outdata = await peer.init(null, localStream);
    pm.addPeer(peer)

})

socket.on('chatMSG', async (data) => {
    //console.log('chatMSG = ', data);
    //handleIncommingChatMSG(data);
    renderMsgTemplate(data)
    soundsPlayer.play('incomming_Msg')
})

socket.on('loadChatMsgs', async (data) => {
    //console.log('loadChatMsgs = ', data);
    for (const key in data) {
        //handleIncommingChatMSG(data[key]);
        renderMsgTemplate(data[key])
    }
})

socket.on('reloadCSS', async () => {
    if (reloadCSS) {
        rcss()
    }
})