const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const StorageService = require('./storage/StorageService');
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

const playlistPlugin = require('./api/playlist');
const PlaylistService = require('./services/repository/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

const collabPlugin = require('./api/collab');
const CollaborationsService = require('./services/repository/CollaborationService');
const CollabValidator = require('./validator/collab');

const playlistActivityPlugin = require('./api/playlist_activity');
const PlaylistActivityService = require('./services/repository/PlaylistActivityService');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const ClientError = require('./exceptions/ClientError');
const UploadsValidator = require('./validator/uploads');

const CacheService = require('./services/redis/CacheService');

require('dotenv').config();

const init = async () => {
  const cacheService = new CacheService();
  const storageService = new StorageService(path.resolve(__dirname, 'storage/images/'));
  const albumService = new AlbumService(cacheService);
  const songService = new SongService();
  const usersService = new UsersService();
  const authService = new AuthService();
  const collabService = new CollaborationsService();
  const playlistActivityService = new PlaylistActivityService();
  const playlistService = new PlaylistService(collabService, playlistActivityService);

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
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('open-music-api-v1', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albumPlugin,
      options:
      {
        service: albumService,
        validator: AlbumValidator,
        storage: storageService,
        uploadValidator: UploadsValidator,
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
      plugin: playlistPlugin,
      options:
        {
          service: playlistService,
          validator: PlaylistValidator,
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
    {
      plugin: collabPlugin,
      options: {
        collabService,
        playlistService,
        validator: CollabValidator,
      },
    },
    {
      plugin: playlistActivityPlugin,
      options: {
        playlistActivityService,
        playlistService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistService,
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

      if (!response.isServer) {
        return h.continue;
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
