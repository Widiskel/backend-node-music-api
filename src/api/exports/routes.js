const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.exportPlaylistHandler,
    options: {
      auth: 'open-music-api-v1',
    },
  },
];

module.exports = routes;
