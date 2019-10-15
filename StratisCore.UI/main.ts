import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';

if (os.arch() === 'arm') {
  app.disableHardwareAcceleration();
}

// Set to true if you want to build Core for sidechains
const buildForSidechain = true;
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

const applicationName = sidechain ? 'Cirrus Core (Hackathon Edition)' : 'Stratis Core';

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

let portDefault = 16179
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
	addnode: "auto"
  },
});

// Apply arguments to override default daemon IP and port
let daemonIP;
let apiPort;
daemonIP = coreargs.daemonip;
apiPort = coreargs.apiport;

let port
port = coreargs.port;

let signalrport
signalrport = coreargs.signalrport;

let rpcServer
rpcServer = coreargs.rpcServer;

let rpcallowip
rpcallowip = coreargs.rpcallowip;

let rpcport
rpcport = coreargs.rpcport;

let rpcuser
rpcuser = coreargs.rpcuser;

let rpcpassword
rpcpassword = coreargs.rpcpassword;

let datadir
datadir = coreargs.datadir;
let instance = 1

let bootstrap
bootstrap = coreargs.bootstrap;

let txindex
txindex = coreargs.txindex;

let defaultwalletname
defaultwalletname = coreargs.defaultwalletname;

let defaultwalletpassword
defaultwalletpassword = coreargs.defaultwalletpassword;

let unlockwallet
unlockwallet = coreargs.unlockwallet;

let addnode
addnode = coreargs.addnode;


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

function shutdownDaemon(daemonAddr, portNumber) {
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
  var net = require('net');
	
  var portInUse = function(port, callback) {
    var server = net.createServer(function(socket) {
      socket.write('Echo server\r\n');
	  socket.pipe(socket);
    });

    server.listen(port, '0.0.0.0');
    server.on('error', function (e) {
      callback(true);
    });
	
    server.on('listening', function (e) {
	  server.close();
	  callback(false);
    });
  };

  let portFound = false

  portInUse(port, function(returnValue) {
    if (returnValue) {
        console.log("Port " + port + " is in use.");
		apiPort = apiPort + 1;
        port = port + 1;
        signalrport = signalrport + 1;
        rpcport = rpcport + 1;
        instance = instance + 1;
	
		findPortAndStartDaemon();
    } else {
		console.log("Port " + port + " is NOT in use.");
		startDaemon();
	}
  });
}

function startDaemon() { 
  let daemonProcess;
  const spawnDaemon = require('child_process').spawn;

  let daemonPath;
  if (os.platform() === 'win32') {
    daemonPath = path.resolve(__dirname, '..\\..\\resources\\daemon\\' + daemonName + '.exe');
  } else if (os.platform() === 'linux') {
    daemonPath = path.resolve(__dirname, '..//..//resources//daemon//' + daemonName);
  } else {
    daemonPath = path.resolve(__dirname, '..//..//resources//daemon//' + daemonName);
  }

  let spawnArgs = args.filter(arg => arg.startsWith('-'))
    .join('&').replace(/--/g, '-').split('&');

  spawnArgs.push('-apiport=' + apiPort)
  spawnArgs.push('-port=' + port)
  spawnArgs.push('-signalrport=' + signalrport)
  spawnArgs.push('-server=' + rpcServer)
  spawnArgs.push('-rpcallowip=' + rpcallowip)
  spawnArgs.push('-rpcport=' + rpcport)
  spawnArgs.push('-rpcuser=' + rpcuser)
  spawnArgs.push('-rpcpassword=' + rpcpassword)
  spawnArgs.push('-datadir=' + datadir + '_' + instance)
  spawnArgs.push('-txindex=' + txindex)
  spawnArgs.push('-defaultwalletname=' + defaultwalletname + '_' + instance)
  spawnArgs.push('-defaultwalletpassword=' + defaultwalletpassword)
  spawnArgs.push('-unlockwallet=' + unlockwallet)
  
  if (instance == 1) {
	  spawnArgs.push('-bootstrap=' + bootstrap)
	  spawnArgs.push('-defaultwalletmnemonic', 'basic exotic crack drink left judge tourist giggle muscle unique horn body')
	  spawnArgs.push('-poaminingkey', 'basic exotic crack drink left judge tourist giggle muscle unique horn body')
  } else if (addnode == 'auto') {
	  var i
	  for (i = 0; i < instance-1; i++) {
	    spawnArgs.push('-addnode=127.0.0.1:' + (portDefault + i))
	  }
  }
  
  console.log('Starting daemon ' + daemonPath);
  console.log(spawnArgs);

  daemonProcess = spawnDaemon(daemonPath, spawnArgs, {
    detached: true
  });
  
  daemonProcess.stdout.on('data', (data) => {
    writeLog(`Stratis: ${data}`);
  });
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
