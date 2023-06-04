const Hapi = require('@hapi/hapi');
const albumPlugin = require('./api/album');
const AlbumService = require('./services/inMemory/AlbumService');
const AlbumValidator = require('./validator/album');

const init = async () => {
  const albumService = new AlbumService();
  const server = Hapi.server({
    port: 9080,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albumPlugin,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
