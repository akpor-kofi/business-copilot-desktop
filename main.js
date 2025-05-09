const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const nodeUrl = require("node:url");
require('update-electron-app')()

const isDevelopment = process.env.NODE_ENV === "dev";

// see https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6;
const { app, BrowserWindow, ipcMain } = electron;
const fsStat = promisify(fs.stat);
const scheme = "business-copilot";
const root = "app";

const serve = (rootDirectoryPath) => {
  electron.protocol.registerSchemesAsPrivileged([
    {
      scheme,
      privileges: {
        standard: true,
        secure: true,
        allowServiceWorkers: true,
        supportFetchAPI: true,
        corsEnabled: true,
        bypassCSP: true
      },
    },
  ]);

  const absoluteDirectoryPath = path.resolve(
    electron.app.getAppPath(),
    rootDirectoryPath
  );

  electron.app.on("ready", () => {
    electron.session.defaultSession.protocol.handle(scheme, async (request) => {
      const indexPath = path.join(absoluteDirectoryPath, "index.html");
      const reqURL = new URL(request.url);
      const filePath = path.join(absoluteDirectoryPath, decodeURIComponent(reqURL.pathname));

      try {
        const fileStat = await fsStat(filePath);
        const fileExtension = path.extname(filePath);

        if (fileStat.isFile()) {
          return electron.net.fetch(nodeUrl.pathToFileURL(filePath).toString());
        } else if (!fileExtension) {
          return electron.net.fetch(nodeUrl.pathToFileURL(indexPath).toString());
        }
      } catch (error) {
        return new Response(null, { status: 404 });
      }
    });
  });
};

if (!isDevelopment) {
  serve(path.join("dist"));
}

// handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = async () => {
  // Clear all cookies and storage data at startup
//   await electron.session.defaultSession.clearStorageData({
//     storages: ['cookies', 'localstorage', 'caches'],
//     quotas: ['temporary', 'persistent', 'syncable']
//   });
  
  // create the browser window
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // Enable node integration if needed
      nodeIntegration: true,
    },
  });

  // take up the full screen
  mainWindow.maximize();
  mainWindow.show();

  mainWindow.webContents.inspectSharedWorker();

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:8081`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`${scheme}://${root}`);
    mainWindow.webContents.openDevTools();
  }
};

// this method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs
app.on("ready", () => {
    createWindow();
});

// quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});