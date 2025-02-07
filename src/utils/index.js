/* eslint-disable camelcase */
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
  songs: songs ? songs.map(mapDBSongsToModel) : []
});

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

module.exports = {
  mapDBAlbumToModel,
  mapDBSongsToModel,
  mapDBSongsDetailToModel,
};
