const models = require("../models");

module.exports = {
  getRooms: async (req, res) => { 
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      //Sending post data from mongodb and user data to ejs template

      let roomName = req.params.name.toLowerCase()
      let namespace = req.io.of('/anime')

      namespace.on('connection', (socket) => {
        console.log('joining room ' + roomName)

        console.log(socket.rooms)
        const roomToLeave = [...socket.rooms][1]

        // leave old room
        socket.leave(roomToLeave)
        // updateUsersInRoom(namespace, roomToLeave)

        // join the socket to the new room
        socket.join(roomName.toLowerCase())
                    // updateUsersInRoom(namespace, roomToJoin)

        console.log(socket.rooms)
      });

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
