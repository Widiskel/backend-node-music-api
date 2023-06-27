const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.addAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.updateAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.addCoversHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/images/albums/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../storage/images/albums'),
      },
    },
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.likesAlbumHandler,
    options: {
      auth: 'open-music-api-v1',
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.dislikesAlbumHandler,
    options: {
      auth: 'open-music-api-v1',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.likesAlbumCountHandler,
  },
];

module.exports = routes;
