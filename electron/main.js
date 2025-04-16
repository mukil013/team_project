const { app, BrowserWindow, session } = require('electron');

let isQuitting = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  win.loadURL('http://localhost:5173');
  win.removeMenu();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    isQuitting = true;

    session.defaultSession.clearStorageData({
      storages: ['localstorage', 'sessionstorage']
    }, (error) => {
      if (error) {
        console.error('Failed to clear storage:', error);
      }
      app.quit();
    });
  }
});