//import { Peer, PeersManager } from 'easy-peer';
const localVideo = document.getElementById('localVideo');
const videoWrapper = document.getElementById('videowrapper')
const framerateSlider = document.getElementById('slider-fr')
const resolutionSlider = document.getElementById('slider-rs')
const framerateDiv = document.getElementById('framerateDiv');
const resolutionDiv = document.getElementById('resolutionDiv');

//socket.on("connect", async () => {
//    //var idd = new Identity();
//    //console.log(idd);
//});


function renderButtons(sioids) {
    var html = "";
    sioids.forEach((element) => {
        if (element && element.socket != socket.id) {
            html += `<button id="selectStreamButton" onclick="getStream('${element.socket}')">Call ${element.identity.username} - ${element.socket}</button>`;
            html += `<input type="file" onchange="readFile(this,'${element.socket}')">send file to ${element.identity.username} - ${element.socket}</input><br>`;
        } else {
            html += `<button id="selectStreamButton" >This Tab - ${element.identity.username}</button><br>`;
        }
    });
    document.getElementById("buttosdiv").innerHTML = html;
}

async function callSID(sid) {
    var options = { initiator: true, remotesid: sid };
    var p = new Peer(options);
    await p.init(null);
    pm.addPeer(p);
}


room.addEventListener("memberAdded", function (e) {
    var identity = e.detail.identity;
    var socketid = e.detail.sid;
    console.log("newMember event ", identity, socketid);
    var div = document.getElementById(identity.id);
    if (!div) {
        var namePlaceholder = document.createElement('div');
        namePlaceholder.innerHTML = identity.username;
        namePlaceholder.className = 'namePlaceholder';

        var imgPlaceholder = document.createElement('img');
        imgPlaceholder.src = identity.avatar
        imgPlaceholder.className = 'avatar';

        var newVideoElement = document.createElement('div');
        newVideoElement.id = socketid + 'video';
        newVideoElement.className = "videoElement";

        var videoPlaceholder = document.createElement('video');

        newVideoElement.appendChild(namePlaceholder);
        newVideoElement.appendChild(imgPlaceholder);
        newVideoElement.appendChild(videoPlaceholder);

        document.getElementById('videowrapper').appendChild(newVideoElement);



        var connectedUserWrapper = document.createElement('div');
        connectedUserWrapper.className = 'connected-user-wrapper';
        connectedUserWrapper.id = socketid + 'username';


        var connectedUser = document.createElement('div');
        connectedUser.className = 'connected-user';

        var connectedUserImg = document.createElement('img');
        connectedUserImg.src = identity.avatar;
        var connectedUserName = document.createElement('span');
        connectedUserName.innerHTML = identity.username;

        connectedUser.appendChild(connectedUserImg);
        connectedUser.appendChild(connectedUserName);
        connectedUserWrapper.appendChild(connectedUser);


        var buttonWatch = document.createElement('div');
        buttonWatch.className = 'button-watch';
        buttonWatch.onclick = () => getStream(socketid)

        var liveIcon = document.createElement('img');
        liveIcon.src = '/svg/LiveButton1.svg';
        var liveText = document.createElement('span');
        liveText.innerHTML = 'Watch';

        buttonWatch.appendChild(liveIcon);
        buttonWatch.appendChild(liveText);
        connectedUserWrapper.appendChild(buttonWatch);

        document.getElementById('connected-users-list').appendChild(connectedUserWrapper);

        if (identity.isStreaming) {
            buttonWatch.style = "display:flex !important";
        } else {
            buttonWatch.style = "display:none !important";
        }
    }
});

room.addEventListener("memberRemoved", function (e) {
    var identity = e.detail.identity;
    var socketid = e.detail.sid;
    console.log("removeMember event ", identity, socketid);
    var videowrapper = document.getElementById('videowrapper');
    videowrapper.removeChild(document.getElementById(socketid + 'video'));

    var connectedUsersList = document.getElementById('connected-users-list');
    connectedUsersList.removeChild(document.getElementById(socketid + 'username'));

});

room.addEventListener("memberChanged", function (e) {
    var identity = e.detail.identity;
    var socketid = e.detail.sid;
    console.log("removeMember memberChanged ", identity, socketid);
    //var videowrapper = document.getElementById('videowrapper');

    var userElement = document.getElementById(socketid + 'username');
    userElement.getElementsByTagName('span')[0].innerHTML = identity.username;
    userElement.getElementsByTagName('img')[0].src = identity.avatar;

    if (identity.isStreaming) {
        userElement.getElementsByClassName('button-watch')[0].style = "display:flex !important";
    } else {
        userElement.getElementsByClassName('button-watch')[0].style = "display:none !important";
    }
});

function setStreamToWindow(peer) {
    console.log("setStreamToWindow");
    var videoWrapper = document.getElementById(peer.remotesid + 'video')
    var remoteVideo = videoWrapper.getElementsByTagName('video')[0]
    var icon = videoWrapper.getElementsByTagName('img')[0]


    remoteVideo.srcObject = peer.remoteStream;
    remoteVideo.onloadedmetadata = (e) => {
        remoteVideo.play()
        icon.style = "display:none"
    };
}

function toggleSlider(ctx) {
    switch (ctx.id) {
        case "framerateDiv":
            if (framerateSlider.classList.contains("slider-right")) {
                framerateSlider.classList.remove("slider-right");
                // set framerate
            } else {
                framerateSlider.classList.add("slider-right");
                // set framerate
            }
            break;

        case "resolutionDiv":
            if (resolutionSlider.classList.contains("slider-right")) {
                resolutionSlider.classList.remove("slider-right");
                // set resolution
            } else {
                resolutionSlider.classList.add("slider-right");
                // set resolution
            }
            break;

        default:
            break;
    }
}

framerateDiv.onclick = function () {
    toggleSlider(this)
}

resolutionDiv.onclick = function () {
    toggleSlider(this)
}

