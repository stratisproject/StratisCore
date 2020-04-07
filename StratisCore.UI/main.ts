import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, Tray } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
import { StartupStatus } from './global-vars';
import { DockerHelper } from './docker-helper';

if (os.arch() === 'arm') {
  app.disableHardwareAcceleration();
}

const range = (x, y) => Array.from((function* () {
  while (x <= y) {
    yield x++;
  }
})());

// Set to true if you want to build Core for sidechains
const buildForSidechain = true;
const edge = false;
const daemonName = buildForSidechain ? 'Stratis.CirrusD' : 'Stratis.StratisD';

let serve;
let testnet;
let sidechain;
let nodaemon;
let devtools;

const args = process.argv.slice(1);

args.push('--enableSignalR');

console.log(args);

serve = args.some(val => val === '--serve' || val === '-serve');
testnet = args.some(val => val === '--testnet' || val === '-testnet');
sidechain = args.some(val => val === '--sidechain' || val === '-sidechain');
nodaemon = args.some(val => val === '--nodaemon' || val === '-nodaemon');
devtools = args.some(val => val === '--devtools' || val === '-devtools');

if (buildForSidechain) {
  sidechain = true;
}

global.global[`applicationName`] = sidechain ? `Cirrus Core Developer Edition ${edge ? '(Edge)' : '(Standard)'}` : 'Stratis Core';

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

const portDefault = 16179;
// Sets default arguments
const coreargs = require('minimist')(args, {
  default: {
    daemonip: 'localhost',
    apiport: apiPortDefault,
    port: portDefault,
    signalrport: 38823,
    rpcServer: 1,
    rpcallowip: '0.0.0.0/0',
    rpcport: 16175,
    rpcuser: 'stratis',
    rpcpassword: 'stratis',

    datadir: app.getPath('appData') + '\\Cirrus Hackathon',
    bootstrap: 1,
    txindex: 1,
    defaultwalletname: 'Hackathon',
    defaultwalletpassword: 'stratis',
    unlockwallet: 1,
    addnode: 'auto'
  },
});

// Apply arguments to override default daemon IP and port
const daemonIP = coreargs.daemonip;
let apiPort = coreargs.apiport;
let signalRPort = coreargs.signalrport;

// Prevents daemon from starting if connecting to remote daemon.
if (daemonIP !== 'localhost') {
  nodaemon = true;
}

ipcMain.on('get-port', (event, arg) => {
  event.returnValue = apiPort;
});

ipcMain.on('get-testnet', (event, arg) => {
  event.returnValue = testnet;
});

ipcMain.on('get-sidechain', (event, arg) => {
  event.returnValue = sidechain;
});

ipcMain.on('get-daemonip', (event, arg) => {
  event.returnValue = daemonIP;
});

ipcMain.on('get-signalr-port', (event, arg) => {
  event.returnValue = signalRPort;
});


require('electron-context-menu')({
  showInspectElement: serve
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
console.log('Creating Window');

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 650,
    frame: true,
    minWidth: 1150,
    minHeight: 650,
    title: global[`applicationName`],
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
    shutdownDaemon(daemonIP, apiPort);
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
      findPortAndStartDaemon();
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
  shutdownDaemon(daemonIP, apiPort);
});

app.on('quit', () => {
  shutdownDaemon(daemonIP, apiPort);
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


function shutdownDaemon(daemonAddr, portNumber) {
  if (serve || nodaemon) {
    return;
  }

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
  request.on('error', function (e) {
  });
  request.on('timeout', function (e) {
    request.abort();
  });
  request.on('uncaughtException', function (e) {
    request.abort();
  });

  request.end(body);
}

function findPortAndStartDaemon() {
  const getPort = require('get-port');
  const portRange = range(coreargs.apiport, coreargs.apiport + 10);
  getPort({port: portRange, host: '127.0.0.1'}).then(port => {
    const portIncrement = (port - coreargs.apiport);
    const instance = (portIncrement + 1);
    const apiport = port;
    const signalrport = coreargs.signalrport + portIncrement;
    const rpcport = coreargs.rpcport + portIncrement;

    console.log(`Found port ${apiport} starting instance ${instance}`);
    signalRPort = signalrport;
    apiPort = apiport;
    startDaemon(instance, rpcport, signalrport, apiport, edge);
  });
}

function startDaemon(instance: number, rpcport: number, signalrport: number, apiport: number, isEdge: boolean) {
  if (isEdge && instance > 1) {
    const errorMessage = 'Only a single instance of DLT is allowed to run at once.';
    console.log(errorMessage);
    const messageBoxOptions = {
      type: 'error',
      title: 'Unable to start node',
      message: errorMessage
    };
    dialog.showMessageBox(messageBoxOptions);
    throw new Error(errorMessage);
  }
  console.log(process.env.PATH);
  // Wait 1 second for the UI to load so we have feedback for the user
  setTimeout(() => {
    mainWindow.webContents.send('DockerInfo', 'Detecting Docker');
    const dockerHelper = new DockerHelper(os.platform() === 'win32');

    dockerHelper.detectDocker().then(() => {
      mainWindow.webContents.send('DockerInfo', ['Downloading docker image', StartupStatus.Downloading]);
      return dockerHelper.downloadImage('stratisgroupltd/blockchaincovid19');
    }).then((hasImage) => {
      if (hasImage) {
        mainWindow.webContents.send('DockerInfo', ['Starting node', StartupStatus.Starting]);
        return dockerHelper.runNodeInstance(instance, rpcport, signalrport, apiport, isEdge,
          (output) => writeLog(output)
        );
      }
    }).then(() => {
      mainWindow.webContents.send('DockerInfo', 'Node started', StartupStatus.Started);
    }).catch(e => {
      mainWindow.webContents.send('DockerError', [`${e.message}\nPATH=${process.env.PATH}`, StartupStatus.Error]);
    });
  }, 3000);
}


function createTray() {
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
      click: function () {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    },
    {
      label: 'Exit',
      click: function () {
        app.quit();
      }
    }
  ]);
  systemTray.setToolTip(global[`applicationName`]);
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

function writeLog(msg) {
  console.log(msg);
}

function createMenu() {
  const menuTemplate = [{
    label: app.getName(),
    submenu: [
      {label: 'About ' + app.getName(), selector: 'orderFrontStandardAboutPanel:'},
      {
        label: 'Quit', accelerator: 'Command+Q', click: function () {
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
  }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}


