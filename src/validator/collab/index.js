const InvariantError = require('../../exceptions/InvariantError');
const { CollabSchema } = require('./schema');

const CollabValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollabSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollabValidator;
