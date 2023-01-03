const express = require('express');
const socketio = require('socket.io');
const namespaces = require("./data/namespaces")

const app = express();

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer)

// note that io.on === io.of('/').on ;)
io.on('connection', (socket) => {

    // build an array of namespaces with img and endpoint to send back
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })
    // We need to use socket, not IO this is
    // because we want it to go to just this client
    socket.emit('nsList', nsData) // send nsData back to the client  
})

// loop through each ns and listen for a connection
namespaces.forEach((namespace) => {
    io.of(namespace.endpoint).on('connection', socket => {

        socket.emit('nsRoomLoad', namespace.rooms)
        let username = socket.handshake.query.username;
    })
})