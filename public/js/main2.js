//import { Peer, PeersManager } from 'easy-peer';

socket.on("connect", async () => {
    //var idd = new Identity();
    //console.log(idd);
});

function renderButtons(sioids) {
    var html = "";
    sioids.forEach((element) => {
        if (element != socket.id) {
            html += `<button id="selectStreamButton" onclick="callSID('${element.socket}')">Call ${element.identity.username} - ${element.socket}</button><br>`;
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
const remoteVideo = document.getElementById('remoteVideo');