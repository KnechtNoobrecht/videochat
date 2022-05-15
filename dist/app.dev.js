"use strict";

var electron = require('electron');

var path = require('path');

var url = require('url'); // SET ENV


process.env.NODE_ENV = 'development';
var app = electron.app,
    BrowserWindow = electron.BrowserWindow,
    Menu = electron.Menu,
    ipcMain = electron.ipcMain,
    desktopCapturer = electron.desktopCapturer;
app.on('ready', function () {
  // Create new window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 500,
    title: 'Electon Example',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  /* 	mainWindow.loadURL(
  		url.format({
  			pathname: path.join(__dirname, 'public/index.html'),
  			protocol: 'file:',
  			slashes: true,
  			title: 'Electron Example'
  		})
  	); */

  mainWindow.loadURL('http://localhost/rooms/djgdkjb4563'); // Quit app when closed

  mainWindow.on('closed', function () {
    app.quit();
  });
  mainWindow.on('minimize', function (event) {});
  mainWindow.on('restore', function (event) {}); // Build menu from template

  var mainMenu = Menu.buildFromTemplate(mainMenuTemplate); // Insert menu

  Menu.setApplicationMenu(mainMenu);
  mainWindow.toggleDevTools();
}); // Create menu template

var mainMenuTemplate = [// Each object is a dropdown
{
  label: 'Application',
  submenu: [{
    label: 'About Application',
    selector: 'orderFrontStandardAboutPanel:'
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'Command+Q',
    click: function click() {
      app.quit();
    }
  }]
}, {
  label: 'Edit',
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    selector: 'undo:'
  }, {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    selector: 'redo:'
  }, {
    type: 'separator'
  }, {
    label: 'Test Function Call',
    accelerator: 'CmdOrCtrl+S',
    click: function click() {
      testFunction();
    }
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    selector: 'cut:'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    selector: 'copy:'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    selector: 'paste:'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    selector: 'selectAll:'
  }]
}]; // If OSX, add empty object to menu

if (process.platform == 'darwin') {} // mainMenuTemplate.unshift({});
// Add developer tools option if in dev


if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
      role: 'reload'
    }, {
      label: 'Toggle DevTools',
      accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click: function click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    }]
  });
}

ipcMain.handle('TestEvent', function _callee(event, data) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(data);
          return _context.abrupt("return", data);

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
});
ipcMain.handle('getSources', function _callee3(event, data) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log(data);
          desktopCapturer.getSources({
            types: ['window', 'screen']
          }).then(function _callee2(sources) {
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    mainWindow.webContents.send('SET_SOURCE', sources);

                  case 1:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          });

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // This is the Test Function that you can call from Menu

var i = 0;

function testFunction(params) {
  i++;
  console.log('You Click in Menu the Test Button i = ', i);
  mainWindow.send('TestEvent', i);
}