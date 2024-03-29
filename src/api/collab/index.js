const CollabHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collabService, playlistService, validator }) => {
    const collabHandler = new CollabHandler(collabService, playlistService, validator);
    server.route(routes(collabHandler));
  },
};
