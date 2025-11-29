// Compatibility wrapper for hosts that expect `server/server.js` as entrypoint.
// It simply requires `index.js` (the real server). Requiring it starts the server.
module.exports = require('./index.js');
