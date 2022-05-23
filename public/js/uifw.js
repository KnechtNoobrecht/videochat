
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