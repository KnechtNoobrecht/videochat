// client-side

var firstConnect = true;
socket.on("connect", () => {
    console.log('connect socket.io: ', socket.id);

    if (!firstConnect) {
        location.reload();
    }
    firstConnect = false
});

socket.on('reconnect', () => {
    console.log('Reconnected socket.io: ', socket.id);
})

socket.on('disconnect', () => {
    console.log('disconnect socket.io: ', socket.id);
})

socket.on('peerOffer', async (indata) => {
    if(indata.type == "share") {
        console.log("skipping peerOffer because it came from share room");
        return
    }
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
        connectionID: indata.connectionID,
        bitrate: indata.bitrate
    }
    let peer = new Peer(options)
    var outdata = await peer.init(indata.data.offer)
    pm.addPeer(peer)
    console.log("emitting peer answer");
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
    console.log('memberStreamingState = ', identity)
    room.changeMember(sid, identity)
})

socket.on('getStream', async (indata) => {
    if (!localStream) {
        await startStreaming()
    }

    var availablePeer = await pm.getPeerBySocketID(indata.fromSocket)
    if (availablePeer && availablePeer.initiator) {
        availablePeer.remove()
    }


    let options = {
        initiator: true,
        remotesid: indata.fromSocket,
        type: 'video',
        bitrate: indata.bitrate || 3000,
        targetBrowser: indata.browser
    }
    let peer = new Peer(options)
    var outdata = await peer.init(null, localStream);
    pm.addPeer(peer)
})

socket.on('chatMSG', async (data) => {
    console.log('chatMSG = ', data);
    console.log('room = ', room);
    //handleIncommingChatMSG(data);
    var msgElement = renderMsgTemplate(data)
    pushNewChatMsgToChat(msgElement)

    data.HTMLElement = msgElement
    room.msgs[data.id] = data
    soundsPlayer.play('incomming_Msg')
})
socket.on('updateMsg', async (data) => {
    console.log('updateMsg = ', data);
    console.log('room = ', room);
    //handleIncommingChatMSG(data);
    var msgElement = updateChatMsg(data)
    updateMsgAttachment(data)
    //pushNewChatMsgToChat(msgElement)

    data.HTMLElement = msgElement
    room.msgs[data.id] = data
    //soundsPlayer.play('incomming_Msg')
})

socket.on('loadChatMsgs', async (data) => {
    for (const key in data) {
        //handleIncommingChatMSG(data[key]);
        var msgElement = renderMsgTemplate(data[key])
        pushNewChatMsgToChat(msgElement)
        data[key].HTMLElement = msgElement
        room.msgs[data[key].id] = data[key]
    }
    console.log('room = ', room);
    console.log("Successfully loaded chat messages")
})

socket.on('updateMsgAttachment', async (data) => {
    console.log('updateMsgAttachment = ', data);
    updateMsgAttachment(data)
})

socket.on('ban', async () => {
    //console.log('ban = ');
    window.location.href = '/';
})

socket.on('kick', async () => {
    //console.log('ban = ');
    window.location.href = '/';
})

socket.on('reloadCSS', async () => {
    if (reloadCSS) {
        console.log('Reload Css');
        rcss()
    }
})