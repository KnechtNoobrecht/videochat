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

    new Toast({
        ms: 1000,
        content: 'Only Content'
    })
    new Toast({
        ms: 1500,
        content: 'Content',
        header: 'Head',
        footer: 'foot'
    })
    new Toast({
        ms: 2000,
        header: 'Head'
    })
    new Toast({
        ms: 2500,
        footer: 'Foot'
    })
    new Toast({
        ms: 0,
        header: 'muss geschlossen werden'
    })
}