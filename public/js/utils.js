function rcss() {
    var links = document.getElementsByTagName("link");
    for (var cl in links) {
        var link = links[cl];
        if (link.rel === "stylesheet") {
            console.log('CSS File Reloaded ' + link.href);
            link.href += "";
        }
    }
}

function setCssVar(variable, value) {
    document.documentElement.style.setProperty('--' + variable, value);
}

function getCssVar(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + variable).trim();
}

function setStreamToWindow(peer) {
    //console.log("setStreamToWindow", peer);
    var videoWrapper = document.getElementById('videoElement_' + peer.remotesid)
    var remoteVideo = videoWrapper.getElementsByTagName('video')[0]
    //var icon = videoWrapper.getElementsByTagName('img')[0]
    remoteVideo.srcObject = peer.remoteStream;
    remoteVideo.onloadedmetadata = (e) => {
        remoteVideo.play()
        //icon.style = "display:none"
    };
}

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

function renderMsgTemplate(msg) {
    //console.log("renderMsgTemplate", msg);
    var chatBody = document.querySelector('.chat-body');
    var msgElement = document.getElementById('chatMsgTemplate').cloneNode(true).content.children[0];
    msgElement.setAttribute("name", 'msg_' + msg.fromIdentity.id)

    msgElement.querySelector('.chat-message-username').innerText = msg.fromIdentity.username;
    msgElement.querySelector('.chat-message-avatar').querySelector('img').src = msg.fromIdentity.avatar;

    //msgElement.querySelector('.connected-user').querySelector('.chat-message-username').innerText = msg.fromIdentity.username;
    //msgElement.querySelector('.connected-user').querySelector('img').src = msg.fromIdentity.avatar;
    var today = new Date();
    var msgDate = new Date(msg.time);
    // if today is the same as the day of the message, then show the time
    if (today.getDay() == msgDate.getDay() && today.getMonth() == msgDate.getMonth() && today.getFullYear() == msgDate.getFullYear()) {
        msgElement.querySelector('.chat-message-time').innerText = 'heute um ' + new Date(msg.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (today.getDay() == msgDate.getDay() + 1 && today.getMonth() == msgDate.getMonth() && today.getFullYear() == msgDate.getFullYear()) {
        msgElement.querySelector('.chat-message-time').innerText = 'gestern um ' + new Date(msg.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        msgElement.querySelector('.chat-message-time').innerText = new Date(msg.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    //msgElement.querySelector('.chat-message').querySelector('span').innerHTML = msg.msg;
    msgElement.querySelector('.chat-message-content').querySelector('span').innerHTML = msg.msg;

    chatBody.appendChild(msgElement);
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

};

function toggleSideBar(side) {
    if (side == "left") {
        var barisOpen = (document.getElementById('ls').offsetWidth > '0') ? true : false;
        setSideBar(side, !barisOpen)
    } else {
        var barisOpen = (document.getElementById('rs').offsetWidth > '0') ? true : false;
        setSideBar(side, !barisOpen)
    }
}


// show hide sidebar
function setSideBar(side, open) {

    var isLeftOpen = sidebarL.offsetWidth > '0' ? true : false;
    var isRightOpen = sidebarR.offsetWidth > '0' ? true : false;


    if (side == "left") {
        if (!open) {

            setCssVar('grid_left', '0fr')
            document.getElementById('ls').style.width = "0";
            document.getElementById('ls').style.left = "-100%";

        } else {
            setCssVar('grid_left', '1fr')
            document.getElementById('ls').style.width = "100%";
            document.getElementById('ls').style.left = "0px";


            /*     setCssVar('grid_right', '0fr')
                document.getElementById('rs').style.width = "0%";
                document.getElementById('rs').style.right = "-100%"; */
        }
    } else {
        if (!open) {
            setCssVar('grid_right', '0fr')
            document.getElementById('rs').style.width = "0%";
            document.getElementById('rs').style.right = "-100%";
        } else {
            setCssVar('grid_right', '1fr')
            document.getElementById('rs').style.width = "100%";
            document.getElementById('rs').style.right = "0px";


            /*    setCssVar('grid_left', '0fr')
               document.getElementById('ls').style.width = "0";
               document.getElementById('ls').style.left = "-100%"; */

        }
    }

    var left = Number(getCssVar('grid_left').substring(0, getCssVar('grid_left').length - 2));
    var right = Number(getCssVar('grid_right').substring(0, getCssVar('grid_right').length - 2));
    setCssVar('grid_mid', (5 - left - right) + 'fr')
}