function joinRoom(roomName) {
    // Send roomName to the server
    nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
        // want to update the room member total
        document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span></span>`
    })
}