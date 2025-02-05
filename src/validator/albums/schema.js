const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
    name: Joi.string().min(3),
    year: Joi.number().min(4).max(4),
});
module.exports = { AlbumPayloadSchema };