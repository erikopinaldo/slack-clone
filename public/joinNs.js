
function joinNs(endpoint) {
    // close connection to namespace when no longer in use
    if (nsSocket) {
        // check to see if nsSocket is a socket
        nsSocket.close()
    }
    nsSocket = io(`http://localhost:9000${endpoint}`)
    nsSocket.on('nsRoomLoad', (nsRooms) => {
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = ""
        nsRooms.forEach((room) => {
            let glyph;
            if (room.privateRoom) {
                glyph = 'lock'
            } else {
                glyph = 'globe'
            }
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
        })

        // add click listener to each room
        let roomNodes = document.getElementsByClassName('room');
        Array.from(roomNodes).forEach(elem => {
            elem.addEventListener('click', (e) => {
                console.log("Someone Clicked on ", e.target.innerText)
                joinRoom(e.target.innerText)
            })
        })

        // Add room automatically
        const topRoom = document.querySelector('.room')
        const topRoomName = topRoom.innerText;
        joinRoom(topRoomName)
    })
}