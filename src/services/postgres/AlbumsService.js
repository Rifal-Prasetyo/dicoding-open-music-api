/* eslint-disable radix */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBAlbumToModel, mapDBSongsToModel } = require('../../utils');
const ClientError = require('../../exceptions/ClientError');

class AlbumsService {
  constructor(storageService, cacheService) {
    this._pool = new Pool();
    this._storageService = storageService;
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year, cover = '' }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, name, year, createdAt, updatedAt, cover],
    };
    // querying to database
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbums = {
      text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
      values: [id],
    };
    const querySongs = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };
    const result = await this._pool.query(queryAlbums);
    const resultSongs = await this._pool.query(querySongs);
    if (!result.rowCount) {
      throw new NotFoundError('id album tidak ditemukan');
    }
    const data = result.rows.map(mapDBAlbumToModel)[0];
    data.songs = resultSongs.rows.map(mapDBSongsToModel);
    return data;
  }

  async putAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui data, id album tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan');
    }
  }

  async writeCoverImage(albumId, data, meta) {
    const fileName = await this._storageService.writeFile(data, meta);
    const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${fileName}`;
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [fileUrl, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album gagal diupdate covernya, id tidak ditemukan');
    }
  }

  async verifyLikesAlbumUser(albumId, userId) {
    await this.getAlbumById(albumId);
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount) {
      throw new ClientError('user sudah melakukan like pada album terkait');
    }
  }

  async addLikesAlbum(albumId, userId) {
    await this.verifyLikesAlbumUser(albumId, userId);
    const id = `likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [userId, albumId, id],
    };
    await this._pool.query(query);
    await this._cacheService.delete(`albums:${albumId}`);
  }

  async deleteLikesAlbum(albumId, userId) {
    await this.getAlbumById(albumId);
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('id tidak ditemukan');
    }
    await this._cacheService.delete(`albums:${albumId}`);
  }

  async getLikesAlbum(albumId) {
    const query = {
      text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    let likes;
    const result = await this._pool.query(query);
    // eslint-disable-next-line prefer-const
    likes = result.rows[0].count;
    // console.log('get likes album service\n', result);
    try {
      const likesCache = await this._cacheService.get(`albums:${albumId}`);
      return { likes: parseInt(likesCache), isFromCache: true };
    } catch (error) {
      await this._cacheService.set(`albums:${albumId}`, likes, 60 * 30);
      return { likes: parseInt(likes), isFromCache: false };
    }
  }
}

module.exports = AlbumsService;
