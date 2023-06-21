const ClientError = require('../../exceptions/ClientError');
const { PlaylistPayloadSchema, PlaylistSongPayloadSchema } = require('./schema');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message, 400);
    }
  },
  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message, 400);
    }
  },
};

module.exports = PlaylistValidator;
