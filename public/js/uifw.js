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
        openProfileModal()
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