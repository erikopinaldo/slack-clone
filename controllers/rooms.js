const models = require("../models");

module.exports = {
  getRooms: async (req, res) => { 
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      //Sending post data from mongodb and user data to ejs template
      let messageHistory = await models.Messages.find({ room: req.params.name.toLowerCase() }).exec()
      res.render("rooms", { messageHistory: messageHistory, currentRoom: req.params.name });
    } catch (err) {
      console.log(err);
    }
  },
};
