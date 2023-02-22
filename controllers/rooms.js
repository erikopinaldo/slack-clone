const Rooms = require("../models/Rooms");

module.exports = {
  getRooms: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      //Sending post data from mongodb and user data to ejs template
      res.render("rooms.html");
    } catch (err) {
      console.log(err);
    }
  },
};
