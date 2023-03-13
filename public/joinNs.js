function joinNs(endpoint) { 
    // close connection to namespace when no longer in use
    if (nsSocket) {
        // check to see if nsSocket is a socket
        nsSocket.close()
        // remove event listener before it's added again
        document.querySelector("#user-input").removeEventListener('submit', formSubmission)
    }

    nsSocket = io(`http://localhost:8080${endpoint}`)
    
    nsSocket.on('nsRoomLoad', (nsRooms) => {
        console.log(nsRooms)
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = ""
        nsRooms.forEach((room) => {
            let glyph;
            if (room.isPrivate) {
                glyph = 'lock'
            } else {
                glyph = 'globe'
            }
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span><a href="/rooms/${room.name}">${room.name}</a></li>`
        })
    })

    document.querySelector('.message-form').addEventListener('submit', formSubmission)

    nsSocket.on('messageToClients', (msg) => {
        const newMsg = buildHTML(msg)
        document.querySelector('#messages').innerHTML += newMsg
    })
}

function formSubmission(event) {
    event.preventDefault();
    const roomName = window.location.pathname.split("/").pop();
    console.log(roomName);
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer', roomName, { text: newMessage });
    document.querySelector('#user-input').reset();
}

function buildHTML(msg) {
    const convertedDate = new Date(msg.time).toLocaleString();
    const newHTML = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.user} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>
    `
    return newHTML;
}