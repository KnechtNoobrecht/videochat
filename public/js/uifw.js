const localVideo = document.getElementById('localVideo');
const videoWrapper = document.getElementById('videowrapper')
const framerateSlider = document.getElementById('slider-fr')
const resolutionSlider = document.getElementById('slider-rs')
const framerateDiv = document.getElementById('framerateDiv');
const resolutionDiv = document.getElementById('resolutionDiv');




/* framerateDiv.onclick = function () {
    toggleSlider(this)
}

resolutionDiv.onclick = function () {
    toggleSlider(this)
} */

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




class Modal {
    constructor(wrapper) {
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
    }

    close() {
        this.wrapper.classList.remove('show');
        this.wrapper.classList.add('hide');
        //this.#wrapper.style.display = "none";
    }
}

var modals = {}

function initModals() {
    var mods = Array.from(document.getElementsByTagName('modal'));
    console.log(mods);

    for (var i = 0; i < mods.length; i++) {
        console.log('mods[', i, '] ', mods[i]);
        // console.log('i ', i);
        var m = new Modal(mods[i]);
        modals[m.id] = m;
    }


    document.getElementById('username').value = identitys[0].username;
    document.getElementById('avatar').value = identitys[0].avatar;
    if (identitys[0].username == 'Anonymous') {
        openProfileModal()
    }
}
initModals();

function setCssVar(variable, value) {
    document.documentElement.style.setProperty('--' + variable, value);
}

var firstTime = true;
if (document.addEventListener) {
    document.addEventListener('contextmenu', function (e) {
        if (firstTime) {
            firstTime = false;
            console.log("You've tried to open context menu", e); //here you draw your own menu
            // e.preventDefault();
        } else {
            firstTime = true;
        }

    }, false);
} else {
    document.attachEvent('oncontextmenu', function () {
        alert("You've tried to open context menu");
        window.event.returnValue = false;
    });
}

function openProfileModal() {
    modals.setIdent.open()
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
    if (identitys[0].username != 'Anonymous') {
        modals.setIdent.close()
    }
}