const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const { spawn } = require('child_process')

let ytdlPath = path.join(__dirname, './bin/ytdl')
if (process.platform === 'win32') {
  ytdlPath += '.exe'
}

// enable copy and paste
const template = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close' }]
  }
]

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'youtube-dl.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const formatMsg = msgs => {
  // time="2017-06-18T12:07:27+10:00" level=info msg="Fetching video info..."
  const [time, level, ...msg] = msgs.split(' ')
  const levelInfo = level.split('=')[1]
  const msgInfo = msg.join(' ').split('=')[1].split('"')[1]
  return `[${levelInfo}]: ${msgInfo}`
}

ipcMain.on('start-download', (event, arg) => {
  const desktopPath = app.getPath('desktop')
  const dl = spawn(ytdlPath, [
    '--no-progress',
    '-o',
    `${desktopPath}/{{.Title}}.{{.Ext}}`,
    arg
  ])

  console.log('[electron youtube-dl] Starting download...')
  event.sender.send(
    'download-status',
    '[electron youtube-dl] Starting download...'
  )
  dl.stdout.on('data', data => {
    console.log(`stdout: ${data}`)
    event.sender.send('download-status', formatMsg(data.toString()))
  })

  dl.stderr.on('data', data => {
    console.log(`stderr: ${data}`)
  })

  dl.on('close', code => {
    // event.sender.send('download-success')
    console.log(`child process exited with code ${code}`)
    event.sender.send(
      'download-status',
      '[electron youtube-dl] Finished download'
    )
  })
})
