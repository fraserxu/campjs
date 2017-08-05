const getMedia = require('getusermedia')
const recorder = require('media-recorder-stream')
// const WebTorrent = require('webtorrent')
const hypercore = require('hypercore')
const hyperdiscovery = require('hyperdiscovery')

// const client = new WebTorrent()

const mediaConstraints = {
  audio: false,
  video: true
}

const streamToWebmBuffer = (chunk, cb) => {
  const blob = new Blob([chunk], {
    type: 'video/webm'
  })
  const reader = new FileReader()

  reader.addEventListener('loadend', () => {
    console.log('loadend....')
    let buffer = new Buffer(reader.result)
    cb(buffer)
  })

  reader.readAsArrayBuffer(blob)
}

getMedia(mediaConstraints, (err, media) => {
  if (err) throw err

  let stream = recorder(media, {interval: 5000})
  let feed = hypercore(`./streams/broadcasted/${ Date.now ()}`)
  let swarm

  feed.on('ready', function () {
    console.log('on ready...')
    var hash = feed.key.toString('hex')
    console.log('hash', hash)

    swarm = hyperdiscovery(feed, {live: true})
    swarm.on('connection', (peer, type) => {
      console.log('connected to', swarm.connections.length, 'peers')
    })
  })

  stream.on('data', data => {
    streamToWebmBuffer(data, buffer => {
      feed.append(buffer)
      // client.seed(buffer, torrent => {
      //   console.log('Client is seeding: ', torrent.magnetURI)
      //   feed.append(buffer)
      // })

      // client.on('error', error => {
      //   console.log('Torrent error: ', error)
      // })
    })
  })

  // lets display the recorded video as well
  let video = document.createElement('video')
  video.src = URL.createObjectURL(stream.media)
  video.autoplay = true
  document.body.appendChild(video)
})
