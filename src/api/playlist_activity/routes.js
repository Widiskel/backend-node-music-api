const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getPlaylistActivityHandler,
    options: {
      auth: 'open-music-api-v1',
    },
  },
];

module.exports = routes;
