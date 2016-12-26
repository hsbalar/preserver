const electron = require('electron');
const tray = require('./tray');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const mainPage = 'file://' + __dirname + '/public/index.html';

var isQuitting = false;
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
    icon: __dirname + '/resources/app/public/images/preserver_icon.png'
  });

  mainWindow.loadURL(mainPage);

  tray.create(mainWindow);

  // mainWindow.openDevTools();
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();
      if (process.platform === 'darwin') {
        app.hide();
      } else {
        mainWindow.hide();
      }
    }
  });

  app.on('before-quit', function() {
    isQuitting = true;
  });
});
