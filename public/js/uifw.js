
const localVideo = document.getElementById('localVideo');
const videoWrapper = document.getElementById('videowrapper')
const framerateSlider = document.getElementById('slider-fr')
const resolutionSlider = document.getElementById('slider-rs')
const framerateDiv = document.getElementById('framerateDiv');
const resolutionDiv = document.getElementById('resolutionDiv');




framerateDiv.onclick = function () {
    toggleSlider(this)
}

resolutionDiv.onclick = function () {
    toggleSlider(this)
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
    var mods = document.getElementsByTagName('modal');
    for (const modal in mods) {
        const element = mods[modal];
        if (element.id) {
            var m = new Modal(element);
            modals[m.id] = m;
        }
    }
}
initModals();

function setCssVar(variable, value) {
    document.documentElement.style.setProperty('--' + variable, value);
}
