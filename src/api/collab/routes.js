const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.addCollaborationHandler,
    options: {
      auth: 'open-music-api-v1',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'open-music-api-v1',
    },
  },
];

module.exports = routes;
