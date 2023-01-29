require('dotenv').config()

const express = require('express');
const socketio = require('socket.io');
const namespaces = require("./data/namespaces")

const app = express();
const models = require('./models')
const mongoose = require('mongoose');
const connectDB = require('./config/database');

connectDB();

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);

// any time we listen to events with io, we are listening for events coming from all clients
const io = socketio(expressServer)

// note that io.on === io.of('/').on ;)
io.on('connection', (socket) => {

    // build an array of namespaces with img and endpoint to send back
    // with this namespace map, every connection gets the same list of namespaces 
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

        // username is added to the fullMsg object
        let username = socket.handshake.query.username;

        socket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {

            const roomToLeave = [...socket.rooms][1]
            
            // leave old room
            socket.leave(roomToLeave)
            // updateUsersInRoom(namespace, roomToLeave)

            // join the socket to the new room
            socket.join(roomToJoin)
            // updateUsersInRoom(namespace, roomToJoin)

            // grab the room
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin;
            })
            // send out the room history
            socket.emit("historyCatchUp", nsRoom.history)
        })

        socket.on('newMessageToServer', (msg) => {
            // the user will be in the 2nd room in the object list this is because
            // the socket always joins it's own room on connection
            const roomTitle = [...socket.rooms][1]; //get the keys
            
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: username,
                room: roomTitle,
                avatar: 'https://via.placeholder.com/30'
            }
            
            // find the room object for this room
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle;
            })
            
            nsRoom.addMessage(fullMsg)

            // Send this message to All the sockets that are in the room
            // that this socket is in
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg)
        })
    })
})

// This is outdated now -- find another way to emit user counts to all clients
// function updateUsersInRoom(namespace, roomToJoin) {
//     // send back the number of users in this room to ALL sockets connected to this room
//     io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
//         io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length)
//     })
// }