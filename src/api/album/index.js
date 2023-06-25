const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (server, {
    service, validator, storage, uploadValidator,
  }) => {
    const albumHandler = new AlbumHandler(service, validator, storage, uploadValidator);
    server.route(routes(albumHandler));
  },
};
