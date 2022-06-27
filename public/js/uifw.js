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

function escapeRegExp(string, ) {
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
                console.log('interval stop ');
                clearInterval(inter)
                this.close();
            }, this.ms);
        }

        this.testel = toastContainer.appendChild(this.element);
    }
    close() {
        console.log('close', this.element);
        console.log('close', this.testel);
        this.element.remove();
        //toasts.splice(toasts.indexOf(this), 1);
        delete toasts[this.id];
        this.#event = new CustomEvent('closed');
        this.dispatchEvent(this.#event);
        delete this;
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