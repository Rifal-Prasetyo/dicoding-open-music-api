const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBSongsToModel, mapDBPlaylistToModel } = require('../../utils');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);
    const createAt = new Date().toISOString();
    const updateAt = createAt;

    // query database
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createAt, updateAt],
    };
    // querying to databse
    const result = await this._poll.query(query);

    // if failed throw InvariantError
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    // get id has been created
    return result.rows[0].id;
  }

  async getPlaylists({ owner }) {
    const query = {
      text: `SELECT playlists.* FROM playlists
    LEFT JOIN collaborations ON collaborations.note_id = playlists.id
    WHERE playlists.owner = $1 OR collaborations.user_id = $1
    GROUP BY playlists.id`,
      values: [owner],
    };
    const result = await this._poll.query(query);
    return result.rows.map(mapDBPlaylistToModel);
  }

  async deletePlaylistById({ playlistId }) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING 1',
      values: [playlistId],
    };
    const result = await this._poll.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus, id tidak ditemukan');
    }
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `plsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('lagu  gagal ditambahkan ke playlist');
    }
  }

  async getSongsFromPlaylist({ playlistId }) {
    const queryPlaylist = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const querySongs = {
      text: 'SELECT songs.* FROM songs LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlists.id = $1 GROUP BY songs.id',
      values: [playlistId],
    };
    const resultPlaylist = await this._pool.query(queryPlaylist);
    const resultSongs = await this._pool.query(querySongs);
    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist gagal didapat, id tidak ditemukan');
    }
    const playlist = resultPlaylist.rows.map(mapDBPlaylistToModel)[0];
    playlist.songs = resultSongs.rows.map(mapDBSongsToModel);

    return playlist;
  }

  async deleteSongFromPlaylist({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    await this._pool.query(query);
    return {
      status: 'success',
      message: 'berhasil menghapus lagu dari playlist',
    };
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner = $1',
      values: [id],
    };
    const result = await this._poll.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
