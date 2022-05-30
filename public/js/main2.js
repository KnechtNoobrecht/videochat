//import { Peer, PeersManager } from 'easy-peer';


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
    var options = {
        initiator: true,
        remotesid: sid
    };
    var p = new Peer(options);
    await p.init(null);
    pm.addPeer(p);
}


room.addEventListener("memberAdded", function (e) {
    cloneVideoElement(e.detail.identity, e.detail.sid)
    cloneUserElement(e.detail.identity, e.detail.sid)
});

room.addEventListener("memberRemoved", function (e) {
    var identity = e.detail.identity;
    var socketid = e.detail.sid;
    console.log("removeMember event ", identity, socketid);
    var videowrapper = document.getElementById('videowrapper');
    videowrapper.removeChild(document.getElementById('videoElement_' + socketid));

    var connectedUsersList = document.getElementById('connected-users-list');
    connectedUsersList.removeChild(document.getElementById('userElement_' + socketid));

});

room.addEventListener("memberChanged", function (e) {
    var identity = e.detail.identity;
    var socketid = e.detail.sid;
    console.log("removeMember memberChanged ", identity, socketid);
    //var videowrapper = document.getElementById('videowrapper');

    var userElement = document.getElementById('userElement_' + socketid);
    userElement.getElementsByTagName('span')[0].innerHTML = identity.username;
    userElement.getElementsByTagName('img')[0].src = identity.avatar;

    if (identity.isStreaming) {
        userElement.getElementsByClassName('button-watch')[0].style = "display:flex !important";
    } else {
        userElement.getElementsByClassName('button-watch')[0].style = "display:none !important";
    }
});

function setStreamToWindow(peer) {
    console.log("setStreamToWindow", peer);
    var videoWrapper = document.getElementById('videoElement_' + peer.remotesid)
    var remoteVideo = videoWrapper.getElementsByTagName('video')[0]
    //var icon = videoWrapper.getElementsByTagName('img')[0]
    remoteVideo.srcObject = peer.remoteStream;
    remoteVideo.onloadedmetadata = (e) => {
        remoteVideo.play()
        //icon.style = "display:none"
    };
}
//	{"room":"","msg":"öä##","fromSocket":"","fromIdenteity":{"id":"","username":"","avatar":"","isStreaming":}}
function renderNewChatMsg(data) {
    console.log("renderNewChatMsg", data);
    console.log("data.fromIdentity", data.fromIdentity);
    var chatBody = document.getElementsByClassName('chat-body')[0];
    var chatMessageWrapper = document.createElement('div');
    chatMessageWrapper.className = 'chat-message-wrapper';

    var connectedUser = document.createElement('div');
    connectedUser.className = 'connected-user';

    var userImg = document.createElement('img');
    userImg.src = data.fromIdentity.avatar;
    var userName = document.createElement('span');
    userName.innerHTML = data.fromIdentity.username;

    connectedUser.appendChild(userImg);
    connectedUser.appendChild(userName);

    var chatMessage = document.createElement('div');
    chatMessage.className = 'chat-message';
    var msg = document.createElement('span');


    msg.innerHTML = data.msg



    chatMessage.appendChild(msg);
    chatMessageWrapper.appendChild(connectedUser);
    chatMessageWrapper.appendChild(chatMessage);

    chatBody.appendChild(chatMessageWrapper);

    chatBody.scrollTop = chatBody.scrollHeight;
}


/* function isValidURL(value) {
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(value);
} */

function cloneVideoElement(identity, socketid) {
    var clone = document.getElementById('videoElementTemplate').cloneNode(true).content.children[0];
    clone.id = 'videoElement_' + socketid
    clone.querySelector('.namePlaceholder').innerText = identity.username;
    clone.querySelector('.avatar').src = identity.avatar
    //clone.querySelector('.videoElement').id = socketid + 'video';
    clone.onclick = function () {
        console.log("videoElement_" + socketid + " clicked");
    }
    clone.querySelector('.fullscreenBTN').onclick = function () {
        clone.querySelector('video').requestFullscreen();
    }
    clone.querySelector('.streamVolumeSlider').oninput = function () {
        clone.querySelector('video').volume = clone.querySelector('.streamVolumeSlider').value / 100;
    }
    document.getElementById('videowrapper').appendChild(clone);
}

function cloneUserElement(identity, socketid) {
    var clone = document.getElementById('connectedUserTemplate').cloneNode(true).content.children[0];

    clone.id = 'userElement_' + socketid
    clone.querySelector('.connected-user').querySelector('span').innerText = identity.username;
    clone.querySelector('.connected-user').querySelector('img').src = identity.avatar;
    clone.querySelector('.button-watch').onclick = () => getStream(socketid)
    document.getElementById('connected-users-list').appendChild(clone);
    if (identity.isStreaming) {
        clone.querySelector('.button-watch').style = "display:flex !important";
    } else {
        clone.querySelector('.button-watch').style = "display:none !important";
    }
}



function isValidURL(str) {
    console.log("isValidURL", str);
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

function matchYoutubeUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (url.match(p)) {
        return url.match(p)[1];
    }
    return false;
}

function youtubeUrlParser(url) {

    var timeToSec = function (str) {
        var sec = 0;
        if (/h/.test(str)) {
            sec += parseInt(str.match(/(\d+)h/, '$1')[0], 10) * 60 * 60;
        }
        if (/m/.test(str)) {
            sec += parseInt(str.match(/(\d+)m/, '$1')[0], 10) * 60;
        }
        if (/s/.test(str)) {
            sec += parseInt(str.match(/(\d+)s/, '$1')[0], 10);
        }
        return sec;
    };

    var videoId = /^https?\:\/\/(www\.)?youtu\.be/.test(url) ? url.replace(/^https?\:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, "$2") : url.replace(/.*\?v\=([\w-]{11}).*/, "$1");
    var videoStartTime = /[^a-z]t\=/.test(url) ? url.replace(/^.+t\=([\dhms]+).*$/, '$1') : 0;
    var videoStartSeconds = videoStartTime ? timeToSec(videoStartTime) : 0;
    var videoShowRelated = ~~/rel\=1/.test(url);

    return {
        id: videoId,
        startString: videoStartTime,
        startSeconds: videoStartSeconds,
        showRelated: videoShowRelated
    };

}; // youtubeParser();



function sendMessage() {

    var msg = document.getElementById('inputMsg').value;
    console.log("sendMessage", msg);

}

document.getElementById('inputMsg').addEventListener('keydown', function (e) {
    console.log("keydown", e);
    var rows = e.srcElement.value.split("\n").length + 1;


    if (e.keyCode == 13 && !e.shiftKey) {
        //sendMessage();
        var msg = e.srcElement.value
        msg = msg.replace(/\n\r?/g, ' <br />')
        room.sendMsg(msg);
        resetTextarea()
        rows = 0
    } else if (e.keyCode == 13) {
        rows++;
    }
    if (e.srcElement.value == "") {
        rows = 0
    }
    e.srcElement.style.height = (rows * 15) + "px";
    document.getElementsByClassName('chat-body')[0].style.bottom = (70 + (rows * 15)) + "px";
    document.getElementsByClassName('chat-body')[0].scrollBy(0, 180);
});


document.getElementById('rs').addEventListener('drop', function (e) {
    e.preventDefault(); // stops the browser from redirecting 
    e.stopPropagation();
    console.log("drop", e);
    return false;
}, false)


document.getElementById('rs').addEventListener("dragenter", function (e) {
    e.preventDefault(); // stops the browser from redirecting 
    e.stopPropagation();
    //console.log("dragenter", e);
    document.getElementById('rs').style.backgroundColor = "rgba(0,0,0,0.1)";
    return false;
}, false);

document.getElementById('rs').addEventListener("dragleave", function (e) {
    e.preventDefault(); // stops the browser from redirecting 
    e.stopPropagation();
    //console.log("dragenter", e);
    document.getElementById('rs').style.backgroundColor = "rgba(0,0,0,0)";
    return false;
}, false);


resetTextarea = function () {
    console.log("resetTextarea");
    var elem = document.getElementById('inputMsg')
    elem.value = elem.value.replace(/\n\r?/g, '')
    elem.value = ''
}

var isChatOpen = true;
var chatbtn = document.getElementsByClassName('chat-open-close-btn')[0];

function toggleChat() {
    var str = document.getElementById('grid-container').style
    console.log("toggleChat", str.gridTemplateColumns);
    if (isChatOpen) {

        document.getElementById('grid-container').style.gridTemplateColumns = "1fr 4fr 0fr";
        chatbtn.style.transform = "rotate(0deg)";
    } else {

        document.getElementById('grid-container').style.gridTemplateColumns = "1fr 3fr 1fr";
        chatbtn.style.transform = "rotate(180deg)";
    }
    isChatOpen = !isChatOpen
}


var ro = new ResizeObserver(entries => {
    for (let entry of entries) {
        const cr = entry.contentRect;
        console.log('Element:', entry.target);
        console.log(`Element size: ${cr.width}px x ${cr.height}px`);
        console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
    }
});

// Observe one or multiple elements
ro.observe(document.getElementById('videowrapper'));

console.log('chrome://webrtc-internals/');