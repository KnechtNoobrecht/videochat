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
    remoteVideo.style.zIndex = "3";
    remoteVideo.style.opacity = "1";
    inStageMode = false


    videoWrapper.addEventListener('mouseover', () => {
        videoWrapper.querySelector('.sliderWrapper').style.width = "calc(100% - 20px)"
    })

    videoWrapper.addEventListener('mouseout', () => {
        videoWrapper.querySelector('.sliderWrapper').style.width = videoWrapper.querySelector('.namePlaceholder').getBoundingClientRect().width + "px"
    })

    sortStreams()
    remoteVideo.srcObject = peer.remoteStream;
    remoteVideo.onloadedmetadata = (e) => {
        remoteVideo.play()
        //icon.style = "display:none"
    };
}

function resetVideoWrapperElement(remotesid) {
    var videoWrapper = document.getElementById('videoElement_' + remotesid)
    var remoteVideo = videoWrapper.getElementsByTagName('video')[0]
    remoteVideo.style.zIndex = "0";
    remoteVideo.style.opacity = "0";
}

function pushNewChatMsgToChat(msgElement) {
    var chatBody = document.querySelector('.chat-body');
    chatBody.appendChild(msgElement);
    msgElement.scrollIntoView()
}

function updateChatMsg(data) {

    console.log('updateChatMsg: ', data);
    var chatBody = document.querySelector('.chat-body');
    chatBody.querySelector('#msg_' + data.id).querySelector('.chat-message-content').innerHTML = data.renderdMsg;

    return chatBody.querySelector('#msg_' + data.id)
    /*     var msgElement = renderMsgTemplate(data, true)
        //pushNewChatMsgToChat(msgElement)
        data.HTMLElement = msgElement
        room.msgs[data.id] = data
        chatBody.querySelector('#msg_' + msgid).replaceWith(msgElement) */
}

function updateMsgAttachment(msg) {

    console.log('updateMsgAttachment: ', msg);
    var chatBody = document.querySelector('.chat-body');
    //chatBody.querySelector('#msg_' + msg.id).querySelector('.chat-message-content').innerHTML = msg.renderdMsg;
    var msgElement = chatBody.querySelector('#msg_' + msg.id)

    room.msgs[msg.id] = msg
    //msgElement.querySelector('.chat-message-attachments').innerHTML = '';
    for (const attachmentid in msg.attachments) {
        if (Object.hasOwnProperty.call(msg.attachments, attachmentid)) {
            const attachment = msg.attachments[attachmentid];
            if (attachment.fileExt) {
                var attachmentElement = renderAttachmentType(attachment)
                attachmentElement.setAttribute('attachmentid', attachmentid)

                if (attachmentElement) {
                    console.log(attachmentElement);
                    console.log(msgElement.querySelector('.chat-message-attachments').querySelector(`[attachmentid="${attachmentid}"]`));
                    if (attachmentElement != msgElement.querySelector('.chat-message-attachments').querySelector(`[attachmentid="${attachmentid}"]`)) {
                        msgElement.querySelector('.chat-message-attachments').querySelector(`[attachmentid="${attachmentid}"]`).replaceWith(attachmentElement)
                    }
                }
            }
        }
    }
    return chatBody.querySelector('#msg_' + msg.id)
}

function renderAttachmentType(attachment) {
    var attachmentElement = null
    switch (attachment.fileExt.toUpperCase()) {
        case '.PNG':
        case '.JPG':
        case '.WEBP':
        case '.GIF':
            attachmentElement = document.createElement('img')
            attachmentElement.src = window.location.origin + '/' + attachment.url;
            break;

        case '.MP4':
            attachmentElement = document.createElement('video')
            attachmentElement.controls = true;
            attachmentElement.setAttribute("disablepictureinpicture", "")
            attachmentElement.setAttribute("controlslist", "nodownload noplaybackrate")
            attachmentElement.src = window.location.origin + '/' + attachment.url;
            break;

        default:
            attachmentElement = document.createElement('div')
            attachmentElement.innerHTML = window.location.origin + '/' + attachment.url
            break;
    }
    attachmentElement.classList.add('chat-Attachment');
    return attachmentElement
}

function renderMsgTemplate(msg) {
    console.log("renderMsgTemplate:", msg);
    var msgElement = document.getElementById('chatMsgTemplate').cloneNode(true).content.children[0];
    var msgElements = document.querySelectorAll('.chat-message-wrapper')
    var lastMsgElement = msgElements[msgElements.length - 1]
    var timeBetweenMsgsInSec = -1
    var today = new Date();
    var msgDate = new Date(msg.time);

    msgElement.setAttribute("sendTime", msg.time);
    msgElement.setAttribute("fromIdentity", msg.fromIdentity.id);
    msgElement.id = 'msg_' + msg.id;
    //console.log("msgElement", msg);                         
    if (!isMe(msg.fromSocket)) {
        msgElement.querySelector('.chat-message-username').innerText = msg.fromIdentity.username;
    } else {
        msgElement.querySelector('.chat-message-username').innerText = meString;
    }
    //msgElement.querySelector('.chat-message-username').innerText = msg.fromIdentity.username;
    msgElement.querySelector('.chat-message-avatar').querySelector('img').src = msg.fromIdentity.avatar;

    //msgElement.querySelector('.connected-user').querySelector('.chat-message-username').innerText = msg.fromIdentity.username;
    //msgElement.querySelector('.connected-user').querySelector('img').src = msg.fromIdentity.avatar;



    console.log(today.getDay(), msgDate.getDay());
    // if today is the same as the day of the message, then show the time
    if (today.getDay() == msgDate.getDay() && today.getMonth() == msgDate.getMonth() && today.getFullYear() == msgDate.getFullYear()) {
        msgElement.querySelector('.chat-message-time').innerText = new Date(msg.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (today.getDay() == msgDate.getDay() + 1 && today.getMonth() == msgDate.getMonth() && today.getFullYear() == msgDate.getFullYear()) {
        msgElement.querySelector('.chat-message-time').innerText = 'gestern ' + new Date(msg.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        const day = msgDate.getDate().toString().padStart(2, '0');
        const month = (msgDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
        const year = msgDate.getFullYear().toString();
        msgElement.querySelector('.chat-message-time').innerText = `${day}.${month}.${year} ` + new Date(msg.time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    //msgElement.querySelector('.chat-message').querySelector('span').innerHTML = msg.msg;
    msgElement.querySelector('.chat-message-content').querySelector('span').innerHTML = msg.renderdMsg;


    for (const attachmentid in msg.attachments) {
        if (Object.hasOwnProperty.call(msg.attachments, attachmentid)) {
            const attachment = msg.attachments[attachmentid];
            if (attachment.fileExt) {
                var attachmentElement = renderAttachmentType(attachment)

                if (attachmentElement) {
                    attachmentElement.setAttribute('attachmentid', attachmentid)
                    console.log('attachmentElement: ', attachmentElement);
                    msgElement.querySelector('.chat-message-attachments').appendChild(attachmentElement)
                }
            } else {
                console.log('attachment: ', attachment);
                var attachmentElement = document.createElement('div')
                attachmentElement.id = 'attachment_' + attachment.fileid
                attachmentElement.setAttribute('attachmentid', attachmentid)
                attachmentElement.innerHTML = 'Uploading ... '
                attachmentElement.classList.add('chat-Attachment');

                //attachmentElement.appendChild(newProgressbarElement)
                console.log('attachmentElement: ', attachmentElement);
                msgElement.querySelector('.chat-message-attachments').appendChild(attachmentElement)
            }

        }
    }

    if (lastMsgElement && lastMsgElement.getAttribute('fromIdentity') == msg.fromIdentity.id) {
        timeBetweenMsgsInSec = (msg.time - lastMsgElement.getAttribute('sendTime')) / 1000

        if (timeBetweenMsgsInSec < 120) {
            msgElement.querySelector('.chat-message-avatar').style.opacity = '0'
            msgElement.querySelector('.chat-message-info').style.display = 'none'

            lastMsgElement.style.marginBottom = '0px'
            lastMsgElement.style.paddingBottom = '0px'

            msgElement.style.marginTop = '0px'
            msgElement.style.paddingTop = '0px';
            msgElement.style.borderTop = "0px";

        }
    }

    return msgElement
}

/* function isValidURL(value) {
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(value);
} */

function handleRangeInputChange(e) {
    let target = e.target
    const val = target.value

    target.style.backgroundSize = `${val}%`
}

function getDarkerAndMoreSaturatedColor(hexColor) {
    // Konvertiere hex in HSL-Farbraum
    let hslColor = hexToHsl(hexColor);

    // Reduziere Helligkeit um 41%
    hslColor[2] = Math.max(0, hslColor[2] - 0.15);

    // Erhöhe Sättigung um 8%
    hslColor[1] = Math.min(1, hslColor[1] + 0.05);

    return `hsl(${hslColor[0]}, ${hslColor[1] * 100}%, ${hslColor[2] * 100}%)`;
}

// Hilfsfunktion zur Konvertierung von hex in HSL
function hexToHsl(hex) {
    // Entferne ggf. das "#" aus dem hex-String
    hex = hex.replace("#", "");

    // Konvertiere in RGB-Farbraum
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Finde Maximal- und Minimalwert von RGB
    let cmax = Math.max(r, g, b);
    let cmin = Math.min(r, g, b);
    let delta = cmax - cmin;

    // Berechne Helligkeit
    let lightness = (cmax + cmin) / 2;

    // Berechne Sättigung
    let saturation = 0;
    if (delta != 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }

    // Berechne Farbton
    let hue = 0;
    if (delta != 0) {
        if (cmax == r) {
            hue = ((g - b) / delta) % 6;
        } else if (cmax == g) {
            hue = (b - r) / delta + 2;
        } else {
            hue = (r - g) / delta + 4;
        }
    }
    hue = Math.round(hue * 60);

    // Rückgabe der HSL-Farbe als Array
    return [hue, saturation, lightness];
}

// center user elements/boxes
function cloneVideoElement(identity, socketid) {
    var clone = document.getElementById('videoElementTemplate').cloneNode(true).content.children[0];
    clone.id = 'videoElement_' + socketid



    if (!isMe(socketid)) {
        clone.querySelector('.namePlaceholder').innerText = identity.username;
        //clone.classList = "videoElement-hover-slide"
    } else {
        clone.querySelector('.namePlaceholder').innerText = meString;
        //clone.classList = "videoElement"
    }

    clone.querySelector('.avatar').src = identity.avatar
    clone.style.backgroundImage = getThumbnail(identity)
    //clone.querySelector('.videoElement').id = socketid + 'video';
    clone.onclick = function (e) {
        // only toggle when bottom bar is not clicked
        if (e.target.localName == "video" || e.target.localName == "img") {
            toggleStageMode(clone.id)
        }
    }

    clone.querySelector('.fullscreenBTN').onclick = function () {
        clone.querySelector('video').requestFullscreen();
    }

    clone.querySelector('.streamVolumeSlider').oninput = function () {
        clone.querySelector('video').volume = clone.querySelector('.streamVolumeSlider').value / 100;
    }

    clone.querySelector('.streamVolumeSlider').addEventListener('input', handleRangeInputChange)

    if (inStageMode) {
        document.querySelector('#stageWrapper').querySelector('#botStage').appendChild(clone);
    } else {
        document.getElementById('videowrapper').appendChild(clone);
    }

    clone.querySelector('.sliderWrapper').style.width = clone.querySelector('.namePlaceholder').getBoundingClientRect().width + "px"



    //clone.querySelector('.nameSlider').style.display = "block"

    return clone;
}


// left sidebar user list entries
function cloneUserElement(identity, socketid) {
    var clone = document.getElementById('connectedUserTemplate').cloneNode(true).content.children[0];

    clone.id = 'userElement_' + socketid

    clone.querySelector('.connected-user').querySelector('img').src = identity.avatar;
    //clone.querySelector('.button-watch').onclick = () => getStream(socketid)
    if (!isMe(socketid)) {
        //clone.querySelector('.button-watch').style.display = 'none';
        clone.onclick = () => getStream(socketid)
        clone.querySelector('.connected-user').querySelector('span').innerText = identity.username;
    } else {
        clone.querySelector('.connected-user').querySelector('span').innerText = meString;
    }

    document.getElementById('connected-users-list').appendChild(clone);
    if (identity.isStreaming) {
        clone.querySelector('.button-watch').style = "display:flex !important";
    } else {
        clone.querySelector('.button-watch').style = "display:none !important";
    }
    if (!isMe(socketid)) {
        clone.querySelector('.button-watch').innerText = 'Watch'
    } else {
        clone.querySelector('.button-watch').innerText = 'Stop'
    }
}

function isMe(socketid) {
    //console.log("isMe: " + socketid + " == " + socket.id);
    return socketid == socket.id;
}

function isMyIdentity(id) {
    return id == Object.keys(getCookieObject('ep_Identitys'))[0]
}

function moveElement(target, destination) {
    destination.appendChild(target);
}


// sortiert videoElemente/streams nach streamaktivität
function sortStreams() {
    var videoelemente = document.getElementsByClassName('videoElement');
    var videoelementeArray = Array.from(videoelemente);

    //console.log('videoelementeArray = ', videoelementeArray);
    videoelementeArray.sort(function (a, b) {
        var aStream = a.querySelector('video').srcObject;
        var bStream = b.querySelector('video').srcObject;
        var aVal = 0
        var bVal = 0
        aVal = aStream ? 1 : aVal
        bVal = bStream ? 1 : bVal
        return bVal - aVal;
    });

    for (var i = 0; i < videoelementeArray.length; i++) {
        var video = videoelementeArray[i]
        var vStreamObj = video.querySelector('video').srcObject
        if (vStreamObj || showVideoWithoutStream) {
            document.getElementById('videowrapper').appendChild(video);
            video.style.display = "flex"
        } else {
            video.style.display = "none"
        }
    }
}

function toggleStageMode(id) {
    var parent = document.getElementById(id).parentElement
    var stage = document.querySelector('#stageWrapper').querySelector('#stage');
    var botStage = document.querySelector('#stageWrapper').querySelector('#botStage');

    if (parent.id == 'videoWrapper' && inStageMode) {

    }

    //Wechsel zu Stage Mode
    if (!inStageMode && parent.id == 'videowrapper') {
        for (const key in videoElemente) {
            if (Object.hasOwnProperty.call(videoElemente, key)) {
                const element = videoElemente[key];
                if (element.id == id) {
                    moveElement(element, stage)
                } else {
                    moveElement(element, botStage)
                }
            }
        }
        inStageMode = true;
    }

    //Wenn im stage Mode und Drück auf das Video was gestaged ist, wird zum normalen modus gewechselt
    if (inStageMode && parent.id == 'stage') {
        for (const key in videoElemente) {
            if (Object.hasOwnProperty.call(videoElemente, key)) {
                const element = videoElemente[key];

                moveElement(element, document.getElementById('videowrapper'))

            }
        }
        inStageMode = false;
    }

    // Wenn im stage Mode und clickst auf ein video was in der bot bar ist. werden die videos getauscht 
    if (inStageMode && parent.id == 'botStage') {
        for (const key in videoElemente) {
            if (Object.hasOwnProperty.call(videoElemente, key)) {
                const element = videoElemente[key];
                console.log(element);

                if (element.id == id) {
                    moveElement(element, stage)
                } else {
                    moveElement(element, botStage)
                }
            }
        }
    }
    //inStageMode = !inStageMode;
}

function getFrame(blur) {
    var b = blur || 0
    var canvas = document.createElement('canvas');
    var videoElement = document.querySelector('#videoElement_' + socket.id).querySelector('video');
    canvas.width = videoElement.videoWidth / 4;
    canvas.height = videoElement.videoHeight / 4;
    var ctx = canvas.getContext('2d');
    ctx.filter = `blur(${b}px)`
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    var dataURL = canvas.toDataURL();
    canvas.remove();
    return dataURL
}

function renderDataInfo(connectionID) {
    var element = cloneTemplate('dataInfo')
    var wrapper = document.getElementById('peerStreamStats')
    element.id = connectionID + '_dataInfo';
    wrapper.appendChild(element)
    return element
}

function cloneTemplate(id) {
    return document.getElementById(id).cloneNode(true).content.children[0];
}


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
    gridLeftSize = '0.8fr'
    gridRightSize = '0.7fr'

    var isLeftOpen = sidebarL.offsetWidth > '0' ? true : false;
    var isRightOpen = sidebarR.offsetWidth > '0' ? true : false;


    if (side == "left") {
        if (!open) {

            setCssVar('grid_left', '0fr')
            document.getElementById('ls').style.width = "0";
            document.getElementById('ls').style.left = "-100%";

        } else {
            setCssVar('grid_left', gridLeftSize)
            document.getElementById('ls').style.width = "100%";
            document.getElementById('ls').style.left = "0px";


            /*     setCssVar('grid_right', '0fr')
                document.getElementById('rs').style.width = "0%";
                document.getElementById('rs').style.right = "-100%"; */
        }
    } else {
        if (!open) {
            setCssVar('grid_right', '0fr')
            document.getElementById('rs').style.width = "0";
            document.getElementById('rs').style.right = "-100%";
        } else {
            setCssVar('grid_right', gridRightSize)
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

// Helper Functions

function uuid() {
    function ff(s) {
        var pt = (Math.random().toString(16) + '000000000').substr(2, 8)
        return s ? '-' + pt.substr(0, 4) + '-' + pt.substr(4, 4) : pt
    }
    return ff() + ff(true) + ff(true) + ff()
}

// { id: this.id, username: this.username, avatar: this.avatar }
function addCookieObjectElement(params) {
    //console.log('addCookieObjectElement', params);
    var iCookie = getCookie('ep_Identitys')
    if (iCookie == '') {
        iCookie = JSON.stringify({})
    }

    var iCookieObj = JSON.parse(iCookie)
    iCookieObj[params.id] = params
    setCookie('ep_Identitys', JSON.stringify(iCookieObj), 365)
    return getCookieObject('ep_Identitys')
}

function removeCookieObjectElement(id) {
    var iCookie = getCookie('ep_Identitys')
    if (iCookie == '') {
        var iCookie = JSON.stringify({})
    }

    var iCookieObj = JSON.parse(iCookie)
    delete iCookieObj[id]
    setCookie('ep_Identitys', JSON.stringify(iCookieObj), 365)
    return getCookieObject(id)
}

function getIdentityByUsernameInCookie(username) {
    var coo = getCookieObject('ep_Identitys')
    for (var i in coo) {
        if (coo[i].username === username) {
            return coo[i]
        }
    }
    return null
}

function getIdentityByUsernameInIdentityObject(username) {
    for (var i in identitys) {
        if (identitys[i].username === username) {
            return identitys[i]
        }
    }
    return null
}

async function checkUsernameTaken(username) {
    var a = await getIdentityByUsernameInCookie(username)
    var b = await getIdentityByUsernameInIdentityObject(username)
    if (a === null && b === null) {
        return false
    } else {
        return true
    }
}

async function addIdentityToObjects(data) {
    var a = await getIdentityByUsernameInCookie(data.username)
    if (a === null) {
        addCookieObjectElement({
            id: data.id,
            username: data.username,
            avatar: data.avatar,
            color: data.color
        })
    }

    var b = await getIdentityByUsernameInIdentityObject(data.username)
    if (b === null) {
        identitys.push({
            id: data.id,
            username: data.username,
            avatar: data.avatar,
            color: data.color
        })
    }
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
    let expires = 'expires=' + d.toUTCString()
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}

function getCookie(cname) {
    let name = cname + '='
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ''
}

function getCookieObject(cname) {
    try {
        return JSON.parse(getCookie(cname))
    } catch (error) {
        return null
    }
}

function whatIsIt(object) {
    if (object === null) {
        return "null";
    }
    if (object === undefined) {
        return "undefined";
    }
    if (object.constructor === ''.constructor) {
        return "String";
    }
    if (object.constructor === [].constructor) {
        return "Array";
    }
    if (object.constructor === {}.constructor) {
        return "Object";
    } {
        return "don't know";
    }
}

async function chooseStream() {
    if (shareType == 'screen') {
        await startStreaming()
    } else if (shareType == 'camera') {
        await startCamStreaming()
    }
    pm.reconnectAllPeers()
}

function startStreaming() {
    return new Promise((resolve, reject) => {

        navigator.mediaDevices
            .getDisplayMedia({
                audio: {
                    autoGainControl: false,
                    channelCount: 2,
                    echoCancellation: false,
                    latency: 0,
                    noiseSuppression: false,
                    sampleRate: 48000,
                    sampleSize: 16,
                    volume: 1.0
                },
                video: {
                    chromeMediaSource: 'desktop',
                    surfaceSwitching: 'include',
                    width: localStreamOptions.resolution.width,
                    height: localStreamOptions.resolution.height,
                    frameRate: localStreamOptions.resolution.frameRate

                }
            })
            .then(async (stream) => {
                try {
                    let tracks = localStream.getTracks();
                    tracks.forEach(track => track.stop());
                } catch (error) {

                }

                if (getBrowser() != 'Safari') {

                    var mediaRecorder = new MediaRecorder(stream, localStreamOptions.mediaRecorderOptions);
                    mediaRecorder.start()
                    stream = mediaRecorder.stream;

                    mediaRecorder.onwarning = function (e) {
                        console.log("A warning has been raised: " + e.message);
                    }
                }
                localStream = stream;

                // console.log("localStream.getVideoTracks()[0].contentHint = ", localStream.getVideoTracks()[0].contentHint);

                //append fake audio track to unlock bitrate (idk, don't ask)
                if (localStream.getAudioTracks().length == 0) {
                    var AudioContext = window.AudioContext || window.webkitAudioContext;
                    var audioCtx = new AudioContext();
                    var dest = audioCtx.createMediaStreamDestination();
                    localStream.addTrack(dest.stream.getAudioTracks()[0]);
                }

                localStream.getVideoTracks()[0].contentHint = localStreamOptions.resolution.hint;
                //contentHint 

                console.log("socket ID not connected:", socket.id)
                if (!socket.id) {
                    new Toast({
                        type: "error",
                        content: "Keine Verbindung zum Server"
                    })
                    return
                }

                var videoWrapper = document.getElementById('videoElement_' + socket.id)
                var localVideo = videoWrapper.querySelector('video')
                var avatarImage = videoWrapper.querySelector(".avatar.myavatar")
                localVideo.srcObject = localStream;

                localVideo.onloadedmetadata = (e) => {
                    console.log('onloadedmetadata');
                    closeStartStreamModal()
                    localVideo.play()
                    localVideo.volume = 0
                    socket.emit('memberStartStreaming', room.id);
                    avatarImage.style = "display:none"
                    //modals.chooseStream.close()

                    localStream.getVideoTracks()[0].onended = function (e) {
                        // doWhatYouNeedToDo();
                        console.log('localStream.getVideoTracks()[0].onended', e);
                        stopStream();
                    };

                    //streamThumbnail = getFrame();
                    sendThumbnail()
                    streamThumbnailTimer = setInterval(() => {
                        sendThumbnail()
                    }, streamPreviewImageReloadTime)

                    resolve(localStream);
                };
            })
            .catch((err) => {

                console.log('nay', err);
                reject(err);
            });
    })
}



function startCamStreaming() {
    console.log("trying to start camera stream")
    return new Promise((resolve, reject) => {

        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            navigator.mediaDevices
                .getUserMedia({
                    video: {
                        min: 1280,
                        ideal: localStreamOptions.resolution.width,
                        max: 2560,
                    },
                    height: {
                        min: 720,
                        ideal: localStreamOptions.resolution.height,
                        max: 1440,
                    },
                    frameRate: {
                        min: 5,
                        ideal: localStreamOptions.resolution.frameRate,
                        max: 60,
                    }

                })
                .then(async (stream) => {
                    try {
                        let tracks = localStream.getTracks();
                        tracks.forEach(track => track.stop());
                    } catch (error) {

                    }
                    if (getBrowser() != 'Safari') {
                        var mediaRecorder = new MediaRecorder(stream, localStreamOptions.mediaRecorderOptions);
                        mediaRecorder.start();
                        stream = mediaRecorder.stream;

                        mediaRecorder.onwarning = function (e) {
                            console.log("A warning has been raised: " + e.message);
                        }
                    }
                    localStream = stream;

                    if (localStream.getAudioTracks().length == 0) {
                        var AudioContext = window.AudioContext || window.webkitAudioContext;
                        var audioCtx = new AudioContext();
                        var dest = audioCtx.createMediaStreamDestination();
                        localStream.addTrack(dest.stream.getAudioTracks()[0]);
                    }

                    localStream.getVideoTracks()[0].contentHint = localStreamOptions.resolution.hint;


                    var videoWrapper = document.getElementById('videoElement_' + socket.id)
                    var localVideo = videoWrapper.getElementsByTagName('video')[0]
                    var avatarImage = videoWrapper.querySelector(".avatar.myavatar")

                    localVideo.srcObject = localStream;


                    localVideo.onloadedmetadata = (e) => {
                        console.log('onloadedmetadata');
                        closeStartStreamModal()
                        localVideo.play()
                        localVideo.volume = 0
                        socket.emit('memberStartStreaming', room.id);
                        avatarImage.style = "display:none"
                        //modals.chooseStream.close()

                        localStream.getVideoTracks()[0].onended = function (e) {
                            console.log('localStream.getVideoTracks()[0].onended', e);
                            stopStream();
                        };

                        //streamThumbnail = getFrame();
                        sendThumbnail()
                        streamThumbnailTimer = setInterval(() => {
                            sendThumbnail()
                        }, streamPreviewImageReloadTime)

                        resolve(localStream);
                    };


                    /*           socket.emit('memberStartStreaming', room.id);
          
                              streamThumbnailTimer = setInterval(() => {
                                  streamThumbnail = getFrame(1);
                              }, 1000)
          
                              closeStartStreamModal()
                              resolve(localStream); */
                })
                .catch((err) => {
                    console.log('nay', err);
                    reject(err);
                });
        }
    })
}


/* quality code
low 1000
medium 3000
high 5000
very high 7000
ultra high 10000
unlimited 20000
*/
function getStream(remotesid) {
    socket.emit('getStream', {
        fromSocket: socket.id,
        toSocket: remotesid,
        quality: remoteStreamOptions.bitrate,
        browser: getBrowser()
    });
}

function stopStream() {
    try {
        let tracks = localStream.getTracks();
        tracks.forEach(track => track.stop());
        document.getElementById('videoElement_' + socket.id).getElementsByTagName('video')[0].srcObject = null;
        pm.closeAllInitializedPeers();
        localStream = null;
        streamThumbnailTimer.clear();
    } catch (error) {
        //console.log(error);
    }
    socket.emit('memberStopStreaming', room.id);
}

async function stopWatching(id) {
    console.log(await pm.getPeerBySocketID(id));
    var pe = await pm.getPeerBySocketID(id)
    pe.remove()
}

async function readFile(input, toSocketID) {

    let options = {
        initiator: true,
        remotesid: toSocketID
    }
    let peer = new Peer(options)
    var outdata = await peer.init(null);
    pm.addPeer(peer)

    var reciver = await pm.getPeerBySocketID(toSocketID)
    console.log('readFile', input, toSocketID, reciver);

    peer.peer.addEventListener('datachannel', (event) => {
        //this.dataChannel = event.channel
        console.log('readyState ', event.channel.readyState);
        if (event.channel.readyState) {
            let file = input.files[0];
            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            //fileReader.readAsDataURL(file);
            fileReader.onload = function () {
                // alert(fileReader.result);
                //console.log(fileReader.result);
                peer.send('fileReader.result');
                peer.send(arrayBufferToString(fileReader.result));
            };
            fileReader.onerror = function () {
                alert(fileReader.error);
            };
        }
    })
}

function log(msg, color) {
    color = color || "black";
    bgc = "White";
    switch (color) {
        case "success":
            color = "Green";
            bgc = "LimeGreen";
            break;
        case "info":
            color = "DodgerBlue";
            bgc = "Turquoise";
            break;
        case "error":
            color = "Red";
            bgc = "Black";
            break;
        case "start":
            color = "OliveDrab";
            bgc = "PaleGreen";
            break;
        case "warning":
            color = "Tomato";
            bgc = "Black";
            break;
        case "end":
            color = "Orchid";
            bgc = "MediumVioletRed";
            break;
        default:
            color = color;
    }

    if (typeof msg == "object") {
        console.log(msg);
    } else if (typeof color == "object") {
        console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
        console.log(color);
    } else {
        console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
    }
}


function getRoomList() {
    socket.emit('getRooms', (data) => {
        console.log(data);
    });
}

//returns is new Identity or an existing one
function initIdentity() {
    return new Promise((resolve, reject) => {
        var ido = getCookieObject('ep_Identitys')
        //console.log('ido ', ido);
        if (ido) {
            Object.keys(ido).forEach((id) => {
                //console.log('Identity = ', id, ido[id])
                //identitys.push(new Identity(ido[id].id, ido[id].username, ido[id].avatar))
                identitys.push(new Identity({
                    id: ido[id].id,
                    username: ido[id].username,
                    avatar: ido[id].avatar,
                    color: ido[id].color
                }))
            })
            resolve(false)
        } else {
            identitys.push(new Identity({}))
            resolve(true)
        }
    })
}

function getBrowser() {
    var ua = navigator["userAgent"]

    if (ua.indexOf("Chrome") > -1) {
        return "Chrome"
    } else if (ua.indexOf("Firefox") > -1) {
        return "Firefox"
    } else if (ua.indexOf("Safari") > -1) {
        return "Safari"
    } else if (ua.indexOf("Opera") > -1) {
        return "Opera"
    } else if (ua.indexOf("MSIE") > -1) {
        return "IE"
    } else {
        return "Unknown"
    }
}

function initSound() {
    soundsPlayer = new SoundsPlayer({
        incomming_Msg: {
            volume: 0.5,
            path: '/audio/msg_01.mp3'
        },
        newMember: {
            volume: 0.5,
            path: '/audio/memberJoin_01.mp3'
        },
    });
}

function reloadInterval() {
    loadRoomMemberThumbnails();
    testTimer = setInterval(loadRoomMemberThumbnails, streamPreviewImageReloadTime);
}

function getThumbnail(identity) {
    if (identity.thumbnail == "data:," || identity.thumbnail == null) {
        return `linear-gradient(180deg,${identity.color},${getDarkerAndMoreSaturatedColor(identity.color)})`;
    } else if (identity.thumbnail != null) {
        return `url(${identity.thumbnail})`
    }
}

function loadRoomMemberThumbnails() {
    socket.emit('getRoomMemberThumbnails', roomID, function (data) {
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const identity = data[key];
                var videoElement = document.getElementById('videoElement_' + identity.socket);
                videoElement.style.backgroundImage = getThumbnail(identity)
            }
        }
    });
}

function sendThumbnail() {
    streamThumbnail = getFrame(1);
    var sendToServer = {
        fromSocket: socket.id,
        room: roomID,
        data: streamThumbnail
    }
    //console.log('streamThumbnail', sendToServer);
    socket.emit('streamThumbnail', sendToServer);
}

var testTimer;


// 
//function initJoinRoom() {
//    socket.emit('joinRoom', roomID, identitys[0], '', handleJoinRoomCB)
//}


function createRoom() {
    var pw = document.getElementById('createRoomPassword').value
    var rid = document.getElementById('createRoomID').value
    var rn = rid//document.getElementById('roomname').value
    console.log('createRoom ID: ', rid);
    console.log('createRoom pw: ', pw);
    socket.emit('createRoom', rid, identitys[0], pw, rn, operatingMode, handleCreateRoomCB)
}

function joinRoom(roomID) {
    var pw = document.getElementById('joinRoomPassword').value
    var rid = document.getElementById('joinRoomID').value || roomID
    socket.emit('joinRoom', rid, identitys[0], pw, handleJoinRoomCB)
}

function addAdminUI() {
    console.log('addAdminUI');
    var modjs = document.createElement('script')
    modjs.src = '/js/admin.js';
    document.body.appendChild(modjs);
}

function handleCreateRoomCB(params) {
    switch (params.code) {
        case 0:
            joinRoom(params.room)
            //new Toast({
            //    type: "info",
            //    content: 'Raum wurde erstellt'
            //})
            break;
        case 1:
            new Toast({
                type: "info",
                content: 'Raum existiert bereits'
            })
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            console.log('joinRoom error', params);
            new Toast({
                type: "error",
                content: 'Es ist ein fehler aufgetreten'
            })
            break;
        default:
            break;
    }
}

function showUI() {
    document.querySelector('#grid-container').style.opacity = "1"
}

function handleJoinRoomCB(params) {
    var joinRoom = document.querySelector('#joinRoom')

    switch (params.code) {
        case 0:
            modals.joinRoom.close();
            modals.createRoom.close();
            showUI();
            if (params.isAdmin) {
                isAdmin = params.isAdmin;
                addAdminUI();
            }

            roomID = params.room
            if(operatingMode == "share") {
                history.pushState("", '', '/share/' + params.room)
            } else {
                history.pushState("", '', '/rooms/' + params.room)
            }
            break;
        case 1:
            console.log('joinRoom room not found', params);
            document.getElementById('createRoomID').value = roomID
            document.getElementById('joinRoomID').value = roomID
            modals.joinRoom.open()

            new Toast({
                type: "info",
                content: 'Raum wurde nicht gefunden, du kannst ihn erstellen'
            })
            break;
        case 2:
            console.log('joinRoom nothing');
            modals.joinRoom.open()
            break;
        case 3:
            console.log('joinRoom room blocked you ', params);
            new Toast({
                type: "info",
                content: 'Du kannst diesem Raum nicht beitreten'
            })
            break;
        case 4:
            console.log('joinRoom room password wrong', params);
            modals.joinRoom.open();
            document.getElementById('joinRoomID').value = roomID
            if (document.getElementById('joinRoomPassword').value != "") {
                new Toast({
                    type: "info",
                    content: 'Das Passwort ist falsch'
                })
            } else {
                joinRoom.querySelector('#joinRoomPassword').style.display = "block"
                new Toast({
                    type: "info",
                    content: 'Dieser Raum erfordert ein Passwort'
                })
            }
            break;
        case 5:
            console.log('joinRoom error', params);
            break;
        case 6:
            console.log('joinRoom capacity reached', params);
            document.getElementById('createRoomID').value = ""
            document.getElementById('joinRoomID').value = ""
            modals.joinRoom.open()

            new Toast({
                type: "info",
                content: 'Du kannst diesem Raum nicht beitreten'
            })
            break;
        default:
            break;
    }
}


function uploadFile(file) {
    return new Promise(async (resolve, reject) => {
        if (file) {
            const formData = new FormData();
            formData.append("user", identitys[0].id);
            formData.append("file", await file.getFile());
            formData.append("filename", file.name);

            var response = await fetch("/upload/file", {
                method: "POST",
                body: formData,
            })

            var result = await response.json();

            if (response.ok) {
                console.log(result);
                //filePicker.value = null;
            } else {
                console.log(result);
            }
            resolve(result)
        }
        reject();
    })
}


async function getFile() {

    const pickerOpts = {
        types: [
            {
                description: 'Images',
                accept: {
                    'image/*': ['.png', '.gif', '.jpeg', '.jpg']
                }
            },
        ],
        excludeAcceptAllOption: true,
        multiple: false
    };

    //[fileHandle] = await window.showOpenFilePicker(pickerOpts);
    var file = await window.showOpenFilePicker();
    return file
}


async function openFiles(event) {

    let files = Array.from(event.target.files)

    files.forEach(file => {
        //check file size
        if (file.size > 100 * 1024 * 1024) {
            new Toast({
                type: "error",
                content: "Maximale Dateigröße: 100MB"
            })
            event.target.value = ""
            return false
        }


        fileHandle[uuid()] = file
    });

    renderPickedAttachments()
}

function renderPickedAttachments() {
    console.log('renderPickedAttachments');
    chatAttachments.innerHTML = '';
    console.log(chatAttachments);

    for (const key in fileHandle) {
        if (Object.hasOwnProperty.call(fileHandle, key)) {
            const element = fileHandle[key];

            var div1 = document.createElement('div')
            div1.classList.add('attachmentLine');
            div1.innerText = element.name
            div1.id = key
            div1.onclick = function (params) {
                removePickedAttachments(key)
            }
            chatAttachments.appendChild(div1)
        }
    }
}

function removePickedAttachments(key) {
    delete fileHandle[key]
    renderPickedAttachments()
}


function previewAvatar() {

    var file = document.getElementById('avatarfileinput').files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        if (e.loaded > 10 * 1024 * 1024) {
            new Toast({
                type: "error",
                content: "Dateigröße darf 10MB nicht überschreiten"
            })
            file = undefined
            return
        }
        var image = document.getElementById("previewAvatar");
        image.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

async function uploadAvatar() {
    let fileField = document.getElementById('avatarfileinput');
    if (fileField.files[0]) {
        const formData = new FormData();
        formData.append("user", identitys[0].id);
        formData.append("avatar", fileField.files[0]);

        var response = await fetch("/upload/avatar", {
            method: "PUT",
            body: formData,
        })

        var result = await response.json();

        if (response.ok) {
            identitys[0].set({ avatar: "/uploads/avatars/" + identitys[0].id + ".png" });
            var evt = document.createEvent("Event");
            evt.initEvent("memberChanged", true, true);
            evt.detail = {}
            evt.detail.identity = identitys[0]
            evt.detail.sid = socket.id
            room.dispatchEvent(evt)
            fileField.value = null;
            return true
        } else {
            console.log(result);
            return false
        }
    }
    return true
}

function showPasswordInput(ctx) {
    ctx.srcElement.style.display = "none"
    ctx.srcElement.parentElement.querySelector('input[type="password"]').style.display = "block"
}

function resetStartStreamModal() {
    startStreamModal.style.height = `${startStreamStepOne.getBoundingClientRect().height}px`
    startStreamModal.scrollTo(0, 0)
    startStreamBG.style.display = "none";
}

// toggle start stream modal
function toggleStartStreamModal(ctx) {
    //hide element
    if (startStreamBG.style.display == "flex") {
        startStreamModal.classList = "startStreamStepsWrapper fadeOutBottom"
        setTimeout(() => {
            //startStreamModal.style.height = "190.667px"
            //startStreamModal.scrollTo(0, 0)
            //startStreamBTN.style.zIndex = "unset"
            startStreamModal.classList = "startStreamStepsWrapper"
            startStreamModal.style.transition = "height 0.2s ease 0s"
            resetStartStreamBTN()
            resetStartStreamModal()
        }, 340)


    } else {
        //show element
        //check for screen capture availability
        if (!(navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
            console.log("Sharing screen is not available")
            //startScreenShare.setAttribute("disabled", "true")
            //startScreenShare.onclick = ""
            startScreenShare.style.display = "none"
            new Toast({
                type: "error",
                content: "Bildschirmfreigabe ist nicht verfügbar"
            })
        }
        if (!(navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices)) {
            console.log("Sharing camera is not available")
            //startCameraShare.setAttribute("disabled", "true")
            //startCameraShare.onclick = ""
            startCameraShare.style.display = "none"
            //startStreamModal
            new Toast({
                type: "error",
                content: "Kamerafreigabe ist nicht verfügbar"
            })
        }
        startStreamBG.style.display = "flex"
        startStreamBG.style.opacity = "0"
        setTimeout(() => {
            startStreamModal.style.height = `${startStreamStepOne.getBoundingClientRect().height}px`
            startStreamModal.scrollTo(0, 0)
            startStreamModal.classList = "startStreamStepsWrapper fadeInBottom"
            startStreamModal.style.transition = "height 0.2s ease 0s"
            startStreamBG.style.opacity = "1"

            startStreamBTN.style.zIndex = "100"
            startStreamBTN.style.backgroundColor = "var(--red)"
            startStreamBTN.querySelector("span").style.fontSize = "20px"
            startStreamBTN.querySelector("span").style.fontWeight = "600"
            startStreamBTN.querySelector("img").style.display = "none"
            startStreamBTN.querySelector("span").innerHTML = "Abbrechen"
        }, 50)
    }
    return false
}

function toggleResDropdown() {
    if (document.getElementById('resolutionSelector').querySelector(".dropdown-content").style.display == "none") {
        document.getElementById('resolutionSelector').querySelector(".dropdown-content").style.display = "block"
        document.getElementById('resolutionSelector').style.borderRadius = "10px 10px 0 0"
        document.querySelector(".dropdown-content[name=resolutionSelector]").onclick = chooseResolution
    } else {
        document.getElementById('resolutionSelector').querySelector(".dropdown-content").style.display = "none"
        document.getElementById('resolutionSelector').style.borderRadius = "10px"
        document.querySelector(".dropdown-content[name=resolutionSelector]").onclick = null
    }
}

function chooseResolution(ctx) {
    var currentVal = document.querySelector(".dropdown-title[type=button]").dataset.value
    var targetVal = ctx.target.dataset.value
    document.querySelector(".dropdown-title[type=button]").dataset.value = targetVal
    localStreamOptions.resolution.height = Number(targetVal);
    document.querySelector(".dropdown-title[name=resolutionSelectorTitle]").innerHTML = localStreamOptions.resolution.height + "p"
    document.querySelector(`.dropdown-content[name=resolutionSelector]`).querySelector(`[data-value="${currentVal}"]`).style.display = "block"

    switch (targetVal) {
        case "720":
            localStreamOptions.resolution.width = 1280
            document.querySelector(`.dropdown-content[name=resolutionSelector]`).querySelector(`[data-value="${720}"]`).style.display = "none"
            break;

        case "1080":
            localStreamOptions.resolution.width = 1920
            document.querySelector(`.dropdown-content[name=resolutionSelector]`).querySelector(`[data-value="${1080}"]`).style.display = "none"
            break;

        case "1440":
            localStreamOptions.resolution.width = 2560
            document.querySelector(`.dropdown-content[name=resolutionSelector]`).querySelector(`[data-value="${1440}"]`).style.display = "none"
            break;

        case "2160":
            localStreamOptions.resolution.width = 3840
            document.querySelector(`.dropdown-content[name=resolutionSelector]`).querySelector(`[data-value="${2160}"]`).style.display = "none"
            break;

        default:
            break;
    }
}

function resetStartStreamBTN() {
    startStreamBTN.style.backgroundColor = ""
    startStreamBTN.style.height = ""
    startStreamBTN.querySelector("span").style.fontSize = ""
    startStreamBTN.querySelector("span").style.fontWeight = ""
    startStreamBTN.querySelector("img").style.display = ""
    startStreamBTN.querySelector("span").innerHTML = "Start Stream"
}

function closeStartStreamModal() {
    startStreamModal.style.height = "190.667px"
    startStreamModal.scrollTo(0, 0)
    startStreamBG.style.display = "none";
    resetStartStreamBTN()
}

function startStream(ctx) {
    if (ctx.target.className == "shareScreenWrapper" || ctx.target.parentNode.className == "shareScreenWrapper") {
        shareType = "screen"
    } else if (ctx.target.className == "shareCameraWrapper" || ctx.target.parentNode.className == "shareCameraWrapper") {
        shareType = "camera"
    }
    startStreamModal = document.getElementById('startStreamModal')
    startStreamModal.style.height = `${startStreamStepTwo.getBoundingClientRect().height}px`
    startStreamStepTwo.scrollIntoView({ behavior: "smooth" })

}

function goBack(ctx) {
    startStreamModal = document.getElementById('startStreamModal')
    startStreamModal.style.height = `${startStreamStepOne.getBoundingClientRect().height}px`
    startStreamStepOne.scrollIntoView({ behavior: "smooth" })
}

function framerateSliderSlide(ctx) {
    slider = document.getElementById('slider-fr')
    framerateDiv = document.getElementById('framerateDiv')

    slider.style.left = ctx.target.getBoundingClientRect().left - framerateDiv.getBoundingClientRect().left - 6 + 'px'
    localStreamOptions.resolution.frameRate = Number(ctx.target.dataset.value)
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
                // window.screen.availHeight = window.screen.availWidth oder nicht spezifizieren ?
            }
            break;

        default:
            break;
    }
}

function initModals() {
    var mods = Array.from(document.getElementsByTagName('modal'));
    //console.log(mods);

    for (var i = 0; i < mods.length; i++) {

        // init setIdent modal
        if (mods[i].id == "setIdent") {
            mods[i].querySelector('#username').value = identitys[0].username
            mods[i].querySelector('#avatar').value = identitys[0].avatar
            mods[i].querySelector('#previewAvatar').src = identitys[0].avatar
        }

        if (mods[i].id == "createRoom") {
            mods[i].querySelector('.subtitle').onclick = (e) => { showPasswordInput(e) }
        }

        var m = new Modal(mods[i]);
        modals[m.id] = m;
    }

    /*     document.querySelector("#setIdent").querySelector(".myavatar").src = identitys[0].avatar;
        document.getElementById('username').value = identitys[0].username;
        document.getElementById('avatar').value = identitys[0].avatar;
        if (identitys[0].username == 'Anonymous') {
            //  openProfileModal()
        } */
}

function initTabs() {
    var tabsElements = document.querySelectorAll('.tabsWrapper')

    for (var i = 0; i < tabsElements.length; i++) {
        var tabWapper = tabsElements[i];
        var tabsHeader = tabWapper.querySelectorAll('.tabsHeader');
        var tabsBodys = tabWapper.querySelectorAll('.tabBody');

        tabs[infoDataTabs.id] = new Tab(tabWapper)

        for (let y = 0; y < tabsBodys.length; y++) {
            const element = tabsBodys[y];
            tabs[infoDataTabs.id].bodys[element.id] = element
        }

        //console.log('tabs[', infoDataTabs.id, '] ', tabs[infoDataTabs.id]);
    }
}

function handleTabClick(elem, target) {
    // console.log('handleTabClick ', elem, target);
    // console.log('elem.parentElement.parentElement.id = ', elem.parentElement.parentElement.id);
    var tab = tabs[elem.parentElement.parentElement.id]
    // console.log('tab = ', tab);
    //tabs[elem.parentElement.parentElement.id].show(target)
    tab.show(target)
}

function openProfileModal(cb) {
    modals.setIdent.open()
    modals.setIdent.addEventListener("closed", function (e) {
        if (cb) {
            cb(e)
        }
    });
}

async function saveProfile() {

    // insert loading spinner
    if (await uploadAvatar()) {
        identitys[0].set({
            username: document.getElementById('username').value,
            avatar: document.getElementById('avatar').value
        });
        socket.emit('memberChangeIdentity', {
            username: identitys[0].username,
            avatar: identitys[0].avatar,
            room: room.id
        });
        modals.setIdent.close()
        if (identitys[0].username != 'Anonymous') {
            modals.setIdent.close()
        }
    } else {
        new Toast({
            type: "error",
            content: "Beim Hochladen des Avatars ist ein Fehler aufgetreten"
        })
    }
}

function hideMenu() {
    document.getElementById("contextMenu").style.display = "none"
}

function rightClick(e) {
    let menuMinWidth = 150

    if (document.getElementById("contextMenu").style.display == "block") {
        hideMenu();
    } else {
        var id
        var path = e.composedPath ? e.composedPath() : e.path;
        var msgid;


        for (let index = 0; index < path.length; index++) {
            const element = path[index];


            if (element.tagName == 'HTML') {
                break;
            }
            if (element.classList.contains('videoElement')) {
                id = element.id.substring(element.id.indexOf('_') + 1);
                break
            }
            if (element.classList.contains('connected-user-wrapper')) {
                id = element.id.substring(element.id.indexOf('_') + 1);
                break
            }
            if (element.classList.contains('chat-message-wrapper')) {
                console.log('fromIdentity:', element.getAttribute("fromIdentity"));

                id = element.id.substring(element.id.indexOf('_') + 1);
                //id = element.getAttribute("fromIdentity").substring(element.getAttribute("fromIdentity").indexOf('_') + 1);
                console.log(element);
                msgid = element.id
                if (room.isIIDInRoom(id)) {
                    id = room.getUserByIID(id).sid
                } else {
                    id = null;
                }
                break
            }
        }

        var menu = document.getElementById("contextMenu")
        var elementWrapper = menu.querySelector('ul');
        elementWrapper.innerHTML = ""

        if (id) {

            e.preventDefault();
            var videoElement = document.getElementById('videoElement_' + id)
            var video = videoElement.querySelector('video');


            if (isMe(room.members[id].sid)) {
                elementWrapper.innerHTML += renderConMenuItem(id, 'Edit Profile', 'edit_profile')
            } else {

                if (isAdmin) {
                    elementWrapper.innerHTML += renderConMenuItem(id, 'Kick', 'kick_member')
                    elementWrapper.innerHTML += renderConMenuItem(id, 'Ban', 'ban_member')
                    if (room.members[id].identity.isAdmin) {
                        elementWrapper.innerHTML += renderConMenuItem(id, 'Remove Admin', 'remove_admin')
                    } else {
                        elementWrapper.innerHTML += renderConMenuItem(id, 'Make Admin', 'make_admin')
                    }
                }

                if (video.muted) {
                    elementWrapper.innerHTML += renderConMenuItem(id, 'Unmute', 'toggle_mute_video')
                } else {
                    elementWrapper.innerHTML += renderConMenuItem(id, 'Mute', 'toggle_mute_video')
                }

                if (room.members[id].identity.isStreaming) {
                    if (!video.srcObject) {
                        elementWrapper.innerHTML += renderConMenuItem(id, 'Watch', 'watch_video')
                    } else {
                        elementWrapper.innerHTML += renderConMenuItem(id, 'Stop', 'stop_video')
                    }
                }

                elementWrapper.innerHTML += renderConMenuItem(id, 'Open Profile', 'user_profile')
            }
        }

        if (msgid) {
            e.preventDefault();
            // console.log('event:', e);
            // console.log('msgid:', msgid);
            //console.log('msgid:', msgid.substring(msgid.indexOf('_') + 1));
            //console.log('fromidentity:', document.querySelector('#' + msgid).getAttribute('fromidentity'));

            //elementWrapper.innerHTML += renderConMenuItem(msgid, 'React', 'make_react')
            elementWrapper.innerHTML += renderConMenuItem(msgid, 'Open', 'open_Chat_Content')
            if (isMyIdentity(document.querySelector('#' + msgid).getAttribute('fromidentity'))) {
                elementWrapper.innerHTML += renderConMenuItem(msgid, 'Edit', 'edit_Chat_Content')
            }
        }

        if (elementWrapper.hasChildNodes()) {
            menu.style.display = 'block';
            menu.style.top = e.pageY + "px";
            console.log("e.pageX + menuMinWidth ", e.pageX + menuMinWidth);
            console.log("window.innerWidth ", window.innerWidth);
            if(e.pageX + menuMinWidth + 10 > window.innerWidth) {
                menu.style.left = e.pageX - menuMinWidth - 10 + "px";
            } else {
                menu.style.left = e.pageX + "px";
            }
        }
    }
}


handleConMenuItemClick = async function (id, type) {
    console.log('handleConMenuItemClick', id, type);
    switch (type) {
        case 'toggle_mute_video':
            console.log('mute_video = ', id);
            console.log(document.getElementById('videoElement_' + id));
            var elem = document.getElementById('videoElement_' + id).querySelector('video')
            elem.muted = !elem.muted
            console.log(elem.muted);
            break;
        case 'watch_video':
            console.log('watch_video = ', id);
            getStream(id)
            break;
        case 'stop_video':
            stopWatching(id)
            console.log('stop_video = ', id);

            break;
        case 'kick_member':
            console.log('kick_member = ', id);
            socket.emit('kickMember', id, roomID)
            //"kickMember", (id, roomID)
            break;
        case 'ban_member':
            console.log('ban_member = ', id);
            socket.emit('banMember', id, roomID)
            //"kickMember", (id, roomID)
            break;
        case 'user_profile':
            console.log('user_profile = ', room.members[id]);
            console.log('room.members[id].identity.username; = ', room.members[id].identity.username);
            document.getElementById('profile_username').innerText = room.members[id].identity.username;
            document.getElementById('profile_avatar').src = room.members[id].identity.avatar;
            modals.userIdent.open()
            //socket.emit('kickMember', id, roomID)
            //"kickMember", (id, roomID)
            break;
        case 'edit_profile':
            console.log('edit_profile = ', room.members[id]);
            openProfileModal()
            break;
        case 'remove_admin':
            console.log('remove_admin = ', room.members[id]);
            socket.emit('removeAdmin', id, roomID)
            break;
        case 'make_admin':
            console.log('make_admin = ', room.members[id]);
            socket.emit('makeAdmin', id, roomID)
            break;
        case 'make_react':
            console.log('make_react = ', id);
            //socket.emit('makeAdmin', id, roomID)
            break;
        case 'open_Chat_Content':
            chatContentModal.querySelector('.modal-body-msg-content').innerHTML = '';
            var msg_element = document.querySelector('#' + id).cloneNode(true)
            var closeBTNwrapper = document.createElement('div');
            var closeBTN = document.createElement('button');

            closeBTNwrapper.classList.add('button-wrapper')
            closeBTN.style.position = "absolute"
            closeBTN.style.top = "0"
            closeBTN.style.right = "0"
            closeBTN.type = "button"
            closeBTN.classList.add('btn-secondary')
            closeBTN.classList.add('btn-close')
            closeBTN.innerHTML = '<img src="/svg/x-dismiss.svg" alt="close">'
            closeBTN.onclick = function () {
                modals.chatContentModal.close()
            }

            closeBTNwrapper.appendChild(closeBTN)
            msg_element.querySelector('.chat-message-info').appendChild(closeBTNwrapper)
            chatContentModal.querySelector('.modal-body-msg-content').appendChild(msg_element)
            modals.chatContentModal.open()
            break;
        case 'edit_Chat_Content':
            handleChatMsgEdit(id)
            break;
        default:
            break;
    }
}

function handelTextAreaInput(e) {

    if (e.srcElement.value.match(/\n\r?/g) != null) {
        rows = e.srcElement.value.match(/\n\r?/g).length + 1
    } else {
        rows = 1
    }

    e.srcElement.rows = rows

    if (e.keyCode == 13 && !e.shiftKey) {
        //sendMessage();
        var res
        var attachments = {};
        var msgid = uuid()

        for (const key in fileHandle) {
            if (Object.hasOwnProperty.call(fileHandle, key)) {
                const element = fileHandle[key];
                //console.log('fileHandle elemnt: ', element);
                element.msgid = msgid
                element.roomid = room.id

                //res = await uploadFile(element)
                var fileid = FU.addFileToQueue(element)
                attachments[fileid] = { fileid: fileid }
                //attachments.push({ fileid: res.url, fileExt: res.fileExt })
            }
        }

        var msg = e.srcElement.value

        if (msg.trim() != '' || Object.keys(fileHandle).length > 0) {
            e.preventDefault();
            msg = msg.trimStart().trim()
            msg = msg.replace(/\n\r?/g, ' <br />')

            //room.sendMsg(msg, attachments, msgid);
            chatAttachments.innerHTML = ''
            fileHandle = {}
        }
        document.getElementById('chatInput').reset();
        e.srcElement.rows = 1

    } else if (e.keyCode == 13) {
        //e.srcElement.rows++
        chatBody.scrollBy(0, 20)
    }
}

function renderConMenuItem(id, txt, type) {
    return `<li onclick="handleConMenuItemClick('${id}', '${type}')"><a href="#" >${txt}</a></li>`
}


function handleChatMsgEdit(id) {
    var msg_element = document.querySelector('#' + id)

    var msg = room.msgs[id.split('_')[1]]
    var coppiedMsg = JSON.parse(JSON.stringify(msg))
    var textareaElement = document.createElement('textarea')
    //textareaElement.type = 'textarea'
    textareaElement.value = msg.msg.replaceAll('<br />', '\n')
    textareaElement.setAttribute('multiline', '')
    textareaElement.setAttribute('autocomplete', 'off')
    textareaElement.setAttribute('rows', msg.msg.split('<br />').length)
    textareaElement.onkeyup = handelTextAreaInput

    console.log('msg: ', msg);
    console.log('edit_Chat_Content: ', msg_element);



    var textareaSaveButtonElement = document.createElement('button')
    textareaSaveButtonElement.innerHTML = 'Save'
    textareaSaveButtonElement.onclick = (e) => {
        console.log(e);
        console.log('Save Msg');
        coppiedMsg.msg = textareaElement.value

        msg_element.querySelector('.chat-message-content').style.display = 'block'
        msg_element.querySelector('.chat-message-container').removeChild(textareaElement)
        msg_element.querySelector('.chat-message-container').removeChild(textareaSaveButtonElement)
        msg_element.querySelector('.chat-message-container').removeChild(textareaCancelButtonElement)

        msg = coppiedMsg

        for (const attachmentid in msg.attachments) {
            if (Object.hasOwnProperty.call(msg.attachments, attachmentid)) {
                const attachment = msg.attachments[attachmentid];
                console.log(attachment);
                console.log(document.querySelector(`[attachmentid="${attachmentid}"]`));
                document.querySelector(`[attachmentid="${attachmentid}"]`).style.display = 'block';
                
            }
        }
        removeAllListItem() 
        room.updateMsg(msg)
    }



    var textareaCancelButtonElement = document.createElement('button')
    textareaCancelButtonElement.innerHTML = 'X'
    textareaCancelButtonElement.onclick = (e) => {
        console.log(e);
        msg_element.querySelector('.chat-message-content').style.display = 'block'
        msg_element.querySelector('.chat-message-container').removeChild(textareaElement)
        msg_element.querySelector('.chat-message-container').removeChild(textareaSaveButtonElement)
        msg_element.querySelector('.chat-message-container').removeChild(textareaCancelButtonElement)

        for (const attachmentid in msg.attachments) {
            if (Object.hasOwnProperty.call(msg.attachments, attachmentid)) {
                const attachment = msg.attachments[attachmentid];
                console.log(document.querySelector(`[attachmentid="${attachmentid}"]`));
                console.log(attachment);
                document.querySelector(`[attachmentid="${attachmentid}"]`).style.display = 'block';
            }
        }
        removeAllListItem() 
    }



    //textareaElement.appendChild(textareaButtonElement)
    msg_element.querySelector('.chat-message-content').style.display = 'none'
    msg_element.querySelector('.chat-message-container').appendChild(textareaElement)
    msg_element.querySelector('.chat-message-container').appendChild(textareaSaveButtonElement)
    msg_element.querySelector('.chat-message-container').appendChild(textareaCancelButtonElement)


    for (const attachmentid in msg.attachments) {
        if (Object.hasOwnProperty.call(msg.attachments, attachmentid)) {
            const attachment = msg.attachments[attachmentid];
            var attachmentElement = document.querySelector(`[attachmentid="${attachmentid}"]`)
            attachmentElement.style.display = 'none';


            console.log(document.querySelector(`[attachmentid="${attachmentid}"]`));
            console.log(attachment);
            console.log(msg);

            var attachmentWrapperElement = document.createElement('div')
            attachmentWrapperElement.innerHTML = attachment.url;
            attachmentWrapperElement.setAttribute('removeListItem','')
            var attachmentRemoveBtnElement = document.createElement('button')
            attachmentRemoveBtnElement.innerHTML = 'Remove'
            attachmentRemoveBtnElement.onclick = (e) => {
                console.log(e)
                console.log('Remove attachment with id: ', attachmentid)
                delete coppiedMsg.attachments[attachmentid]
                //msg_element.querySelector('.chat-message-attachments').removeChild(attachmentElement)
                msg_element.querySelector('.chat-message-attachments').removeChild(attachmentWrapperElement)

                console.log(coppiedMsg.attachments);
            }

            attachmentWrapperElement.appendChild(attachmentRemoveBtnElement)
            msg_element.querySelector('.chat-message-attachments').appendChild(attachmentWrapperElement)
        }
    }

    function removeAllListItem() {
       var listItems = document.querySelectorAll('[removeListItem]')
        for (const key in listItems) {
            if (Object.hasOwnProperty.call(listItems, key)) {
                msg_element.querySelector('.chat-message-attachments').removeChild(listItems[key])
            }
        }
    }
}


function XHRupload(files) {

    var file = document.getElementById('file').files[0]


    var formData = new FormData()

    formData.append('file', file)
    formData.append('enctype', 'multipart/form-data')

    var xhr = new XMLHttpRequest()
    xhr.open('post', '/upload', true)

    ProgressDInterval = setInterval(() => {
        ProgressD.innerHTML = ProgressDValue
    }, 1000)

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            // calc progress per second, then update lastprogressval
            loadSpeed = (e.loaded - lastProgressVal) / (Date.now() - lastTimestamp)
            lastProgressVal = e.loaded
            lastTimestamp = Date.now()
            //console.log(processLoadingSpeed(loadSpeed))
            ArrowUp.classList.add('uploadAnimation')
            var percentage = (e.loaded / e.total) * 100
            percentage = Math.round(percentage)
            //console.log(percentage)
            ProgressForeground.style.width = percentage + '%'
            timeRemaining = Math.round((e.total - e.loaded) / loadSpeed / 1000)
            //console.log(loadSpeed)
            if (loadSpeed > 1) {
                ProgressD.style.visibility = "visible"
                if (timeRemaining > 3600) {
                    Math.round(timeRemaining / 3600) != 1 ? ProgressDValue = `${processLoadingSpeed(loadSpeed)} - ${Math.round(timeRemaining / 3600)} Stunden verbleibend` : ProgressDValue = `${processLoadingSpeed(loadSpeed)} - ${Math.round(timeRemaining / 3600)} Stunde verbleibend`
                } else if (timeRemaining > 60) {
                    Math.round(timeRemaining / 60) != 1 ? ProgressDValue = `${processLoadingSpeed(loadSpeed)} - ${Math.round(timeRemaining / 60)} Minuten verbleibend` : ProgressDValue = `${processLoadingSpeed(loadSpeed)} - ${Math.round(timeRemaining / 60)} Minute verbleibend`
                } else {
                    timeRemaining != 1 ? ProgressDValue = `${processLoadingSpeed(loadSpeed)} - ${timeRemaining} Sekunden verbleibend` : ProgressDValue = `${processLoadingSpeed(loadSpeed)} - ${timeRemaining} Sekunde verbleibend`
                }
            }
        }
    }

    xhr.onerror = function (e) {
        ProgressBackground.style.background = "#F92C47"
        ProgressForeground.style.background = "#F92C47"
        ProgressD.style.visibility = "visible"
        clearInterval(ProgressDInterval)
        ProgressD.innerHTML = "Ein Fehler ist aufgetreten"
        setTimeout(() => {
            resetUI()
        }, 5000)
    }

    xhr.onload = function () {
        console.log(this.status)
        if (this.status == 500) {
            ProgressBackground.style.background = "#F92C47"
            ProgressForeground.style.background = "#F92C47"
            ProgressD.style.visibility = "visible"
            clearInterval(ProgressDInterval)
            ProgressD.innerHTML = "Ein Fehler ist aufgetreten"
            setTimeout(() => {
                resetUI()
            }, 5000)
        } else if (this.statusText == 'OK') {
            clearInterval(ProgressDInterval)
            ProgressD.innerHTML = "Upload abgeschlossen"
            var lastProgressVal = 0
            var lastTimestamp = 0
            ArrowUp.classList.remove('uploadAnimation')
            setTimeout(() => {
                ProgressWrapper.style.opacity = "1"
                ProgressWrapper.classList.remove('fadeInProgress')
                ProgressWrapper.classList.add('fadeOutProgress')
            }, 2000)
            setTimeout(() => {
                Button.innerHTML = "weitere Datei hochladen"
                Button.classList.add('fadeInButton')
            }, 6000)
            setTimeout(() => {
                Button.style.opacity = "1"
                Button.style.visibility = "visible"
                Button.classList.remove('fadeInButton')
            }, 7000)
        }
    }

    xhr.send(formData)
}

function submitOnEnter(e) {
    if(e.key != "Enter") {
        return
    } else {
        console.log(e.srcElement);
        switch (e.srcElement.id) {
            case "username":
                saveProfile()
                break;
             
            case "joinRoomID":
            case "joinRoomPassword":
                joinRoom()
                break;

            case "createRoomID":
            case "createRoomPassword":
                createRoom()
                break;
        
            default:
                break;
        }
    }
}