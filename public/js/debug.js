function initDebug() {

    var head = document.getElementById('infoDataWrapper').querySelector('.tabsHeader');
    var m = document.getElementById('infoDataWrapper')
    var offset;
    head.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mouseup", mouseUp, false);

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

    function move(e) {
        // REUSE THE OFFSET HERE
        m.style.left = (e.pageX - offset.left) + "px";
        m.style.top = (e.pageY - offset.top) + "px";
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
        //peers
        //peerConnections
        document.getElementById('peerConnections').innerHTML = '';
        for (const key in peers) {
            if (Object.hasOwnProperty.call(peers, key)) {
                const element = peers[key];
                for (const key in element) {
                    if (Object.hasOwnProperty.call(element, key)) {
                        const element2 = element[key];
                        document.getElementById('peerConnections').innerHTML += `
                        <div onclick="console.log(pm.getPeerByConnectionID('${element.connectionID}')['${key}'])"> ${key} = ${element2} </div>`;
                    }
                }
                // document.getElementById('peerConnections').innerHTML += '<div class="infoData">' + JSON.stringify(element) + '</div>'
            }
        }

    }, 1000);
}

function logPeerVar(key, id) {
    console.log(pm.getPeerByConnectionID(id)[key]);
}