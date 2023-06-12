const ClientError = require('../../exceptions/ClientError');
const { SongPayloadSchema } = require('./schema');

const SongValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message, 400);
    }
  },
};

module.exports = SongValidator;
