const { app, BrowserWindow } = require("electron");
const path = require("path");
require("dotenv").config();

function createWindow() {
  const win = new BrowserWindow({ show: false });
  win.maximize();
  win.show();

  // Pass environment variables to the renderer process
  win.webContents.executeJavaScript(`
    window.process = {
      env: ${JSON.stringify(process.env)}
    }
  `);

  if (process.env.NODE_ENV === "development") {
    const frontendUrl =
      process.env.DESKTOP_FRONTEND_URL || "http://localhost:5174/";
    win.loadURL(frontendUrl);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          `img src \'self\' ${process.env.VITE_DESKTOP_APP_LOGO_URL}`,
        ],
      },
    });
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
