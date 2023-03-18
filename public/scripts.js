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
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint} ><img src="${ns.img}" /></div>`;
    })
    // Add clickListener to each Namespace (NS)
    console.log(document.getElementsByClassName('namespace'));
    Array.from(document.getElementsByClassName('namespace')).forEach(elem => {

        elem.addEventListener('click', e => {
            const nsEndpoint = elem.getAttribute('ns');
            joinNs(nsEndpoint);
        });
    })
    joinNs('/test');
})

const messagesUl = document.querySelector("#messages");
messagesUl.scrollTo(0, messagesUl.scrollHeight);