### Mad Science With Electron
[@fraserxu](https://twitter.com/fraserxu)

#### What is Electron?

> Build cross platform desktop apps with JavaScript, HTML, and CSS

https://electron.atom.io/

#### Quick Start

* https://electron.atom.io/docs/tutorial/quick-start/
* https://github.com/electron/electron-api-demos

#### Apps Build on Electron

* Slack
* Atom
* Visual Studio Code
* WebTorrent
* Hyper

#### Features

##### Main Process

> In Electron, the process that runs package.json’s main script is called the main process. The script that runs in the main process can display a GUI by creating web pages.

#### Renderer Process

> Since Electron uses Chromium for displaying web pages, Chromium’s multi-process architecture is also used. Each web page in Electron runs in its own process, which is called the renderer process.

Generally, an Electron app is structured like this:

```
your-app/
├── package.json
├── main.js
└── index.html
```

An example of your package.json might look like this:

```JSON
{
  "name"    : "your-app",
  "version" : "0.1.0",
  "main"    : "main.js"
}
```

#### Create UI

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hello World!</title>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>
```

#### Start main process

```js
const { app, BrowserWindow } = require('electron')

let win

app.on('ready', () => {
  createWindow()
})

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 })

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  // win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
}
```

#### Spawn Child Process with Nodje.js

https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process

```js
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

#### Golang Cross Compiling

https://github.com/golang/go/wiki/WindowsCrossCompiling

```go
$ cat hello.go
package main

import "fmt"

func main() {
        fmt.Printf("Hello\n")
}
$ GOOS=windows GOARCH=386 go build -o hello.exe hello.go
```

Download a youtube video with [ytdl](https://github.com/rylio/ytdl
)

```js
const { spawn } = require('child_process')

let ytdlPath = path.join(__dirname, './bin/ytdl')
if (process.platform === 'win32') {
  ytdlPath += '.exe'
}

const desktopPath = app.getPath('desktop')
const dl = spawn(ytdlPath, [
  '--no-progress',
  '-o',
  `${desktopPath}/{{.Title}}.{{.Ext}}`,
  arg
])
```

#### Communication between two processes

Main process

```js
const ipc = require('electron').ipcMain

ipc.on('asynchronous-message', function (event, arg) {
  event.sender.send('asynchronous-reply', 'pong')
})
```

Renderer process

```js
const ipc = require('electron').ipcRenderer

const asyncMsgBtn = document.getElementById('async-msg')

asyncMsgBtn.addEventListener('click', function () {
  ipc.send('asynchronous-message', 'ping')
})

ipc.on('asynchronous-reply', function (event, arg) {
  const message = `Asynchronous message reply: ${arg}`
  document.getElementById('async-reply').innerHTML = message
})
```

#### Hook `ytdl` messages with `stdout` and `stderr`

Main process

```js
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
```

Renderer process

```js
const ipc = require('electron').ipcRenderer

const downloadButton = document.getElementById('download')
const urlInput = document.getElementById('input')
const statusBar = document.getElementById('status')
const startDownload = () => {
  const youtubeUrl = urlInput.value
  if (!youtubeUrl) return
  ipc.send('start-download', youtubeUrl)
}

downloadButton.addEventListener('click', startDownload)
urlInput.onkeypress = event => {
  if (event.keyCode === 13) {
    startDownload()
  }
}

ipc.on('download-status', (event, arg) => {
  const msgElement = document.createElement('span')
  msgElement.innerText = arg
  const brElement = document.createElement('br')
  statusBar.prepend(brElement)
  statusBar.prepend(msgElement)
})
```

#### Keyboard support

```js
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

// make sure it runs on app `ready`
app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  createWindow()
})
```
