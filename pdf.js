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
