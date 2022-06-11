window.onload = function () {
    console.log("Start Init");
    room = new Room();
    console.log("Room Created");
    pm = new PeersManager()
    pma = new PeersManager()
    console.log("PeersManager Created");
    initIdentity();
    console.log("Identity initalisiert");
    initModals();
    console.log("Modals initalisiert");
    initEvents()
    console.log("Events initalisiert");
    initSound();
    console.log("Sounds initalisiert");
    console.log('chrome://webrtc-internals/');
    initDebug()
    console.log("Debug initalisiert");

    socket.emit('joinRoom', roomID, identitys[0])
    console.log("Room joined");
}