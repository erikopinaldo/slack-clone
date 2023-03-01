require('dotenv').config()

const express = require('express');
const socketio = require('socket.io');
const models = require('./models');
const User = require('./models/Users');
const namespaces = require("./data/namespaces");
const debug = require('debug')('chat')

const app = express();
const mongoose = require('mongoose');
const flash = require("express-flash");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mainRoutes = require("./routes/main");
const roomsRoutes = require("./routes/rooms");
const connectDB = require('./config/database');

// Passport config
require("./config/passport")(passport);

connectDB();

//Using EJS for views
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const expressServer = app.listen(9000);

// any time we listen to events with io, we are listening for events coming from all clients
const io = socketio(expressServer)

const sessionMiddleware = session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION_STRING }),
})

// Setup Sessions - stored in MongoDB
app.use(sessionMiddleware);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

// note that io.on === io.of('/').on ;)
io.on('connection', (socket) => {

    console.log(socket.request.session)

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
    io.of(namespace.endpoint).on('connection', async socket => {

        socket.emit('nsRoomLoad', namespace.rooms)

        let user = await User.findById(socket.request.session.passport.user).select('userName');
        let username = user.userName;

        socket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {

            console.log('joining room ' + roomToJoin)

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
                user: username[0].userName,
                room: roomTitle,
                avatar: 'https://via.placeholder.com/30'
            }

            console.log(fullMsg)
            
            // find the room object for this room
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle;
            })
            
            // Add message to room history
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

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
// app.use("/rooms", roomsRoutes);