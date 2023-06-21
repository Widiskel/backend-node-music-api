const Joi = require('joi');

const CollabSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { CollabSchema };
