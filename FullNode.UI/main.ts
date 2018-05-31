import { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve' || val === '-serve');
const testnet = args.some(val => val === '--testnet' || val === '-testnet');
const customPort = args.filter(val => val.indexOf('--port=') >= 0 || val.indexOf('-port=') >= 0);

let apiPort = testnet ? 38221 : 37221;
if (!!customPort && customPort.length > 0) {
  const portKeyValuePairTokens = customPort[0].split('=');
  if (portKeyValuePairTokens.length === 2 && parseInt(portKeyValuePairTokens[1], 10) !== NaN) {
    apiPort = parseInt(portKeyValuePairTokens[1], 10);
  }
}

ipcMain.on('get-port', (event, arg) => {
  event.returnValue = apiPort;
});

try {
  require('dotenv').config();
} catch {
  console.log('asar');
}

require('electron-context-menu')({
  showInspectElement: serve
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 650,
    frame: true,
    minWidth: 1150,
    minHeight: 650,
    title: 'Stratis Core'
  });

  if (serve) {
    require('electron-reload')(__dirname, {
    });
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is going to close.
  mainWindow.on('close', () => {
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (serve) {
    console.log('Stratis UI was started in development mode. This requires the user to be running the Stratis Full Node Daemon himself.');
  } else {
    startStratisApi();
  }
  createTray();
  createWindow();
  if (os.platform() === 'darwin') {
    createMenu();
  }
});

app.on('before-quit', () => {
  closeStratisApi();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function closeStratisApi() {
  // if (process.platform !== 'darwin' && !serve) {
    if (process.platform !== 'darwin' && !serve && !testnet) {
      const http2 = require('http');
      const options1 = {
        hostname: 'localhost',
        port: 37221,
        path: '/api/node/shutdown',
        method: 'POST'
      };

     const req = http2.request(options1, (res) => {});
     req.write('');
     req.end();

   } else if (process.platform !== 'darwin' && !serve && testnet) {
     const http2 = require('http');
     const options2 = {
       hostname: 'localhost',
       port: 38221,
       path: '/api/node/shutdown',
       method: 'POST'
     };

     const req = http2.request(options2, (res) => {});
     req.write('');
     req.end();
   }
}

function startStratisApi() {
  let stratisProcess;
  const spawnStratis = require('child_process').spawn;

  // Start Stratis Daemon
  let apiPath = path.resolve(__dirname, 'assets//daemon//Stratis.StratisD');
  if (os.platform() === 'win32') {
    apiPath = path.resolve(__dirname, '..\\..\\resources\\daemon\\Stratis.StratisD.exe');
  } else if (os.platform() === 'linux') {
    apiPath = path.resolve(__dirname, '..//..//resources//daemon//Stratis.StratisD');
  } else {
    apiPath = path.resolve(__dirname, '..//..//resources//daemon//Stratis.StratisD');
  }

  if (!testnet) {
    stratisProcess = spawnStratis(apiPath, {
      detached: true
    });
  } else if (testnet) {
    stratisProcess = spawnStratis(apiPath, ['-testnet'], {
      detached: true
    });
  }

  stratisProcess.stdout.on('data', (data) => {
    writeLog(`Stratis: ${data}`);
  });
}

function createTray() {
  // Put the app in system tray
  let trayIcon;
  if (serve) {
    trayIcon = nativeImage.createFromPath('./src/assets/images/icon-tray.png');
  } else {
    trayIcon = nativeImage.createFromPath(path.resolve(__dirname, '../../resources/src/assets/images/icon-tray.png'));
  }

  const systemTray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Hide/Show',
      click: function() {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    },
    {
      label: 'Exit',
      click: function() {
        app.quit();
      }
    }
  ]);
  systemTray.setToolTip('Stratis Core');
  systemTray.setContextMenu(contextMenu);
  systemTray.on('click', function() {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }

    if (!mainWindow.isFocused()) {
      mainWindow.focus();
    }
  });

  app.on('window-all-closed', function () {
    if (systemTray) { systemTray.destroy(); }
  });
}

function writeLog(msg) {
  console.log(msg);
}

function createMenu() {
  const menuTemplate = [{
    label: app.getName(),
    submenu: [
      { label: `About ${app.getName()}`, selector: 'orderFrontStandardAboutPanel:' },
      { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); }}
    ]}, {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}
