const hypercore = require('hypercore')
const hyperdiscovery = require('hyperdiscovery')
const cp = require('child_process')
const path = require('path')
const vlcCommand = require('vlc-command')
const minimist = require('minimist')
const http = require('http')

// get hash from input
const argv = minimist(process.argv.slice(2))
const hash = argv.hash

// local copy of data
let localKey = `./streams/viewed/${ Date.now ()}`
let dataPath = `${localKey}/data`

// create local feed
let feed = hypercore(
  localKey,
  hash,
  { sparse: true }
)

let swarm
feed.on('ready', () => {
  console.log('ready...')

  // join p2p swarm
  swarm = hyperdiscovery(feed, {live: true})
  swarm.on('connection', (peer, type) => {
    console.log('connected to', swarm.connections.length, 'peers')
  })

  // stream to http
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'video/webm')
    feed.get(0, (err, data) => {
      if (err) return res.end()
      res.write(data)

      let offset = feed.length
      let buf = 4
      while (buf-- && offset > 1) offset--

      var start = offset

      // start downloading data
      feed.download({start: start, linear: true})

      // keep piping new data from feed to response stream
      feed.get(offset, function loop (err, data) {
        if (err) return res.end()
        res.write(data, function () {
          feed.get(++offset, loop)
        })
      })
    })
  })

  server.listen(0, () => {
    let port = server.address().port
    console.log('Server running on ', `http://localhost:${port}`)
  })

  // play with vlc
  // const args = [
  //   '--play-and-exit',
  //   '--video-on-top',
  //   '--quiet',
  //   '--meta-title=campjs',
  //   dataPath
  // ]
  // vlcCommand((err, cmd) => {
  //   cp.spawn(cmd, args)
  // })
})

