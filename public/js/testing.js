function logCookies() {
    console.log("log Cookies = ", getCookieObject("ep_Identitys"));
}

function logIdentitysArray() {
    console.log("log Identitys Array = ", identitys);
}

function logPeerManager(params) {
    console.log("log Peer Manager = ", pm);
}

var buttonsVis = false;
function toogleTestButtons() {
    if (buttonsVis) {
        document.getElementById("testButtons").style.display = "none";
        buttonsVis = false;
    } else {
        document.getElementById("testButtons").style.display = "block";
        buttonsVis = true;
    }
}
//toogleTestButtons();
