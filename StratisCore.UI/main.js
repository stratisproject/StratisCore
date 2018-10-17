"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var os = require("os");
var serve;
var testnet;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === "--serve" || val === "-serve"; });
testnet = args.some(function (val) { return val === "--testnet" || val === "-testnet"; });
var apiPort;
if (testnet) {
    apiPort = 38221;
}
else {
    apiPort = 37221;
}
electron_1.ipcMain.on('get-port', function (event, arg) {
    event.returnValue = apiPort;
});
try {
    require('dotenv').config();
}
catch (_a) {
    console.log('asar');
}
require('electron-context-menu')({
    showInspectElement: serve
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 1150,
        height: 650,
        frame: true,
        minWidth: 1150,
        minHeight: 650,
        title: "Stratis Core"
    });
    if (serve) {
        require('electron-reload')(__dirname, {});
        mainWindow.loadURL('http://localhost:4200');
    }
    else {
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
    mainWindow.on('close', function () {
    });
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', function () {
    if (serve) {
        console.log("Stratis UI was started in development mode. This requires the user to be running the Stratis Full Node Daemon himself.");
    }
    else {
        startStratisApi();
    }
    createTray();
    createWindow();
    if (os.platform() === 'darwin') {
        createMenu();
    }
});
electron_1.app.on('before-quit', function () {
    closeStratisApi();
});
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
function closeStratisApi() {
    // if (process.platform !== 'darwin' && !serve) {
    if (process.platform !== 'darwin' && !serve && !testnet) {
        var http2 = require('http');
        var options1 = {
            hostname: 'localhost',
            port: 37221,
            path: '/api/node/shutdown',
            method: 'POST'
        };
        var req = http2.request(options1, function (res) { });
        req.write('');
        req.end();
    }
    else if (process.platform !== 'darwin' && !serve && testnet) {
        var http2 = require('http');
        var options2 = {
            hostname: 'localhost',
            port: 38221,
            path: '/api/node/shutdown',
            method: 'POST'
        };
        var req = http2.request(options2, function (res) { });
        req.write('');
        req.end();
    }
}
;
function startStratisApi() {
    var stratisProcess;
    var spawnStratis = require('child_process').spawn;
    //Start Stratis Daemon
    var apiPath = path.resolve(__dirname, 'assets//daemon//Stratis.StratisD');
    if (os.platform() === 'win32') {
        apiPath = path.resolve(__dirname, '..\\..\\resources\\daemon\\Stratis.StratisD.exe');
    }
    else if (os.platform() === 'linux') {
        apiPath = path.resolve(__dirname, '..//..//resources//daemon//Stratis.StratisD');
    }
    else {
        apiPath = path.resolve(__dirname, '..//..//resources//daemon//Stratis.StratisD');
    }
    if (!testnet) {
        stratisProcess = spawnStratis(apiPath, {
            detached: true
        });
    }
    else if (testnet) {
        stratisProcess = spawnStratis(apiPath, ['-testnet'], {
            detached: true
        });
    }
    stratisProcess.stdout.on('data', function (data) {
        writeLog("Stratis: " + data);
    });
}
function createTray() {
    //Put the app in system tray
    var trayIcon;
    if (serve) {
        trayIcon = electron_1.nativeImage.createFromPath('./src/assets/images/icon-tray.png');
    }
    else {
        trayIcon = electron_1.nativeImage.createFromPath(path.resolve(__dirname, '../../resources/src/assets/images/icon-tray.png'));
    }
    var systemTray = new electron_1.Tray(trayIcon);
    var contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Hide/Show',
            click: function () {
                mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            }
        },
        {
            label: 'Exit',
            click: function () {
                electron_1.app.quit();
            }
        }
    ]);
    systemTray.setToolTip('Stratis Core');
    systemTray.setContextMenu(contextMenu);
    systemTray.on('click', function () {
        if (!mainWindow.isVisible()) {
            mainWindow.show();
        }
        if (!mainWindow.isFocused()) {
            mainWindow.focus();
        }
    });
    electron_1.app.on('window-all-closed', function () {
        if (systemTray)
            systemTray.destroy();
    });
}
;
function writeLog(msg) {
    console.log(msg);
}
;
function createMenu() {
    var menuTemplate = [{
            label: electron_1.app.getName(),
            submenu: [
                { label: "About " + electron_1.app.getName(), selector: "orderFrontStandardAboutPanel:" },
                { label: "Quit", accelerator: "Command+Q", click: function () { electron_1.app.quit(); } }
            ]
        }, {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]
        }
    ];
    electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(menuTemplate));
}
;
