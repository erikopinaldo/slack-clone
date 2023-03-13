const models = require("../models");

module.exports = {
  getRooms: async (req, res) => { 
    try {
      console.log(req.io)
      let roomName = req.params.name.toLowerCase()
      req.io.of('/anime').emit('joinRoom', roomName)
      let messageHistory = await models.Messages.find({ room: roomName }).exec()
      console.log('visiting: ' + req.params.name)
      
      res.render("rooms", { messageHistory: messageHistory, currentRoom: req.params.name });

    } catch (err) {
      console.log(err);
    }
  },
};
