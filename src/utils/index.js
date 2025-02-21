/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const mapDBSongsToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  performer,
});

const mapDBAlbumToModel = ({
  id,
  name,
  year,
  songs,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  songs: songs ? songs.map(mapDBSongsToModel) : [],
});

const mapDBSongsDetailToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapDBPlaylistToModel = ({
  id,
  name,
  username,
  owner,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  username,
});

module.exports = {
  mapDBAlbumToModel,
  mapDBSongsToModel,
  mapDBSongsDetailToModel,
  mapDBPlaylistToModel,
};
