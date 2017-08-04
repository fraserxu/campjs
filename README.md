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

#### Writting Command line tools with Electron

Electron CLI

```sh
electron --help
Electron 1.6.11 - Build cross platform desktop apps with JavaScript, HTML, and CSS

  Usage: electron [options] [path]

  A path to an Electron app may be specified. The path must be one of the following:

    - index.js file.
    - Folder containing a package.json file.
    - Folder containing an index.js file.
    - .html/.htm file.
    - http://, https://, or file:// URL.

  Options:
    -h, --help            Print this usage message.
    -i, --interactive     Open a REPL to the main process.
    -r, --require         Module to preload (option can be repeated)
    -v, --version         Print the version.
    --abi                 Print the application binary interface.
```

[parse argument options](https://www.npmjs.com/package/minimist)

```js
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
console.log({ argv })
```

```sh
$ node ./bin/cmd.js --input=https://fraserxu.me --output=fraserxu.pdf
$ { argv: { _: [], input: 'https://fraserxu.me', output: 'fraserxu.pdf' } }
```

Prepare boilerplate to launch electron from CLI

```js
#!/usr/bin/env node

const spawn = require('child_process').spawn
const electronPath = require('electron')
const path = require('path')

const generatorPath = path.resolve(__dirname, '../pdf.js')

let args = process.argv.slice(2)
args.unshift(generatorPath)

// node ./bin/cmd.js --input=https://fraserxu.me --output=fraserxu.pdf
// return electron pdf.js --input=https://fraserxu.me --output=fraserxu.me.pdf

const cp = spawn(electronPath, args, {
  //       stdin,     stdout,    stderr
  stdio: ['inherit', 'inherit', 'pipe', 'ipc']
})

cp.stderr.on('data', data => {
  const str = data.toString('utf8')
  // it's Chromium, don't do anything
  if (str.match(/^\[\d+:\d+/)) return
  process.stderr.write(data)
})
```

And then we can creat our pdf generator

```js
const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const { app, BrowserWindow, shell } = require('electron')

const argv = minimist(process.argv.slice(2))

const {
  input,
  output
} = argv

let win

const createWindow = () => {
  win = new BrowserWindow({
    show: false
  })

  win.loadURL(input)

  // https://electron.atom.io/docs/api/web-contents/
  let contents = win.webContents

  const desktopPath = app.getPath('desktop')
  const pdfPath = path.join(desktopPath, output)
  contents.on('did-finish-load', () => {
    contents.printToPDF({
      printBackground: true
    }, (err, data) => {
      if (err) throw err
      fs.writeFile(pdfPath, data, err => {
        if (err) throw err
        console.log('success write file to ', pdfPath)
        shell.openExternal('file://' + pdfPath)
        process.exit(0)
      })
    })
  })
}

app.on('ready', createWindow)
```

Result

```shell
$ node ./bin/cmd.js --input=http://viii.campjs.com/ --output=viii.campjs.com.pdf
success write file to  /Users/fraserxu/Desktop/viii.campjs.com.pdf
```

#### Running Headless JavaScript Testing with Electron On Any CI Server

```js
process.stdin
  .pipe(runner)
  .on('results', results {
    process.exit(Number(!results.ok))
  })
```

* [Running Headless JavaScript Testing with Electron On Any CI Server](https://webuild.envato.com/blog/running-headless-javascript-testing-with-electron-on-any-ci-server/)
* [tape-run](https://github.com/juliangruber/tape-run)
* [electron-mocha](https://github.com/jprichardson/electron-mocha)

#### "Abusing" the Browser API and Create Mad Science
