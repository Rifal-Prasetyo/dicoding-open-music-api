const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBAlbumToModel, mapDBSongsToModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = "album-" + nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };
    // querying to database
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query_albums = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const query_songs = {
      text: "SELECT * FROM songs WHERE album_id = $1",
      values: [id],
    };
    const result = await this._pool.query(query_albums);
    const result_songs = await this._pool.query(query_songs);
    if (!result.rows.length) {
      throw new NotFoundError('id album tidak ditemukan');
    }
    let data = result.rows.map(mapDBAlbumToModel)[0];
    data['songs'] = result_songs.rows.map(mapDBSongsToModel);
    return data;
  }

  async putAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
      values: [name, year, updatedAt, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui data, id album tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
