import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';

if (os.arch() === 'arm') {
  app.disableHardwareAcceleration();
}

// Set to true if you want to build Core for sidechains
const buildForSidechain = false;
const daemonName = buildForSidechain ? 'Stratis.CirrusD' : 'Stratis.StratisD';

const args = process.argv.slice(1);

args.push('--enableSignalR');

console.log(args);

const serve = args.some(val => val === '--serve' || val === '-serve');
const testnet = args.some(val => val === '--testnet' || val === '-testnet');
let sidechain = args.some(val => val === '--sidechain' || val === '-sidechain');
let nodaemon = args.some(val => val === '--nodaemon' || val === '-nodaemon');
const devtools = args.some(val => val === '--devtools' || val === '-devtools');

if (buildForSidechain) {
  sidechain = true;
}

const applicationName = sidechain ? 'Cirrus Core' : 'Stratis Core';

// Set default API port according to network
let apiPortDefault;
if (testnet && !sidechain) {
  apiPortDefault = 38221;
} else if (!testnet && !sidechain) {
  apiPortDefault = 37221;
} else if (sidechain && testnet) {
  apiPortDefault = 38223;
} else if (sidechain && !testnet) {
  apiPortDefault = 37223;
}

// Sets default arguments
const coreargs = require('minimist')(args, {
  default: {
    daemonip: 'localhost',
    apiport: apiPortDefault
  },
});

// Apply arguments to override default daemon IP and port
const daemonIP = coreargs.daemonip;
const apiPort = coreargs.apiport;

// Prevents daemon from starting if connecting to remote daemon.
if (daemonIP !== 'localhost') {
  nodaemon = true;
}

ipcMain.on('get-port', (event) => {
  event.returnValue = apiPort;
});

ipcMain.on('get-testnet', (event) => {
  event.returnValue = testnet;
});

ipcMain.on('get-sidechain', (event) => {
  event.returnValue = sidechain;
});

ipcMain.on('get-daemonip', (event) => {
  event.returnValue = daemonIP;
});

require('electron-context-menu')({
  showInspectElement: serve
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function writeLog(msg): void {
  console.log(msg);
}

function createMenu(): void {
  const menuTemplate = [{
    label: app.getName(),
    submenu: [
      { label: 'About ' + app.getName(), selector: 'orderFrontStandardAboutPanel:' },
      {
        label: 'Quit', accelerator: 'Command+Q', click: function(): void {
          app.quit();
        }
      }
    ]
  }, {
    label: 'Edit',
    submenu: [
      {label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
      {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
      {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
      {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
      {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
      {label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'}
    ]
  }];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

function shutdownDaemon(daemonAddr, portNumber): void {
  const http = require('http');
  const body = JSON.stringify({});

  const request = new http.ClientRequest({
    method: 'POST',
    hostname: daemonAddr,
    port: portNumber,
    path: '/api/node/shutdown',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  });

  request.write('true');
  request.on('error', function () {
  });
  request.on('timeout', function () {
    request.abort();
  });
  request.on('uncaughtException', function () {
    request.abort();
  });

  request.end(body);
}

function startDaemon(): void {
  const spawnDaemon = require('child_process').spawn;

  let daemonPath;
  if (os.platform() === 'win32') {
    daemonPath = path.resolve(__dirname, '..\\..\\resources\\daemon\\' + daemonName + '.exe');
  } else if (os.platform() === 'linux') {
    daemonPath = path.resolve(__dirname, '..//..//resources//daemon//' + daemonName);
  } else {
    daemonPath = path.resolve(__dirname, '..//..//resources//daemon//' + daemonName);
  }

  const spawnArgs = args.filter(arg => arg.startsWith('-'))
    .join('&').replace(/--/g, '-').split('&');

  console.log('Starting daemon ' + daemonPath);
  console.log(spawnArgs);

  const daemonProcess = spawnDaemon(daemonPath, spawnArgs, {
    detached: true
  });

  daemonProcess.stdout.on('data', (data) => {
    writeLog(`Stratis: ${data}`);
  });
}

function createTray(): void {
  // Put the app in system tray
  let iconPath = 'stratis/icon-16.png';
  if (sidechain) {
    iconPath = 'cirrus/icon-16.png';
  }
  let trayIcon;
  if (serve) {
    trayIcon = nativeImage.createFromPath('./src/assets/images/' + iconPath);
  } else {
    trayIcon = nativeImage.createFromPath(path.resolve(__dirname, '../../resources/src/assets/images/' + iconPath));
  }

  const systemTray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Hide/Show',
      click: function(): void {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    },
    {
      label: 'Exit',
      click: function(): void {
        app.quit();
      }
    }
  ]);
  systemTray.setToolTip(applicationName);
  systemTray.setContextMenu(contextMenu);
  systemTray.on('click', function () {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }

    if (!mainWindow.isFocused()) {
      mainWindow.focus();
    }
  });

  app.on('window-all-closed', function () {
    if (systemTray) {
      systemTray.destroy();
    }
  });
}

function createWindow(): void {
  // Create the browser window.
  const height =  screen.getPrimaryDisplay().bounds.height - 100;
  const width = Math.round(height * 1.1);

  console.log(height);
  console.log(width);
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    frame: true,
    minWidth: 825,
    minHeight: 750,
    title: applicationName,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {});
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve || devtools) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is going to close.
  mainWindow.on('close', () => {
    if (!serve && !nodaemon) {
      shutdownDaemon(daemonIP, apiPort);
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Remove menu, new from Electron 5
  mainWindow.removeMenu();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (serve) {
    console.log('Stratis UI was started in development mode. This requires the user to be running the Stratis Full Node Daemon himself.');
  } else {
    if (!nodaemon) {
      startDaemon();
    }
  }
  createTray();
  createWindow();
  if (os.platform() === 'darwin') {
    createMenu();
  }
});

/* 'before-quit' is emitted when Electron receives
 * the signal to exit and wants to start closing windows */
app.on('before-quit', () => {
  if (!serve && !nodaemon) {
    shutdownDaemon(daemonIP, apiPort);
  }
});

app.on('quit', () => {
  if (!serve && !nodaemon) {
    shutdownDaemon(daemonIP, apiPort);
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
