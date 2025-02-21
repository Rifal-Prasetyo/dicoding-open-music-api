const InvariantError = require('../../exceptions/InvariantError');
const {
  PostPlaylistSchema,
  PostSongToPlaylistSchema,
} = require('./schema');

const PlaylistValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongToPlaylistSchema: (payload) => {
    const validationResult = PostSongToPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
