function initEvents() {
    document.getElementById('fileUploadInput').oninput = (e) => openFiles(e)

    room.addEventListener("memberAdded", function (e) {
        videoElemente[e.detail.sid] = cloneVideoElement(e.detail.identity, e.detail.sid)
        console.log(e.detail.identity);
        cloneUserElement(e.detail.identity, e.detail.sid)
        if (operatingMode == "video") {
            soundsPlayer.play('newMember')
        }
    });

    room.addEventListener("memberRemoved", function (e) {
        var identity = e.detail.identity;
        var socketid = e.detail.sid;
        //console.log("removeMember event ", identity, socketid);

        document.getElementById('videoElement_' + socketid).remove();
        document.getElementById('userElement_' + socketid).remove();
        delete videoElemente[socketid];
    });

    room.addEventListener("memberChanged", function (e) {
        var identity = e.detail.identity;
        var socketid = e.detail.sid;

        //console.log(e.detail.identity, e.detail.sid);
        console.log("memberChanged ", identity, socketid);
        //var videowrapper = document.getElementById('videowrapper');

        var userElement = document.getElementById('userElement_' + socketid);
        var videoElement = document.getElementById('videoElement_' + socketid);


        videoElement.querySelector('.avatar').src = identity.avatar
        // videoElement.querySelector('.thumbnail').src = identity.thumbnail;

        videoElement.style.backgroundImage = getThumbnail(identity)

        if (!isMe(socketid)) {
            videoElement.querySelector('.namePlaceholder').innerText = identity.username;
            //userElement.getElementsByTagName('span')[0].innerHTML = 'Me';
            userElement.getElementsByTagName('span')[0].innerHTML = identity.username;
        } else {
            isAdmin = e.detail.identity.isAdmin;
        }

        userElement.querySelector(".myavatar").src = identity.avatar + '?r=' + Math.floor(Math.random() * 999999999);
        videoElement.querySelector(".myavatar").src = identity.avatar + '?r=' + Math.floor(Math.random() * 999999999);


        userElement.querySelectorAll(".myavatar").forEach(element => {
            element.src = identity.avatar + '?r=' + Math.floor(Math.random() * 999999999);
            element.style.border = `2px solid rgb(${identity.avatarRingColor.r},${identity.avatarRingColor.g},${identity.avatarRingColor.b})`
        });

        videoElement.querySelectorAll(".myavatar").forEach(element => {
            element.src = identity.avatar + '?r=' + Math.floor(Math.random() * 999999999);
            element.style.border = `2px solid rgb(${identity.avatarRingColor.r},${identity.avatarRingColor.g},${identity.avatarRingColor.b})`

        });

        var userMsgs = Array.from(document.getElementsByName('msg_' + identity.id));
        for (var i = 0; i < userMsgs.length; i++) {
            userMsgs[i].querySelector('.chat-message-username').innerText = identity.username;
            userMsgs[i].querySelector('img').src = identity.avatar + '?r=' + Math.floor(Math.random() * 999999999);
            userMsgs[i].querySelector('img').style.border = `2px solid rgb(${identity.avatarRingColor.r},${identity.avatarRingColor.g},${identity.avatarRingColor.b})`
        }

        //console.log(videoElement.querySelector('video'));
        //TODO Icons anstatt Wörter im BTN Anzeigen

        if (identity.isStreaming) {
            //userElement.getElementsByClassName('button-watch')[0].style.display = "flex";
            userElement.querySelector('avatarstatusindicator').style.display = "flex";


            if (!isMe(socketid)) {
                videoElement.querySelector('.watchBtnOnVideoElement').style.display = "flex";
                videoElement.querySelector('.watchBtnOnVideoElement').onclick = (event) => {
                    console.log(event);
                    getStream(socketid)
                }
            } else {
                videoElement.querySelector('.watchBtnOnVideoElement').style.display = "none";
            }

            videoElement.querySelector('.watchBtnOnVideoElement').style.display = "flex";
            //isMe(socketid) ? userElement.getElementsByClassName('button-watch')[0].innerHTML = "Stop" : userElement.getElementsByClassName('button-watch')[0].innerHTML = "Watch"
        } else {
            userElement.querySelector('avatarstatusindicator').style.display = "none";
            userElement.getElementsByClassName('button-watch')[0].style.display = "none";
            videoElement.querySelector('video').srcObject = null
            videoElement.querySelector('.watchBtnOnVideoElement').style.display = "none";
        }


        // setCssVar('avatar-ring-color', `rgb(${identity.avatarRingColor.r},${identity.avatarRingColor.g},${identity.avatarRingColor.b})`)
        /*   var r = document.querySelector(':root');
          r.style.setProperty('--avatar-ring-color', `rgb(${identity.avatarRingColor.r},${identity.avatarRingColor.g},${identity.avatarRingColor.b})`); */

    });

    document.getElementById('inputMsg').addEventListener('paste', async function (e) {
        console.log(e);

    });

    document.getElementById('inputMsg').addEventListener('keyup', async function (e) {
        //console.log("keydown", e);
        //console.log(e.srcElement.value.match(/\n\r?/g));

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

                room.sendMsg(msg, attachments, msgid);
                chatAttachments.innerHTML = ''
                fileHandle = {}
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
        //console.log('touch move event = ', eve);
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


    var width_size_before = 0;
    var ro = new ResizeObserver(entries => {
        var isLeftOpen = sidebarL.offsetWidth > '0' ? true : false;
        var isRightOpen = sidebarR.offsetWidth > '0' ? true : false;
        for (let entry of entries) {
            const cr = entry.contentRect;
            //console.log('Element:', entry.target);
            //console.log(`Element size: ${cr.width}px x ${cr.height}px`);
            //console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);


            if (width_size_before != cr.width) {
                if (cr.width <= 900) {
                    rezizeToMobile.exec();
                    rezizeToDesktop.reset();
                } else if (cr.width > 900) {
                    rezizeToDesktop.exec()
                    rezizeToMobile.reset();
                }
            }
            width_size_before = cr.width;
        }

        //var videoelemente = document.querySelector('.videoElement')
        var videoelemente = document.getElementsByClassName('videoElement');
        // console.log('videoelemente = ', videoelemente);

        /*  for (var i = 0; i < videoelemente.length; i++) {
             var video = videoelemente[i]
             var targetHeight = video.offsetWidth * 0.5625
             //     console.log('targetHeight = ', targetHeight);
             //console.log('video = ', video);

             //video.offsetWidth
             if (targetHeight > 100) {
                 //    video.style.height = targetHeight + 'px'
             }
         } */

        //sizebefore = cr.width;
    });

    // Observe one or multiple elements
    ro.observe(document.body);

    rezizeToMobile = new Once(() => {
        setSideBar('left', false)
        setSideBar('right', false)
    });
    rezizeToDesktop = new Once(() => {
        setSideBar('left', true)
        setSideBar('right', true)
    });


    var sel = document.querySelectorAll('select')

    for (var i = 0; i < sel.length; i++) {
        sel[i].addEventListener('change', function (e) {
            var select = e.target;
            var value = select.value;
            var name = select.name;
            switch (name) {
                case 'streamRes':
                    console.log('streamRes = ', value);
                    value = value.split('x')
                    localStreamOptions.resolution.width = value[0];
                    localStreamOptions.resolution.height = value[1];
                    break;
                case 'streamFPS':
                    console.log('streamFPS = ', value);
                    localStreamOptions.resolution.frameRate = value;
                    break;
                case 'streamHint':
                    console.log('streamHint = ', value);
                    localStreamOptions.resolution.hint = value;
                    break;
                default:
                    break;
            }
            console.log('New localStreamOptions = ', localStreamOptions);
        })
    }

    document.addEventListener('visibilitychange', function (event) {
        if (document.hidden) {
            console.log('not visible');
            //testTimer.clear();
            clearTimeout(testTimer)
        } else {
            console.log('is visible');
            reloadInterval();
        }
    });

    //document.getElementById('startStreamBTN').addEventListener('click', function (e) { })


    document.getElementById('startStreamBTN').onclick = (e) => {
        toggleStartStreamModal()
    }
    //document.getElementById('startStreamBG').onclick = (e) => {
    //    if (e.target === e.currentTarget) {
    //        toggleStartStreamModal();
    //    }
    //}
    document.getElementById('startScreenShare').onclick = startStream
    document.getElementById('startCameraShare').onclick = startStream
    document.getElementById('startStreamGoBack').onclick = goBack
    document.getElementById('resolutionSelector').onclick = toggleResDropdown
    document.getElementById('framerateDiv').childNodes.forEach(childNode => {
        childNode.nodeName == "SPAN" ? childNode.onclick = framerateSliderSlide : null
    })

    document.onclick = hideMenu;
    document.oncontextmenu = rightClick;

    document.getElementById('joinRoomID').onkeyup = (e) => submitOnEnter(e)
    document.getElementById('joinRoomPassword').onkeyup = (e) => submitOnEnter(e)
    document.getElementById('createRoomPassword').onkeyup = (e) => submitOnEnter(e)
    document.getElementById('createRoomID').onkeyup = (e) => submitOnEnter(e)
    document.getElementById('username').onkeyup = (e) => submitOnEnter(e)



}


