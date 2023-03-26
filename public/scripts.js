// const username = prompt("what is your name? ") // prompt the user to enter his username
const socket = io(window.location.origin);

console.log('connected!');

let nsSocket = ""; // we setup an initial global variable

// down here we have the socket listen for the 'nsList' event which will be sent from the server
// which is going to run a callback whenever that happens and assign whatever it gets from the server to 'nsData'
socket.on('nsList', (nsData) => {
    let namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = "";
    nsData.forEach((ns) => {
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint} ><a href="/chat${ns.endpoint}"><img src="${ns.img}" /></a></div>`;
    })
    // Add clickListener to each Namespace (NS)
    console.log(document.getElementsByClassName('namespace'));
    Array.from(document.getElementsByClassName('namespace')).forEach(elem => {

        elem.addEventListener('click', e => {
            const nsEndpoint = elem.getAttribute('ns');
            joinNs(nsEndpoint);
        });
    })

    let nsToJoin = window.location.pathname.split('/')[2]
    console.log(nsToJoin)

    joinNs(`/${nsToJoin}`);
})

socket.on('currentUser', (username) => {
    localStorage.setItem('user', username)
    let user = username

    let myWidget = cloudinary.createUploadWidget({
        cloudName: 'dqonprzjw',
        uploadPreset: 'slack-clone',
        sources: ['local'],
        publicId: user
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            console.log('Done! Here is the image info: ', result.info);
        }
    }
    )

    document.getElementById("profile").addEventListener("click", function () {
        myWidget.open();
    }, false);
})

const messagesUl = document.querySelector("#messages");
messagesUl.scrollTo(0, messagesUl.scrollHeight);