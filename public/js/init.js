window.onload = async function () {
    console.log("Start Init");
    room = new Room();
    console.log("Room Created");
    pm = new PeersManager()
    pma = new PeersManager() // ????? War eine Vorbereitung für Voice Chat 
    console.log("PeersManager Created");
    var isNewID = await initIdentity();
    console.log("Identity initalisiert");
    initModals();

    document.getElementById('joinRoomID').value = roomID

    console.log("Modals initalisiert");
    initTabs()
    console.log("Tabs initalisiert");

    initEvents()
    console.log("Events initalisiert");
    initSound();
    console.log("Sounds initalisiert");
    console.log('chrome://webrtc-internals/');
    initDebug()

    // initToasts()
    console.log("Toasts initalisiert");

    if (isNewID && operatingMode != "share") {
        openProfileModal(() => {
            console.log("Profile Modal Closed");
            modals.joinRoom.open();
            //initJoinRoom();
        })
    } else {
        if (operatingMode == "video") {
            joinRoom();
        } else if (operatingMode == "share") {
            modals.shareFile.open()
            joinRoom();
        }
        console.log("init Join Room");
    }

}