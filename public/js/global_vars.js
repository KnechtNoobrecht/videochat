var modals = {}

const localVideo = document.getElementById('localVideo');
const videoWrapper = document.getElementById('videowrapper')
const framerateSlider = document.getElementById('slider-fr')
const resolutionSlider = document.getElementById('slider-rs')
const framerateDiv = document.getElementById('framerateDiv');
const resolutionDiv = document.getElementById('resolutionDiv');

let startx = 0;
let starty = 0;
let dist = 0;

var isChatOpen = false;
const chatbtn = document.querySelector('.chat-open-close-btn');
const chatBody = document.querySelector('.chat-body');

var slideing = false;

const sidebarR = document.getElementById('rs');
const sidebarL = document.getElementById('ls');