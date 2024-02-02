window.onload = async function () {
    console.log("Start Init");
    room = new Room();
    console.log("Room Created");
    pm = new PeersManager()
    pma = new PeersManager() // ?????
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

    if (isNewID) {
        openProfileModal(() => {
            console.log("Profile Modal Closed");
            modals.joinRoom.open();
            //initJoinRoom();
        })
    } else {
<<<<<<< HEAD
        initJoinRoom();
=======
        joinRoom();
>>>>>>> parent of 7ff96f4... temporary commit, contains breaking changes.
        console.log("init Join Room");
    }

}