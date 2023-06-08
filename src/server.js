const Hapi = require('@hapi/hapi');
const albumPlugin = require('./api/album');
const AlbumService = require('./services/inMemory/AlbumService');
const AlbumValidator = require('./validator/album');
require('dotenv').config();

const init = async () => {
  const albumService = new AlbumService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
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
