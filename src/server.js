const Hapi = require('@hapi/hapi');
const albumPlugin = require('./api/album');
const songPlugin = require('./api/song');
const AlbumValidator = require('./validator/album');
const AlbumService = require('./services/repository/AlbumService');
const SongService = require('./services/repository/SongService');
const SongValidator = require('./validator/song');
const ClientError = require('./exceptions/ClientError');

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

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    console.log(response);
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
