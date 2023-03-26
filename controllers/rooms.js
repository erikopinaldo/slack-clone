const models = require("../models");

module.exports = {
  getRooms: async (req, res) => {
    let currentUser = req.user.userName
    let ns = req.params.namespace
    if (!req.params.room) {
      try {
        let activeNamespace = await models.Namespaces.find({ name: ns }).exec();
        let defaultRoom = activeNamespace[0].toObject().defaultRoom;

        console.log(defaultRoom);

        res.redirect(`/chat/${ns}/${defaultRoom}`);
      }
      catch(err) {
        console.log(err);
      }
    }
    else {
      try {
        let namespace = req.io.of('/' + ns);
        let roomName = req.params.room.toLowerCase();
        namespace.on('connection', (socket) => {
          socket.leave([...socket.rooms][1]);
          socket.join(roomName);
          console.log(socket.rooms);
        })

        let messageHistory = await models.Messages.find({ room: roomName }).exec();
        console.log('visiting: ' + roomName);

        res.render("rooms", { messageHistory: messageHistory, currentRoom: roomName, currentUser: currentUser });

      }
      catch (err) {
        console.log(err);
      }
    }
  }, 
};
