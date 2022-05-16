"use strict";

var ipcRenderer = require('electron').ipcRenderer;

window.TestEvent = function _callee(data) {
  var result;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(ipcRenderer.invoke('getSources', data));

        case 2:
          result = _context.sent;
          console.log('TestEvent return ', result);

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

ipcRenderer.on('TestEvent', function (event, data) {
  console.log('TestEvent ', data);
  document.getElementById('testFuncCall').innerText = "Button was pressed ".concat(data, " times");
});
ipcRenderer.on('SET_SOURCE', function _callee2(event, sources) {
  var stream;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('SET_SOURCE ', sources);
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(navigator.mediaDevices.getUserMedia({
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
          }));

        case 4:
          stream = _context2.sent;
          handleStream(stream);
          _context2.next = 11;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](1);
          handleError(_context2.t0);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 8]]);
});

function handleStream(stream) {
  var video = document.querySelector('video');
  localStream = stream;
  video.srcObject = localStream;

  video.onloadedmetadata = function (e) {
    return video.play();
  };
}

function handleError(e) {
  console.log(e);
}