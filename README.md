footer: @fraserxu
slidenumbers: true

# [fit] Mad Science With Electron

---

# About me

![inline 50%](https://avatars1.githubusercontent.com/u/1183541?v=4&s=460)

@fraserxu
JavaScript Developer @Envato

---

# What is Electron?

> Build cross platform desktop apps with JavaScript, HTML, and CSS
-- https://electron.atom.io/

---

# Apps Build With Electron

* Slack
* Atom
* Visual Studio Code
* WebTorrent
* Hyper

---

# Concept

![inline 50%](./imgs/components.png)

---

![inline](./imgs/like-this.png)

---

## Main Process

> In Electron, the process that runs `package.json`’s main script is called the `main process`. The script that runs in the main process can display a GUI by creating web pages.

* Create renderer process
* Call native elements
* Start and quite app

---

## Renderer Process

> Since Electron uses Chromium for displaying web pages, Chromium’s multi-process architecture is also used. Each web page in Electron runs in its own process, which is called the `renderer process`.

* Design your page with HTML & CSS
* JavaScript page interactions

---

## Application structure


```
mad-science-with-electron-campjs/
├── package.json
├── main.js
└── index.html
```

---

#### An example of your package.json might look like this:

```JSON
{
  "name": "mad-science-with-electron-campjs",
  "version": "0.1.0",
  "main": "main.js"
}
```

---

## Import depedencies

```javascript
const { app, BrowserWindow } = require('electron')
```

---

### Create Window when Application ready

```javascript
const { app, BrowserWindow } = require('electron')

let win

app.on('ready', () => {
  createWindow()
})

```

---

## Open Window

```javascript
let win

function createWindow () {
  win = new BrowserWindow({ width: 800, height: 600 })

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )
}
```

---

## Create UI

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hello CampJS!</title>
</head>
<body>
  <h1>Hello CampJS!</h1>
</body>
</html>
```

---

# Demo

---

# [fit] Let's build something useful

---

![inline](./imgs/ytdl.png)

---

# UI

```HTML
<main>
  <input id="input" type="text" autofocus placeholder="Paste youtube url here" />
  <button id="download">Download</button>
  <div id="status">
    <div>
</main>
```

---

## Hook up with click event

```js
const downloadButton = document.getElementById('download')
const urlInput = document.getElementById('input')

downloadButton.addEventListener('click', startDownload)
const startDownload = () => {
  const youtubeUrl = urlInput.value
  if (!youtubeUrl) return
  console.log(`downloading from ${youtubeUrl}`)
}
```

---

## [fit] How do we download videos from Youtube? 🤔

---

> youtube-dl is a command-line program to download videos from YouTube.com and a few more sites. It requires the Python interpreter (2.6, 2.7, or 3.2+), and it is not platform specific.

[youtube-dl](https://rg3.github.io/youtube-dl/)

---

## Spawn Child Process with Node.js

```js
const { spawn } = require('child_process')
const ls = spawn('ls', ['-lh', '/usr'])

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})
```

---

# [fit] But `youtube-dl` is not cross platform 😕

---

## Golang

```go
package main

import "fmt"

func main() {
  fmt.Printf("Hello\n")
}
```

---

### Compile

```
go build main.go
```

### Cross Compile

```
$ GOOS=windows GOARCH=386 go build -o hello.exe hello.go
```

---

# [fit] What if there's a Golang alternative for youtube-dl?

---


## Download a youtube video with ytdl

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

---

```js
let ytdlPath = path.join(__dirname, './bin/ytdl')
if (process.platform === 'win32') {
  ytdlPath += '.exe'
}
```

---


### [fit] Communication between two processes

---

![inline](./imgs/ipc.png)

---

## Main process

```js
const ipc = require('electron').ipcMain

ipc.on('asynchronous-message', function (event, arg) {
  event.sender.send('asynchronous-reply', 'pong')
})
```

---

## Renderer process

```js
const ipc = require('electron').ipcRenderer

ipc.on('asynchronous-reply', function (event, arg) {
  const message = `Asynchronous message reply: ${arg}`
  console.log('Reply message', message)
})
```

---

### Hook `ytdl` messages with `stdout` and `stderr`

---

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

  dl.stdout.on('data', data => {
    event.sender.send('download-status', formatMsg(data.toString()))
  })

  dl.stderr.on('data', data => {
    console.log(`stderr: ${data}`)
  })

  dl.on('close', code => {
    event.sender.send(
      'download-status',
      '[electron youtube-dl] Finished download'
    )
  })
})
```

---

Renderer process

```js
const ipc = require('electron').ipcRenderer

ipc.on('download-status', (event, arg) => {
  console.log('Download status:', arg)
})
```

---

Show message in the UI

```js
ipc.on('download-status', (event, arg) => {
  const msgElement = document.createElement('span')
  msgElement.innerText = arg
  const brElement = document.createElement('br')
  statusBar.prepend(brElement)
  statusBar.prepend(msgElement)
})
```

---

## Demo

---

## No Demo :(

---

![inline](campjs.mp4)

---

## [fit] Writting Command line tools with Electron

---

```sh
$ electron --help
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

---

### Parse command line argument options

```js
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
console.log({ argv })
```

```sh
$ node ./bin/cmd.js --input=https://fraserxu.me --output=fraserxu.pdf
$ { argv: { _: [], input: 'https://fraserxu.me', output: 'fraserxu.pdf' } }
```

---

### Prepare boilerplate to launch electron from CLI

```js
#!/usr/bin/env node

const spawn = require('child_process').spawn
const electronPath = require('electron')
const path = require('path')

const generatorPath = path.resolve(__dirname, '../pdf.js')

let args = process.argv.slice(2)
args.unshift(generatorPath)

const cp = spawn(electronPath, args, {
  //       stdin,     stdout,    stderr
  stdio: ['inherit', 'inherit', 'pipe', 'ipc']
})

```

---

### And then we can creat our pdf generator

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

app.on('ready', createWindow)

```

---

```js
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
```

---

# Demo

---

## Result

```
$ node ./bin/cmd.js --input=http://viii.campjs.com/ --output=viii.campjs.com.pdf
success write file to  /Users/fraserxu/Desktop/viii.campjs.com.pdf
```

---

## electron-pdf

> A command line tool to generate PDF from URL, HTML or Markdown files.
-- https://github.com/fraserxu/electron-pdf

---

# [fit] "Abusing" the Browser API and Create Mad Science

---

# 🎩

* Access to file system
* getUserMedia
* WebRTC
* WebRTC data channels

---

## getUserMedia()

```js
const getMedia = require('getusermedia')
const recorder = require('media-recorder-stream')

getMedia(mediaConstraints, (err, media) => {
  if (err) throw err

  // record media every 5s
  let stream = recorder(media, {interval: 5000})

  stream.on('data', data => {
    // figure out a way to distribute it 🤔
  })
})
```

---

## [fit] 1. With WebTorrent

---

```js
const WebTorrent = require('webtorrent')

const client = new WebTorrent()

client.seed(buffer, torrent => {
  console.log('Client is seeding: ', torrent.magnetURI)
})
```

---

### Distribute the torrent information through WebSocket

```js
const socket = io()
const torrentsSocket = io('/torrents')

client.seed(buffer, torrent => {
  // send torrent to the socket channel
  io.emit('torrent', torrent)
})
```

---

## Download torrent and play

```js
const WebTorrent = require('webtorrent')
const socket = io()
const torrentsSocket = io('/torrents')

torrentsSocket.on('torrent', (id, torrent) => {
  // download torrent
  const client = new WebTorrent()

  client.add(torrentmagnetURI)

  client.on('download', function (bytes) {
    // play video bytes
  })
})
```

---

## See it in action

> Scalable peer-to-peer live video streaming
-- https://nilejs.com

---

## [fit] 2. With Dat

---

# Hypercore

> Hypercore is a secure, distributed append-only log.

---

```js
const hypercore = require('hypercore')

let feed = hypercore(`./streams/broadcasted/${ Date.now ()}`)

stream.on('data', data => {
  // figure out a way to distribute it 🤔
  feed.append(data)
})
```

---

# Hyperdiscovery

> Join the p2p swarm for hypercore and hyperdrive feeds. Uses discovery-swarm under the hood.

---

```js
const hyperdiscovery = require('hyperdiscovery')

let feed = hypercore(`./streams/broadcasted/${ Date.now ()}`)
let swarm

// when feed is ready, join p2p swarm
feed.on('ready', function () {
  swarm = hyperdiscovery(feed, {live: true})
})

```

---

# Viewer

```js
const hypercore = require('hypercore')
const hyperdiscovery = require('hyperdiscovery')

// create local feed
let feed = hypercore(
  localKey,        // the directory to store local data
  hash,            // the hash to the feed
  { sparse: true } // mark the entire feed to be downloaded
)

let swarm
feed.on('ready', () => {
  // start to sync data!
  swarm = hyperdiscovery(feed, {live: true})
})
```

---

# Play it

```js
// play with vlc
const args = [
  '--play-and-exit',
  '--video-on-top',
  '--quiet',
  '--meta-title=campjs',
  dataPath
]
vlcCommand((err, cmd) => {
  cp.spawn(cmd, args)
})
```

---

## hypervision

> hypervision is a desktop application that lets you both watch and broadcast p2p live streams.
-- https://github.com/mafintosh/hypervision

---

### Running Headless JavaScript Test

```js
process.stdin
  .pipe(runner)
  .on('results', results {
    process.exit(Number(!results.ok))
  })
```

---

### Links

* [Running Headless JavaScript Testing with Electron On Any CI Server](https://webuild.envato.com/blog/running-headless-javascript-testing-with-electron-on-any-ci-server/)
* [tape-run](https://github.com/juliangruber/tape-run)
* [electron-mocha](https://github.com/jprichardson/electron-mocha)

---

## electron-speech

> Speech recognition in node and the browser using Electron.
-- https://github.com/noffle/electron-speech

```js
if ('webkitSpeechRecognition' in window) {
  var recognition = new webkitSpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onstart = function() { /* */ }
  recognition.onresult = function(event) { /* */ }
  recognition.onerror = function(event) { /* */ }
  recognition.onend = function() { /* */ }
}
```

---

# Links

* https://electron.atom.io/docs/tutorial/quick-start/
* https://github.com/electron/electron-api-demos
* http://jlord.us/essential-electron/ [^1]

[^1]: All the nice diagrams in this slides are from Jlord

---

![inline](./imgs/twitter.png)

---

# [fit] Thanks
