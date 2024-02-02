//TODO andere datei teilen button beim uploader
//TODO file selection wenn admin reloaded
//TODO fix download file when edit profile is closed instead of saved
//TODO feinschliff: ladeicon bei client am anfang, "raum wurde nicht gefunden" ändern

var hostSocketID = ""
var sharePeer
var shareFileSize = 0
var shareFileName = ""
var receiveBuffer = [];
var receivedSize = 0
var lastProgressVal = 0
var lastTimestamp = 0
var ProgressDValue = ""

const ProgressWrapper = document.getElementById('progresswrapper')
const ProgressWrapperHost = document.getElementById('progresswrapperhost')
const ProgressBar = document.getElementById('progressbar')
const ProgressBarHost = document.getElementById('progressbarhost')
const ProgressD = document.getElementById('progressdialogue')
const ProgressDHost = document.getElementById('progressdialoguehost')

function InitShare() {
    fetch("/share/getID")
        .then(response => response.json())
        .then(data => {
            createRoom(data.ID)
            showShareUI()
        })
}

function showShareUI() {
    var fileName = document.getElementById("shareFileInput").value.split('\\').pop()
    document.getElementById("shareFileDescription").innerText = fileName
    modals.shareFile.close()
    modals.shareFileUpload.open()
    socket.emit("shareRoomUpdate", {
        roomID: roomID, 
        hostSocketID: socket.id, 
        fileName: fileName
    })
}

function copyToClipboard(url) {
    navigator.clipboard.writeText(url);
    new Toast({ type: "success", content: "Link in die Zwischenablage kopiert" })
}

function downloadSharedFile() {
    socket.emit("getP2PFile", {roomID: roomID})
    console.log("requesting download...");
}

function sendSharedFile(remoteSocketID) {
    let options = {
        initiator: true,
        remotesid: remoteSocketID,
        type: "share"
    }
    sharePeer = new Peer(options)
    sharePeer.init()
    sharePeer.dataChannel = sharePeer.createDataChannel("sendFile")
    sharePeer.dataChannel.binaryType = "arraybuffer"
    sharePeer.dataChannel.addEventListener('close', console.log("data channel closed"));
    sharePeer.dataChannel.addEventListener('error', (error) => {console.log(error)});
    sharePeer.dataChannel.addEventListener('open', () => {
        console.log("data channel ready")

        const file = document.getElementById("shareFileInput").files[0];
        // Handle 0 size files.
        if (file.size === 0) {
          //bitrateDiv.innerHTML = '';
          //statusMessage.textContent = 'File is empty, please select a non-empty file';
          console.log("File is empty, please select a non-empty file");
          //closeDataChannels();
          return;
        }

        //sendProgress.max = file.size;
        //receiveProgress.max = file.size;
        console.log("transferring file:");
        const chunkSize = 16384;
        fileReader = new FileReader();
        let offset = 0;
        var timeout = null
        ProgressWrapperHost.style.opacity = 1

        var ProgressDInterval = setInterval(() => {
            ProgressD.innerHTML = ProgressDValue
        }, 1000)

        fileReader.addEventListener('error', error => console.error('Error reading file:', error));
        fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
        fileReader.addEventListener('load', async (e) => {
            console.log(sharePeer.dataChannel.bufferedAmount);
            
            while (sharePeer.dataChannel.bufferedAmount + 2 * chunkSize > 16777214) {
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log("Waiting for queue to empty...");
            }

            var loadingSpeed = (offset - lastProgressVal) / (Date.now() - lastTimestamp)
            lastProgressVal = offset
            lastTimestamp = Date.now()
            var percentage = (offset / file.size) * 100
            percentage = Math.round(percentage)
            console.log(percentage)
            ProgressBarHost.value = percentage/100
            var timeRemaining = Math.round((file.size - offset) / loadingSpeed / 1000)
            console.log(loadingSpeed)
            if(loadingSpeed>0.1) {
                ProgressDHost.style.visibility = "visible"
                if(timeRemaining > 3600) {                                   
                    Math.round(timeRemaining/3600) != 1 ? ProgressDValue = `${processLoadingSpeed(loadingSpeed)} - ${Math.round(timeRemaining/3600)} Stunden verbleibend` : ProgressDValue = `${processLoadingSpeed(loadingSpeed)} - ${Math.round(timeRemaining/3600)} Stunde verbleibend`
                } else if(timeRemaining > 60) {
                    Math.round(timeRemaining/60) != 1 ? ProgressDValue = `${processLoadingSpeed(loadingSpeed)} - ${Math.round(timeRemaining/60)} Minuten verbleibend` : ProgressDValue = `${processLoadingSpeed(loadingSpeed)} - ${Math.round(timeRemaining/60)} Minute verbleibend`   
                } else {
                    timeRemaining != 1 ? ProgressDValue = `${processLoadingSpeed(loadingSpeed)} - ${timeRemaining} Sekunden verbleibend` : ProgressDValue = `${processLoadingSpeed(loadingSpeed)} - ${timeRemaining} Sekunde verbleibend`
                }
            }

            //console.log('FileRead.onload ', e);
            sharePeer.shareSend(e.target.result);
            offset += e.target.result.byteLength;
            //sendProgress.value = offset;
            console.log((offset/file.size*100)+"%");
            if (offset < file.size) {
              readSlice(offset);
            }
          
        });

        const readSlice = o => {
          //console.log('readSlice ', o);
          const slice = file.slice(offset, o + chunkSize);
          fileReader.readAsArrayBuffer(slice);
        };

        readSlice(0);
    })
}

socket.on('peerOffer', async (indata) => {
    if(indata.type == "share") {
        console.log('incoming Peer offer = ', indata);

        // { offer: offer, initiatorsid: this.sid, connectionID: this.id }
        let options = {
            initiator: false,
            remotesid: indata.fromSocket,
            connectionID: indata.connectionID
        }
        sharePeer = new Peer(options)
        pm.addPeer(sharePeer)
        console.log("added sharepeer to peersmanager");
        var outdata = await sharePeer.init(indata.data.offer)
        socket.emit('peerAnswer', {
            fromSocket: indata.toSocket,
            toSocket: indata.fromSocket,
            connectionID: sharePeer.connectionID,
            data: {
                answer: outdata
            }
        })

    }
})

socket.on('triggerShareUpdate', () => {
    const file = document.getElementById("shareFileInput").files[0]
    socket.emit("shareRoomUpdate", {
        roomID: roomID, 
        hostSocketID: socket.id, 
        fileName: file.name,
        fileSize: file.size
    })
})

socket.on("shareRoomUpdate", (data) => {
    console.log("Got shareRoomUpdate: ");
    console.log(data);
    if(data.hostSocketID != socket.id) {
        sharedFileDescription.innerText = data.fileName
        shareFileName = data.fileName
        shareFileSize = data.fileSize
    }
})

socket.on("getP2PFile", (data) => {
    console.log("got download request, initiating peer connection...");
    sendSharedFile(data.requestorID)
})