var ipcRenderer = require('electron').ipcRenderer;

window.TestEvent = async function (data) {
    const result = await ipcRenderer.invoke('getSources', data);
    console.log('TestEvent return ', result);
}

ipcRenderer.on('TestEvent', function (event, data) {
    console.log('TestEvent ', data);
    document.getElementById('testFuncCall').innerText = `Button was pressed ${data} times`
});




ipcRenderer.on('SET_SOURCE', async (event, sources) => {
    console.log('SET_SOURCE ', sources);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            //Audio bringt ihn zu abstürzen! 
            audio: {
                autoGainControl: false,
                channelCount: 2,
                echoCancellation: false,
                latency: 0,
                noiseSuppression: false,
                sampleRate: 96000,
                sampleSize: 24,
                volume: 1.0
            },
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sources[4].id,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        })
        handleStream(stream)
    } catch (e) {
        handleError(e)
    }
})

function handleStream(stream) {
    const video = document.querySelector('video')
    localStream = stream
    video.srcObject = localStream
    video.onloadedmetadata = (e) => video.play()
}

function handleError(e) {
    console.log(e)
}