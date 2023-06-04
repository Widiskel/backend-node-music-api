const routes = (handler) => [
  {
    method: 'POST',
    path: '/album',
    handler: handler.addAlbum,
  },
];

module.exports = routes;
