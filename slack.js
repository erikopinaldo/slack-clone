require('dotenv').config()

const express = require('express');
const socketio = require('socket.io');
const models = require('./models');
const User = require('./models/Users');
const debug = require('debug')('chat')

const app = express();
const mongoose = require('mongoose');
const { handleChatConnection } = require('./socket');
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

//Use flash messages for errors, info, ect...
app.use(flash());

const expressServer = app.listen(process.env.PORT || 8080);

// any time we listen to events with io, we are listening for events coming from all clients
const io = socketio(expressServer);

const sessionMiddleware = session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION_STRING }),
});

// Setup Sessions - stored in MongoDB
app.use(sessionMiddleware);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Share io instance throughout app files
app.use(function (req, res, next) {
    req.io = io;
    next();
});

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/rooms", roomsRoutes);

// loop through each ns and listen for a connection
models.Namespaces.find()
    .exec()
    .then((namespaces) => {
        console.log(namespaces);

        // note that io.on === io.of('/').on ;)
        io.on('connection', (socket) => {

            console.log(socket.request.session);

            // build an array of namespaces with img and endpoint to send back
            // with this namespace map, every connection gets the same list of namespaces 
            let nsData = namespaces.filter((ns) => ns.endpoint === '/anime').map((ns) => {
                return {
                    img: ns.img,
                    endpoint: ns.endpoint
                };
            });
            // We need to use socket, not IO this is
            // because we want it to go to just this client
            socket.emit('nsList', nsData); // send nsData back to the client  
        })

        //Set up connection handler for each namespace
        namespaces.forEach((namespace) => {
            let nsp = io.of(namespace.endpoint);
            nsp.on('connection', (socket) => {
                handleChatConnection(socket, nsp, namespace);
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