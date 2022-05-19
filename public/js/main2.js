//import { Peer, PeersManager } from 'easy-peer';
const localVideo = document.getElementById('localVideo');
const videoWrapper = document.getElementById('videowrapper')
const framerateSlider = document.getElementById('slider-fr')
const resolutionSlider = document.getElementById('slider-rs')
const framerateDiv = document.getElementById('framerateDiv');
const resolutionDiv = document.getElementById('resolutionDiv');

//socket.on("connect", async () => {
//    //var idd = new Identity();
//    //console.log(idd);
//});


function renderButtons(sioids) {
    var html = "";
    sioids.forEach((element) => {
        if (element && element.socket != socket.id) {
            html += `<button id="selectStreamButton" onclick="getStream('${element.socket}')">Call ${element.identity.username} - ${element.socket}</button>`;
            html += `<input type="file" onchange="readFile(this,'${element.socket}')">send file to ${element.identity.username} - ${element.socket}</input><br>`;
        } else {
            html += `<button id="selectStreamButton" >This Tab - ${element.identity.username}</button><br>`;
        }
    });
    document.getElementById("buttosdiv").innerHTML = html;
}

async function callSID(sid) {
    var options = { initiator: true, remotesid: sid };
    var p = new Peer(options);
    await p.init(null);
    pm.addPeer(p);
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
            }
            break;
    
        default:
            break;
    }
}

framerateDiv.onclick = function () {
    toggleSlider(this)
}

resolutionDiv.onclick = function () {
    toggleSlider(this)
}