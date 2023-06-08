const Hapi = require('@hapi/hapi');
const albumPlugin = require('./api/album');
const songPlugin = require('./api/song');
const AlbumValidator = require('./validator/album');
const AlbumService = require('./services/repository/AlbumService');
const SongService = require('./services/repository/SongService');
const SongValidator = require('./validator/song');
require('dotenv').config();

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
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
      options:
        {
          service: albumService,
          validator: AlbumValidator,
        },
    },
    {
      plugin: songPlugin,
      options:
        {
          service: songService,
          validator: SongValidator,
        },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
