function joinNs(endpoint) {
    // close connection to namespace when no longer in use
    if (nsSocket) {
        // check to see if nsSocket is a socket
        nsSocket.close()
    }
    nsSocket = io(`http://localhost:9000${endpoint}`)
}