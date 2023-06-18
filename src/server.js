const Hapi = require('@hapi/hapi');

const albumPlugin = require('./api/album');
const AlbumValidator = require('./validator/album');
const AlbumService = require('./services/repository/AlbumService');

const songPlugin = require('./api/song');
const SongService = require('./services/repository/SongService');
const SongValidator = require('./validator/song');

const UsersService = require('./services/repository/UsersService');
const usersPlugin = require('./api/users');
const UsersValidator = require('./validator/users');

const auth = require('./api/auth');
const AuthService = require('./services/repository/AuthService');
const TokenManager = require('./tokenize/TokenManager');
const AuthValidator = require('./validator/auth');

const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const usersService = new UsersService();
  const authService = new AuthService();

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
    {
      plugin: usersPlugin,
      options:
        {
          service: usersService,
          validator: UsersValidator,
        },
    },
    {
      plugin: auth,
      options: {
        authService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthValidator,
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
