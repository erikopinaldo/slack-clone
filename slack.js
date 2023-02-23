require('dotenv').config()

const express = require('express');
const socketio = require('socket.io');
const models = require('./models');
const namespaces = require("./data/namespaces");
const debug = require('debug')('chat')

const app = express();
const mongoose = require('mongoose');
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mainRoutes = require("./routes/main");
const roomsRoutes = require("./routes/rooms");
const connectDB = require('./config/database');

// Passport config
require("./config/passport")(passport);

connectDB();

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);

// any time we listen to events with io, we are listening for events coming from all clients
const io = socketio(expressServer)

// Setup Sessions - stored in MongoDB
app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION_STRING }),
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/rooms", roomsRoutes);

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

        if (!username) {
            username = "Anonymous"
        }

        console.log(username)

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
                user: username,
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

            try {
                console.log(fullMsg)
                console.log('user: ' + fullMsg.user)
                models.Messages.create(
                    {
                        text: msg.text,
                        time: Date.now(),
                        user: fullMsg.user,
                        room: roomTitle,
                    })
                    .then(console.log('Message has been added!'))
            } catch (err) {
                console.log(err)
            }

            // const newMessage = new models.Messages()

            // newMessage.user = username
            // newMessage.text = msg.text
            // newMessage.room = roomTitle

            // console.log(newMessage)

            // newMessage
            //     .save()
            //     .then(() =>
            //         debug(
            //             `${username} sent message ${msg.text
            //             } to channel ${roomTitle}`
            //         )
            //     )
            //     .then(null, error => debug(`error sending message: ${error}`))
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