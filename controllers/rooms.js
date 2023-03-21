const models = require("../models");

module.exports = {
  getRooms: async (req, res) => {
    if (!req.params.room) {
      res.redirect('/chat/anime/naruto')
    }
    else {
      try {
        let namespace = req.io.of('/' + req.params.namespace);
        let roomName = req.params.room.toLowerCase();
        namespace.on('connection', (socket) => {
          socket.leave([...socket.rooms][1]);
          socket.join(roomName);
          console.log(socket.rooms);
        })

        let messageHistory = await models.Messages.find({ room: roomName }).exec();
        console.log('visiting: ' + roomName);

        res.render("rooms", { messageHistory: messageHistory, currentRoom: roomName });

      }
      catch (err) {
        console.log(err);
      }
    }
  },
};
