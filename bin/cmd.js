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
