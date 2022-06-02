//import { Peer, PeersManager } from 'easy-peer';


//socket.on("connect", async () => {
//    //var idd = new Identity();
//    //console.log(idd);
//});

window.onload = function () {
    console.log("window.onload");
}

room.addEventListener("memberAdded", function (e) {
    cloneVideoElement(e.detail.identity, e.detail.sid)
    cloneUserElement(e.detail.identity, e.detail.sid)
});

room.addEventListener("memberRemoved", function (e) {
    var identity = e.detail.identity;
    var socketid = e.detail.sid;
    //console.log("removeMember event ", identity, socketid);
    var videowrapper = document.getElementById('videowrapper');
    videowrapper.removeChild(document.getElementById('videoElement_' + socketid));

    var connectedUsersList = document.getElementById('connected-users-list');
    connectedUsersList.removeChild(document.getElementById('userElement_' + socketid));

});

room.addEventListener("memberChanged", function (e) {
    var identity = e.detail.identity;
    var socketid = e.detail.sid;
    //console.log("memberChanged ", identity, socketid);
    //var videowrapper = document.getElementById('videowrapper');

    var userElement = document.getElementById('userElement_' + socketid);
    var videoElement = document.getElementById('videoElement_' + socketid);

    videoElement.querySelector('.namePlaceholder').innerText = identity.username;
    videoElement.querySelector('.avatar').src = identity.avatar

    userElement.getElementsByTagName('span')[0].innerHTML = identity.username;
    userElement.getElementsByTagName('img')[0].src = identity.avatar;

    if (identity.isStreaming) {
        userElement.getElementsByClassName('button-watch')[0].style = "display:flex !important";
    } else {
        userElement.getElementsByClassName('button-watch')[0].style = "display:none !important";
    }

    var userMsgs = Array.from(document.getElementsByName('msg_' + identity.id));
    console.log("userMsgs", userMsgs);

    for (var i = 0; i < userMsgs.length; i++) {
        userMsgs[i].querySelector('.connected-user').querySelector('.chat-message-username').innerText = identity.username;
        userMsgs[i].querySelector('.connected-user').querySelector('img').src = identity.avatar
    }
});

document.getElementById('inputMsg').addEventListener('keyup', function (e) {
    //console.log("keydown", e);
    console.log(e.srcElement.value.match(/\n\r?/g));


    if (e.srcElement.value.match(/\n\r?/g) != null) {
        rows = e.srcElement.value.match(/\n\r?/g).length + 1
    } else {
        rows = 1
    }

    e.srcElement.rows = rows

    if (e.keyCode == 13 && !e.shiftKey) {
        //sendMessage();
        var msg = e.srcElement.value
        if (msg.trim() != "") {
            e.preventDefault();
            msg = msg.trimStart().trim()
            msg = msg.replace(/\n\r?/g, ' <br />')

            room.sendMsg(msg);
        }
        document.getElementById('chatInput').reset();
        e.srcElement.rows = 1

    } else if (e.keyCode == 13) {
        //e.srcElement.rows++
        chatBody.scrollBy(0, 20)
    }
});


document.querySelector('#grid-container').ontouchstart = function (eve) {
    let touchobj = eve.changedTouches[0]; // erster Finger
    startx = parseInt(touchobj.clientX); // X/Y-Koordinaten relativ zum Viewport
    starty = parseInt(touchobj.clientY);
    //this.innerHTML = 'Touch Down!';
    // setCssVar('primary_bg', '#f92c47')
}

document.querySelector('#grid-container').ontouchend = function (eve) {
    //this.innerHTML = 'Touch Down!';
    //  setCssVar('primary_bg', '#202225')
    slideing = false;
}

document.querySelector('#grid-container').ontouchmove = function (eve) {
    //this.innerHTML = 'Touch Down!';
    let touchobj = eve.changedTouches[0]; // erster Finger
    let distx = parseInt(touchobj.clientX) - startx;
    let disty = parseInt(touchobj.clientY) - starty;
    var isLeftOpen = sidebarL.offsetWidth > '0' ? true : false;
    var isRightOpen = sidebarR.offsetWidth > '0' ? true : false;
    // moves.innerHTML = "touchmove horizontal: " + distx + "px vertikal: " + disty + "px";
    //console.log('sidebarL.offsetWidth = ', sidebarL.offsetWidth);
    //console.log('sidebarR.offsetWidth = ', sidebarR.offsetWidth);
    //console.log('distx = ', distx);
    //console.log('disty = ', disty);
    //console.log('isLeftOpen = ', isLeftOpen);
    //console.log('isRightOpen = ', isRightOpen);
    console.log('touch move event = ', eve);
    if (!slideing && !isLeftOpen) {
        if (isRightOpen) {
            if (distx > 200) {
                setSideBar('side', false)
                slideing = true;
            }

        } else {
            if (distx < -200) {
                setSideBar('side', true)
                slideing = true;
            }
        }
    }
    if (!slideing && !isRightOpen) {
        if (isLeftOpen) {
            if (distx < -200) {
                setSideBar('left', false)
                slideing = true;
            }
        } else {
            if (distx > 200) {
                setSideBar('left', true)
                slideing = true;
            }
        }
    }

    /*     if (getCssVar('grid_left') === '1fr') {
            if (distx > -200) {
                setSideBar('left', false)
            }

        } else {
            if (distx > 200) {
                setSideBar('left', true)
            }
        } */

    //   setCssVar('primary_bg', '#234421')
}

document.querySelector('.bot_bar').addEventListener('touchstart', function (e) {
    //e.preventDefault()
    // e.stopPropagation();
})


var width_size_before = 0;
var ro = new ResizeObserver(entries => {
    var isLeftOpen = sidebarL.offsetWidth > '0' ? true : false;
    var isRightOpen = sidebarR.offsetWidth > '0' ? true : false;
    for (let entry of entries) {
        const cr = entry.contentRect;
        //console.log('Element:', entry.target);
        console.log(`Element size: ${cr.width}px x ${cr.height}px`);
        //console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);


        if (width_size_before != cr.width) {
            if (cr.width <= 900) {
                if (!isLeftOpen) {
                    setSideBar('left', false)
                }
                if (!isRightOpen) {
                    setSideBar('right', false)
                }
            } else if (cr.width > 900) {
                setSideBar('left', true)
                setSideBar('right', true)
            }
        }
        width_size_before = cr.width;
    }
    //sizebefore = cr.width;
});

// Observe one or multiple elements
ro.observe(document.body);

console.log('chrome://webrtc-internals/');