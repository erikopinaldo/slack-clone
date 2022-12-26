// Bring in the room class
const Namespace = require('../classes/Namespace');
const Room = require('../classes/Room');

// Set up the namespaces
let namespaces = [];
// Namespace(id, title, image, endpoint)
let animeNs = new Namespace(0, 'Anime', 'https://logodix.com/logo/825928.png', '/anime');
let dcNs = new Namespace(1, 'Dc', 'https://logodix.com/logo/38631.jpg', '/dc');
let marvelNs = new Namespace(2, 'Marvel', 'https://logodix.com/logo/24206.jpg', '/marvel');