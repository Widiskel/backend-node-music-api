const { AlbumPayloadSchema } = require('./schema');

const AlbumValidator = {
  validateNotePayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
