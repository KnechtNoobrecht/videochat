//import { Peer, PeersManager } from 'easy-peer';

socket.on("connect", async () => {
    //var idd = new Identity();
    //console.log(idd);
});

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

const localVideo = document.getElementById('localVideo');
const videoWrapper = document.getElementById('videowrapper')