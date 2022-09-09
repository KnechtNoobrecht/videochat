/* framerateDiv.onclick = function () {
    toggleSlider(this)
}

resolutionDiv.onclick = function () {
    toggleSlider(this)
} */

function alignElement(targetElement) {
    //targetElement.style.top = (document.getElementById('startStreamBTN').getBoundingClientRect().top - targetElement.getBoundingClientRect().height- 10) + 'px'
    buttonSize = document.getElementById('startStreamBTN').getBoundingClientRect()
    targetElement.style.left = `${buttonSize.left - (targetElement.getBoundingClientRect().width - buttonSize.width) / 2}px`
}

function toggleStartStreamModal(ctx) {
    if (startStreamModal.style.display == "-webkit-box") {
        startStreamModal.style.height = "190.667px"
        startStreamModal.scrollTo(0, 0)
        startStreamModal.style.display = "none"
        alignElement(startStreamModal)
    } else {
        startStreamModal.style.display = "-webkit-box"
        alignElement(startStreamModal)
    }
    //console.log(ctx.target.getBoundingClientRect().top);
}

function startStream(ctx) {
    if (ctx.target.className == "shareScreenWrapper" || ctx.target.parentNode.className == "shareScreenWrapper") {
        shareType = "screen"
    } else if (ctx.target.className == "shareCameraWrapper" || ctx.target.parentNode.className == "shareCameraWrapper") {
        shareType = "camera"
    }
    console.log("shareType: ", shareType);
    targetElement = document.getElementById('startStreamModal')
    //startStreamModal.style.width = "150px"
    startStreamModal.style.height = "228px"
    startStreamStepTwo.scrollIntoView({ behavior: "smooth" })

    alignElement(targetElement)
}

function goBack(ctx) {
    targetElement = document.getElementById('startStreamModal')
    //startStreamModal.style.width = "165.2px"
    startStreamModal.style.height = "190.667px"
    startStreamStepOne.scrollIntoView({ behavior: "smooth" })
    alignElement(targetElement)
}

function framerateSliderSlide(ctx) {
    slider = document.getElementById('slider-fr')
    framerateDiv = document.getElementById('framerateDiv')

    slider.style.left = ctx.target.getBoundingClientRect().left - framerateDiv.getBoundingClientRect().left - 6 + 'px'
    localStreamOptions.resolution.frameRate = ctx.target.dataset.value
}

document.getElementById('startStreamBTN').onclick = toggleStartStreamModal
document.getElementById('startScreenShare').onclick = startStream
document.getElementById('startCameraShare').onclick = startStream
document.getElementById('startStreamGoBack').onclick = goBack
document.getElementById('framerateDiv').childNodes.forEach(childNode => {
    childNode.nodeName == "SPAN" ? childNode.onclick = framerateSliderSlide : null
})

function toggleSlider(ctx) {
    //console.log('toggleSlider(ctx)');
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


class Modal extends EventTarget {
    #event;
    constructor(wrapper) {
        super();
        this.wrapper = wrapper
        this.wrapper.classList.add('modal-wrapper');
        this.wrapper.classList.add('hide');
        this.id = this.wrapper.id;
        document.body.appendChild(this.wrapper);
    }

    open() {
        this.wrapper.classList.add('show');
        this.wrapper.classList.remove('hide');
        //this.#wrapper.style.display = "block";
        this.#event = new CustomEvent('opened');
        this.dispatchEvent(this.#event);
    }

    close() {
        this.wrapper.classList.remove('show');
        this.wrapper.classList.add('hide');
        //this.#wrapper.style.display = "none";
        this.#event = new CustomEvent('closed');
        this.dispatchEvent(this.#event);
    }
}

class Tab {
    constructor(tab) {
        this.tab = tab;
        this.bodys = {}
    }
    show(index) {
        var keys = Object.keys(this.bodys)
        for (let y = 0; y < keys.length; y++) {
            const element = this.bodys[keys[y]];
            element.classList.remove('active');
        }
        this.bodys[index].classList.add('active');
    }
}

function escapeRegExp(string,) {
    return string.replace(/(?<=\${).*(?=})/g, '\\$&'); // $& means the whole matched string
}

class Toast extends EventTarget {
    #event;
    constructor(data) {
        super();
        console.log(data);
        data = data || {};
        console.log(data);
        if (!data.footer && !data.header && !data.content) {
            return
        }

        //(?<=\${).*(?=})
        //const regexp = /(?<=\${).*(?=})/g;
        //const array = [...data.footer.matchAll(regexp)];
        //console.log(array);

        this.element = cloneTemplate('testToast')
        this.header = this.element.querySelector('.toast-header');
        this.content = this.element.querySelector('.toast-content');
        this.footer = this.element.querySelector('.toast-footer');
        this.footer.innerHTML = data.footer || '';
        this.header.innerHTML = data.header || '';
        this.content.innerHTML = data.content || '';
        this.id = uuid();
        toasts[this.id] = this
        console.log('toast = ', data);

        if (typeof data.ms == 'undefined') {
            this.ms = 3000;
        } else if (data.ms <= 0) {
            this.ms = 0;
            this.header.innerHTML += `<button class="btn form-input" onclick="toasts['${this.id}'].close()">X</button>`
        } else {
            this.ms = data.ms;
        }
        console.log(this.ms);
        if (this.ms > 0) {
            var inter = setInterval(() => {
                clearInterval(inter)
                this.close();
            }, this.ms);
        }

        toastContainer.appendChild(this.element);
        //this.element.classList.add('swipe-in');
        //this.element.style.transform = 'translate(0%, 0%)';
    }
    close() {
        console.log('close', this.element);
        console.log('close', this.testel);
        this.element.classList.add('fade-out');
        var inter = setInterval(() => {
            this.element.remove();
            delete toasts[this.id];
            this.#event = new CustomEvent('closed');
            this.dispatchEvent(this.#event);
            clearInterval(inter)
            delete this;
            console.log('closed');
        }, 300);

    }
}



function initModals() {
    var mods = Array.from(document.getElementsByTagName('modal'));
    //console.log(mods);

    for (var i = 0; i < mods.length; i++) {
        // console.log('mods[', i, '] ', mods[i]);
        // console.log('i ', i);
        var m = new Modal(mods[i]);
        modals[m.id] = m;
    }


    document.getElementById('username').value = identitys[0].username;
    document.getElementById('avatar').value = identitys[0].avatar;
    if (identitys[0].username == 'Anonymous') {
        //  openProfileModal()
    }
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

        console.log('tabs[', infoDataTabs.id, '] ', tabs[infoDataTabs.id]);
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
        console.log('modals.setIdent.closed', e);

        if (cb) {
            cb(e)
        }
    });
}

function saveProfile() {
    // document.getElementById('username').value = identitys[0].username;
    // document.getElementById('avatar').value = identitys[0].avatar;
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
}



document.onclick = hideMenu;
document.oncontextmenu = rightClick;

function hideMenu() {
    document.getElementById("contextMenu").style.display = "none"
}

function rightClick(e) {
    if (document.getElementById("contextMenu").style.display == "block")
        hideMenu();
    else {
        var id
        for (let index = 0; index < e.path.length; index++) {
            const element = e.path[index];
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
        }

        if (id) {
            e.preventDefault();
            var menu = document.getElementById("contextMenu")
            var elementWrapper = document.querySelector('ul');
            var videoElement = document.getElementById('videoElement_' + id)
            var video = videoElement.querySelector('video');

            elementWrapper.innerHTML = ""
            room.members[id].identity.isStreaming

            if (room.members[id].identity.isStreaming) {
                if (!video.srcObject) {
                    elementWrapper.innerHTML += renderConMenuItem(id, 'Watch', 'watch_video')
                } else {
                    elementWrapper.innerHTML += renderConMenuItem(id, 'Stop', 'stop_video')
                }
            }
            if (video.muted) {
                elementWrapper.innerHTML += renderConMenuItem(id, 'Unmute', 'toggle_mute_video')
            } else {
                elementWrapper.innerHTML += renderConMenuItem(id, 'Mute', 'toggle_mute_video')
            }

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
                elementWrapper.innerHTML += renderConMenuItem(id, 'Open Profile', 'user_profile')
            }

            menu.style.display = 'block';
            menu.style.left = e.pageX + "px";
            menu.style.top = e.pageY + "px";
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
            modals.setIdent.open()
            break;
        case 'remove_admin':
            console.log('remove_admin = ', room.members[id]);
            socket.emit('removeAdmin', id, roomID)
            break;
        case 'make_admin':
            console.log('make_admin = ', room.members[id]);
            socket.emit('makeAdmin', id, roomID)
            break;
        default:
            break;
    }
}

function renderConMenuItem(id, txt, type) {
    return `<li onclick="handleConMenuItemClick('${id}', '${type}')"><a href="#" >${txt}</a></li>`
}