const models = require("../models");

module.exports = {
  getRooms: async (req, res) => { 
    try {
      let roomName = req.params.name.toLowerCase()
      req.io.of('/anime').emit('joinRoom', roomName)
      let messageHistory = await models.Messages.find({ room: roomName }).exec()
      console.log('message history')
      console.log(req.params.name)
      console.log(messageHistory)
      
      res.render("rooms", { messageHistory: messageHistory, currentRoom: req.params.name });

    } catch (err) {
      console.log(err);
    }
  },
};
