window.onload = async function () {
    console.log("Start Init");
    room = new Room();
    console.log("Room Created");
    pm = new PeersManager()
    pma = new PeersManager()
    console.log("PeersManager Created");
    var isNewID = await initIdentity();
    console.log("Identity initalisiert");
    initModals();
    console.log("Modals initalisiert");
    initTabs()
    console.log("Tabs initalisiert");

    initEvents()
    console.log("Events initalisiert");
    initSound();
    console.log("Sounds initalisiert");
    console.log('chrome://webrtc-internals/');
    initDebug()
    console.log("Debug initalisiert");

    // initToasts()
    console.log("Toasts initalisiert");

    if (isNewID) {
        openProfileModal(() => {
            console.log("Profile Modal Closed");
            initJoinRoom();
        })
    } else {
        initJoinRoom();
        console.log("init Join Room");
    }


    //reloadInterval()
    console.log("Reload Interval initalisiert");

}