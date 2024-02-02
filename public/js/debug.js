function initDebug() {

    var head = document.getElementById('infoDataWrapper').querySelector('.tabsHeader');
    var m = document.getElementById('infoDataWrapper')
    var offset;
    var x;
    var y;
    head.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mouseup", mouseUp, false);


    head.addEventListener("touchstart", touchStart, false);
    head.addEventListener("touchend", () => {
        console.log('touch end');
        window.removeEventListener("touchmove", touchMove, true);
    }, false);

    var debugSettings = {}
    debugSettings = getCookieObject('debugSettings')

    if (debugSettings == null) {
        debugSettings = {
            x: 2,
            y: 15,
            width: 300,
            height: 300,
            visible: false,
            bg_color: '#000000',
        }
        setCookie('debugSettings', JSON.stringify(debugSettings), 365)
    }
    m.style.left = debugSettings.x + '%'
    m.style.top = debugSettings.y + '%'
    m.style.width = debugSettings.width + 'px'
    m.style.height = debugSettings.height + 'px'
    m.style.backgroundColor = debugSettings.bg_color
    m.style.display = debugSettings.visible ? 'block' : 'none'

    document.querySelector('#debugVisable').checked = debugSettings.visible
    document.querySelector('#debugBGColor').value = debugSettings.bg_color


    function mouseUp() {
        window.removeEventListener("mousemove", move, true);
    }

    function mouseDown(e) {
        // SAVE THE OFFSET HERE
        offset = {
            left: e.pageX - realOffset(head).left,
            top: e.pageY - realOffset(head).top
        };
        window.addEventListener("mousemove", move, true);
    }

    function touchStart(e) {
        console.log(e);
        console.log(e.targetTouches[0]);
        console.log(e.targetTouches[0].pageX);
        console.log(e.targetTouches[0].pageY);
        offset = {
            left: e.targetTouches[0].pageX - realOffset(head).left,
            top: e.targetTouches[0].pageY - realOffset(head).top
        };

        window.addEventListener("touchmove", touchMove, true);
    }

    function touchMove(e) {
        console.log('touchmove');
        x = (e.targetTouches[0].pageX - offset.left) / window.innerWidth * 100;
        y = (e.targetTouches[0].pageY - offset.top) / window.innerHeight * 100;
        m.style.left = x + "%";
        m.style.top = y + "%";
        debugSettings.x = x;
        debugSettings.y = y;
        setCookie('debugSettings', JSON.stringify(debugSettings), 365)
    }

    function move(e) {
        x = (e.pageX - offset.left) / window.innerWidth * 100;
        y = (e.pageY - offset.top) / window.innerHeight * 100;
        m.style.left = x + "%";
        m.style.top = y + "%";
        debugSettings.x = x;
        debugSettings.y = y;
        setCookie('debugSettings', JSON.stringify(debugSettings), 365)
    }

    function toggleDebugVisable() {
        console.log('toggleDebugVisable', debugSettings.visible);

        debugSettings.visible = !debugSettings.visible
        console.log('toggleDebugVisable', debugSettings.visible);

        document.querySelector('#debugVisable').checked = debugSettings.visible
        m.style.display = debugSettings.visible ? 'block' : 'none'
        setCookie('debugSettings', JSON.stringify(debugSettings), 365)
    }

    /*
     * Returns the given element's offset relative to the document.
     */
    function realOffset(elem) {
        var top = 0,
            left = 0;
        while (elem) {
            top = top + parseInt(elem.offsetTop, 10) - elem.scrollTop;
            left = left + parseInt(elem.offsetLeft, 10);
            elem = elem.offsetParent;
        };
        return {
            top: top,
            left: left
        };
    }

    function _(element) {
        return document.getElementById(element);
    }


    setInterval(function () {
        document.getElementById('peerConnections').innerHTML = '';

        for (const key in peers) {
            if (Object.hasOwnProperty.call(peers, key)) {
                const peer = peers[key];
                var peerElement = document.getElementById(peer.connectionID + '_debug_peer_connection')
                var tempElement
                if (peerElement == null) {
                    tempElement = cloneTemplate('streamInfo')
                    document.getElementById('peerConnections').appendChild(tempElement);
                }
                tempElement.querySelector('#connectionID').innerHTML = 'Peer Connection ID = ' + peer.connectionID
                tempElement.querySelector('#initiator').innerHTML = 'Initiator = ' + peer.initiator
                tempElement.querySelector('#remotesid').innerHTML = 'Remote Socket ID = ' + peer.remotesid
                tempElement.querySelector('#localsid').innerHTML = 'Local Socket ID = ' + peer.localsid
                tempElement.querySelector('#connected').innerHTML = 'Peer Connected = ' + peer.connected
                tempElement.querySelector('#sended').querySelector('.current').innerHTML = 'Send Bitrate = ' + peer.sended.bitrate + ' kbps'
                tempElement.querySelector('#sended').querySelector('.total').innerHTML = 'Send Total = ' + peer.sended.totalBytes / 1024 / 1024 + ' MB'
                tempElement.querySelector('#received').querySelector('.current').innerHTML = 'Receive Bitrate = ' + peer.received.bitrate + ' kbps'
                tempElement.querySelector('#received').querySelector('.total').innerHTML = 'Receive Total = ' + peer.received.totalBytes / 1000 / 1000 + ' MB'
                /*                 tempElement.querySelector('#identity').querySelector('.username').innerHTML = 'Identity Username = ' + peer.identity.username
                                tempElement.querySelector('#identity').querySelector('.id').innerHTML = 'Identity ID = ' + peer.identity.id */
            }
        }

        for (const key in room.members) {
            const member = room.members[key];
            // console.log('member username = ', member.identity.username, 'member isAdmin = ', member.identity.isAdmin);
        }

        if(streamThumbnail) {
            document.getElementById('thumbnail_prev').src = streamThumbnail
        }
    }, 1000);


    var ro = new ResizeObserver(entries => {
        debugSettings.width = entries[0].contentRect.width;
        debugSettings.height = entries[0].contentRect.height;
        setCookie('debugSettings', JSON.stringify(debugSettings), 365)
    });

    // Observe one or multiple elements
    ro.observe(infoDataWrapper);


    document.addEventListener('keydown', (e) => {
        if (e.keyCode == 68 && e.ctrlKey) {
            //m.style.display = 'none'
            e.preventDefault();
            toggleDebugVisable()
        }

        if (e.keyCode == 89 && e.ctrlKey) {
            e.preventDefault();

            debugSettings = {
                x: 2,
                y: 15,
                width: 300,
                height: 300,
                visible: true,
                bg_color: '#000000',
            }
            setCookie('debugSettings', JSON.stringify(debugSettings), 365)
            m.style.left = debugSettings.x + '%'
            m.style.top = debugSettings.y + '%'
            m.style.width = debugSettings.width + 'px'
            m.style.height = debugSettings.height + 'px'
            m.style.backgroundColor = debugSettings.bg_color
            m.style.display = debugSettings.visible ? 'block' : 'none'
            document.querySelector('#debugVisable').checked = debugSettings.visible
            document.querySelector('#debugBGColor').value = debugSettings.bg_color
        }
    });
}

function saveDebugSettings() {
    var debugSettings = getCookieObject('debugSettings')
    debugSettings.visible = document.querySelector('#debugVisable').checked
    debugSettings.bg_color = document.querySelector('#debugBGColor').value
    setCookie('debugSettings', JSON.stringify(debugSettings), 365)
}

function logPeerVar(key, id) {
    console.log(pm.getPeerByConnectionID(id)[key]);
}