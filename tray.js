const electron = require('electron');
const path = require('path');
const app = electron.app;
let tray = null;

exports.create = function(mainWindow) {
  if (process.platform === 'darwin' || tray) {
    return;
  }

  const iconPath = path.join(__dirname, '/public/preserver_small.png');

  const toggleWin = function(){
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  };

  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: 'Restore Preserver',
      click() {
        toggleWin();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click() {
        app.quit();
      }
    }
  ]);

  tray = new electron.Tray(iconPath);
  tray.setToolTip('Preserver');
  tray.setContextMenu(contextMenu);
  tray.on('click', toggleWin);
};
