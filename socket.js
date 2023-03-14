const mongoose = require('mongoose');
const models = require('./models')

const handleChatConnection = async (socket) => {
    console.log('a user connected to ' + socket.nsp.name);

    let nsRooms = await models.Rooms.find({ namespace: socket.nsp.name.slice(1) }).exec();

    socket.emit('nsRoomLoad', nsRooms)

    // Handle joining a room within the chat namespace
    socket.on('joinRoom', async (roomName) => {
        socket.join(roomName);
        console.log(`a user joined room ${roomName}`);
    });

    // Handle leaving a room within the chat namespace
    socket.on('leaveRoom', (roomName) => {
        socket.leave(roomName);
        console.log(`a user left room ${roomName}`);
    });

    
    // Handle sending a message to a room within the chat namespace
    socket.on('newMessageToServer', async (roomName, msg) => {
        if (!roomName) {
            console.error(`Room ${roomName} not found`);
            return;
        }

        let user = await models.Users.findById(socket.request.session.passport.user).select('userName');
        let username = user.userName;

        const fullMsg = {
            text: msg.text,
            time: Date.now(),
            user: username,
            room: roomName,
            avatar: 'https://via.placeholder.com/30'
        }

        try {
            console.log(fullMsg)
            console.log('user: ' + fullMsg.user)
            models.Messages.create(fullMsg)
                .then(console.log('Message has been added!'))
        } catch (err) {
            console.log(err)
        }
        socket.to(roomName).emit('messageToClients', fullMsg);
        socket.emit('messageToClients', fullMsg);

    });

    module.exports = {
        socket,
    };
};

module.exports = { handleChatConnection };