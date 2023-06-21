const PlaylistActivityHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist_activity',
  version: '1.0.0',
  register: async (server, { playlistActivityService, playlistService }) => {
    const playlistActivityHandler = new PlaylistActivityHandler(
      playlistActivityService,
      playlistService,
    );
    server.route(routes(playlistActivityHandler));
  },
};
