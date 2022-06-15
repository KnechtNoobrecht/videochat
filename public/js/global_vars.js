/**
 * @var socket
 * @type socketio Object
 * @description Holds the socketio connection
 */
const socket = io()

/**
 * @var roomID
 * @type String
 * @description Holds the current Room ID
 */
const roomID = window.location.pathname.split('/').pop()

/**
 * @var localStream
 * @type MediaStream Object
 * @description Holds the local Media Stream that you are publishing to the room.
 */
//ar localStream = null
var localStream = new MediaStream();

/**
 * @var localAudioStream
 * @type MediaStream Object
 * @description Holds the local Audio only Media Stream that you are publishing to the room.
 */
var localAudioStream = null

/**
 * @var peers
 * @type Object
 * @description Holds all peer 2 peer connections
 */
var peers = {}

/**
 * @var room
 * @type Object
 * @description Holds infos about the room
 */
var room

/**
 * @var identitys
 * @type Object
 * @description Holds your identitys
 */
var identitys = []

/**
 * @var pm
 * @type PeersManager
 * @description Holds the default PeersManager
 */
var pm

/**
 * @var pma
 * @type PeersManager
 * @description Holds the default PeersManagerAudio
 */
var pma

/**
 * @var modals
 * @type {Object}
 * @description Holds all modals that on this site
 */
var modals = {}

var tabs = {}

/**
 * @var reloadCSS
 * @type {Boolean}
 * @description controls the automatic reloading of css files
 */
var reloadCSS = false

/**
 * @var localStreamOptions
 * @type {Object}
 * @description controls with which quality you stream
 */
var localStreamOptions = {
    resolution: {
        width: 1920,
        height: 1080,
        frameRate: 30,
        hint: 'motion'
    },
    mediaRecorderOptions: {
        mimeType: 'video/webm;codecs=opus,vp8',
        videoMaximizeFrameRate: true,
        videoBitsPerSecond: 20000000,
        audioBitsPerSecond: 128000
    }
}

/**
 * @var startx
 * @type {Int}
 * @description is used for gesture control
 */
let startx = 0;

/**
 * @var starty
 * @type {Int}
 * @description is used for gesture control
 */
let starty = 0;

/**
 * @var dist
 * @type {Int}
 * @description is used for gesture control
 */
let dist = 0;

/**
 * @var chatBody
 * @type {Element}
 * @description Hold the chat body element
 */
const chatBody = document.querySelector('.chat-body');

/**
 * @var slideing
 * @type {Int}
 * @description Hold the chat body element
 */
var slideing = false;

/**
 * @var sidebarR
 * @type {Element}
 * @description Hold the Right Side Bar element
 */
const sidebarR = document.getElementById('rs');

/**
 * @var sidebarL
 * @type {Element}
 * @description Hold the Left Side Bar element
 */
const sidebarL = document.getElementById('ls');


var soundsPlayer

var rezizeToMobile
var rezizeToDesktop

var showVideoWithoutStream = true

var inStageMode = false;

var videoElemente = {}

var peerServerOptions = {
    iceServers: [{
        urls: 'stun:85.214.194.29:3578'
    }, {
        urls: 'turn:85.214.194.29:3578',
        username: 'test',
        credential: 'test123'
    }, {
        urls: 'stun:stun.l.google.com:19302'
    }]
}



/* var peerServerOptions = {
    iceServers: [{
            urls: 'stun:85.214.194.29:3578'
        }, {
            urls: 'turn:85.214.194.29:3578',
            username: 'test',
            credential: 'test123'
        }, {
            urls: 'stun:stun.l.google.com:19302'
        }, {
            url: 'stun:stun01.sipphone.com'
        },
        {
            url: 'stun:stun.ekiga.net'
        },
        {
            url: 'stun:stun.fwdnet.net'
        },
        {
            url: 'stun:stun.ideasip.com'
        },
        {
            url: 'stun:stun.iptel.org'
        },
        {
            url: 'stun:stun.rixtelecom.se'
        },
        {
            url: 'stun:stun.schlund.de'
        },
        {
            url: 'stun:stun.l.google.com:19302'
        },
        {
            url: 'stun:stun1.l.google.com:19302'
        },
        {
            url: 'stun:stun2.l.google.com:19302'
        },
        {
            url: 'stun:stun3.l.google.com:19302'
        },
        {
            url: 'stun:stun4.l.google.com:19302'
        },
        {
            url: 'stun:stunserver.org'
        },
        {
            url: 'stun:stun.softjoys.com'
        },
        {
            url: 'stun:stun.voiparound.com'
        },
        {
            url: 'stun:stun.voipbuster.com'
        },
        {
            url: 'stun:stun.voipstunt.com'
        },
        {
            url: 'stun:stun.voxgratia.org'
        },
        {
            url: 'stun:stun.xten.com'
        },
        {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }
    ]
} */

/* const iceConfiguration = {
    iceServers: [{
        urls: 'turn:my-turn-server.mycompany.com:19403',
        username: 'optional-username',
        credentials: 'auth-token'
    }]
} */