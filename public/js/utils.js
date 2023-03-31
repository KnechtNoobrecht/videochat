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
    console.log("renderMsgTemplate:", msg);
    var chatBody = document.querySelector('.chat-body');
    var msgElement = document.getElementById('chatMsgTemplate').cloneNode(true).content.children[0];
    msgElement.setAttribute("fromIdentity", 'msg_' + msg.fromIdentity.id);
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

    msg.attachments.forEach(attachment => {

        //attachment.fileExt

        console.log('attachment: ', attachment.fileExt.toUpperCase());

        var attachmentElement = null

        switch (attachment.fileExt.toUpperCase()) {
            case '.PNG':
            case '.JPG':
            case '.WEBP':
                attachmentElement = document.createElement('img')
                break;

            case '.MP4':
                attachmentElement = document.createElement('video')
                attachmentElement.controls = true;
                break;

            default:
                break;
        }
        attachmentElement.classList.add('chat-Attachment');
        attachmentElement.src = window.location.origin + '/' + attachment.url;

        if (attachmentElement) {
            msgElement.querySelector('.chat-message-content').querySelector('span').appendChild(attachmentElement)
        }

    });

    if (msg.attachments) {

    }


    chatBody.appendChild(msgElement);
    chatBody.scrollTop = chatBody.scrollHeight;
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

    //Wechsele zu Stage Mode
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
        //console.log('startStreaming', localStreamOptions);

        if(getBrowser() != "Safari") {
            var mediaConstraints = {
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
            }
        } else {
            console.log("Current Browser is Safari, using different media constraints")
            var mediaConstraints = {
                //audio: true,
                video: true
            }
        }

        console.log(navigator)

        navigator.mediaDevices
            .getDisplayMedia(mediaConstraints)
            .then(async (stream) => {
                //stopStream()
                try {
                    let tracks = localStream.getTracks();
                    tracks.forEach(track => track.stop());
                } catch (error) {

                }

                //console.log('streaming started', stream);
                //console.log('streaming started', getBrowser());
                if (getBrowser() != 'Safari') {

                    var mediaRecorder = new MediaRecorder(stream, localStreamOptions.mediaRecorderOptions);
                    mediaRecorder.start();
                    // console.log('mediaRecorder.videoBitsPerSecond : ', mediaRecorder.videoBitsPerSecond);
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

function handleIncommingChatMSG(data) {
    console.log('handleIncommingChatMSG', data);
    // renderNewChatMsg(data)

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
    if (identity.thumbnail == "data:," || identity.thumbnail == null){
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
    //console.log('streamThumbnail', streamThumbnail);
    var sendToServer = {
        fromSocket: socket.id,
        room: roomID,
        data: streamThumbnail
    }
    socket.emit('streamThumbnail', sendToServer);
}

var testTimer;

function initJoinRoom() {
    socket.emit('joinRoom', roomID, identitys[0], '', handleJoinRoomCB)
}


function createRoom() {
    var pw = document.getElementById('password').value
    var rid = document.getElementById('createRoomID').value
    var rn = rid//document.getElementById('roomname').value
    console.log('createRoom', rid);
    console.log('createRoom pw = ', pw);
    socket.emit('createRoom', rid, identitys[0], pw, rn, handleCreateRoomCB)
}

function joinRoom() {
    var pw = document.getElementById('joinRoomPassword').value
    var rid = document.getElementById('joinRoomID').value
    socket.emit('joinRoom', rid, identitys[0], pw, handleJoinRoomCB)
}

function addAdminUI() {
    console.log('addAdminUI');
    var modjs = document.createElement('script')
    modjs.src = '/js/mod.js';
    document.body.appendChild(modjs);
}

function handleCreateRoomCB(params) {
    switch (params.code) {
        case 0:
            console.log('Raum erstellt ', params);
            joinRoom()
            new Toast({
                content: 'Raum wurde erstellt'
            })
            break;
        case 1:
            console.log('Raum existiert bereits', params);
            //new Toast({ms:2000, content: 'Raum existiert bereits', header: '', footer: ''})
            new Toast({
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
                content: 'Es ist ein fehler aufgetreten'
            })
            break;
        default:
            break;
    }
}

function handleJoinRoomCB(params) {

    switch (params.code) {
        case 0:
            console.log('joinRoom beigetreten', params);
            modals.joinRoom.close();
            modals.createRoom.close();
            if (params.isAdmin) {
                isAdmin = params.isAdmin;
                addAdminUI();
            }

            history.pushState("", '', '/rooms/' + params.room)

            //new Toast({
            //    content: 'Raum beigetreten'
            //})
            break;
        case 1:
            console.log('joinRoom room not found', params);
            document.getElementById('createRoomID').value = roomID
            document.getElementById('joinRoomID').value = roomID
            //modals.createRoom.open();

            // for dev purposes: remove!!!
            modals.joinRoom.open();

            new Toast({
                content: 'Raum wurde nicht gefunden, du kannst ihn erstellen'
            })
            break;
        case 2:
            console.log('joinRoom nothing');

            break;
        case 3:
            console.log('joinRoom room blocked you ', params);
            new Toast({
                content: 'Du kannst diesem Raum nicht beiteten'
            })
            break;
        case 4:
            console.log('joinRoom room password wrong', params);
            modals.joinRoom.open();
            document.getElementById('joinRoomID').value = roomID
            new Toast({
                content: 'Das Passwort ist falsch'
            })
            break;
        case 5:
            console.log('joinRoom error', params);
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

async function openFiles() {

    const pickerOpts = {
        excludeAcceptAllOption: false,
        multiple: true
    };
    var file = await window.showOpenFilePicker(pickerOpts)

    file.forEach(element => {

        fileHandle[uuid()] = element
        //fileHandle.push(element);
    });

    renderPickedAttachments()
}

var i = 0
function renderPickedAttachments() {
    console.log('renderPickedAttachments');
    chatAttachments.innerHTML = '';

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
            chatAttchaments.appendChild(div1)
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
        } else {
            console.log(result);
        }
    }
}