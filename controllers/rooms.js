const models = require("../models");

module.exports = {
  getRooms: async (req, res) => { 
    try {
      let namespace = req.io.of('/test');
      let roomName = req.params.name.toLowerCase();
      namespace.on('connection', (socket) => {
        socket.leave([...socket.rooms][1]);
        socket.join(roomName);
        console.log(socket.rooms);
      })
      
      let messageHistory = await models.Messages.find({ room: roomName }).exec();
      console.log('visiting: ' + req.params.name);
      
      res.render("rooms", { messageHistory: messageHistory, currentRoom: roomName });

    }
    catch (err) {
      console.log(err);
    }
  },
};
