const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// register babel hook
require("babel-register")();

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false
    },
  	width: 1200,
		height: 750,
    icon: __dirname + '/resources/app/public/logo.ico'
  });

  require("./server").start()
  .then((app) => {
     mainWindow.loadURL('http://localhost:3000');
  }).catch((err) => {
  
  });

  mainWindow.openDevTools();
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
