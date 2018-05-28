const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow

module.exports = class Application {
  createWindow() {
    this.mainWindow = new BrowserWindow({ width: 1366, height: 768 });

    this.startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true,
    });
    this.mainWindow.loadURL(this.startUrl);

    this.mainWindow.webContents.openDevTools();

    this.mainWindow.on('closed', function () {
      this.mainWindow = null
    });
  }

  ready() {
    app.on('ready', this.createWindow);
    app.on('window-all-closed', () => {
      if(process.platform !== 'darwin') {
        app.quit();
      };
    });
    app.on('activate', () => {
      if(this.mainWindow === null) {
        this.createWindow();
      }
    });
  }

  run() {
    this.ready();
  }
}
