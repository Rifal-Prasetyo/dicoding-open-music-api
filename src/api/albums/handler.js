const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(service, validator, uploadsValidator) {
    this._service = service;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    // TODO: add validator
    this._validator.validateAlbumPayload(request.payload);
    const { name, year, cover } = request.payload;
    const albumId = await this._service.addAlbum({ name, year, cover });
    const response = h.response({
      status: 'success',
      message: 'Menambahkan album',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);
      const response = h.response({
        status: 'success',
        data: {
          album,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: 'Maaf ada kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      await this._service.putAlbumById(id, request.payload);
      // if you use return by default return 200 status code
      return {
        status: 'success',
        message: 'Mengubah album berdasarkan id album.',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);
      return {
        status: 'success',
        message: 'Menghapus album berdasarkan id.',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async postCoverAlbumByIdHandler(request, h) {
    const { cover } = request.payload;
    const { id: albumId } = request.params;
    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    await this._service.writeCoverImage(albumId, cover, cover.hapi);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil di unggah',
    });
    response.code(201);
    return response;
  }

  async postLikesAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._service.addLikesAlbum(albumId, userId);
    const response = h.response({
      status: 'success',
      message: 'berhasil menambah like',
    });
    response.code(201);
    return response;
  }

  async deleteLikesAlbumByIdHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._service.deleteLikesAlbum(albumId, userId);
    return {
      status: 'success',
      message: 'berhasil menghapus like',
    };
  }

  async getLikesAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, isFromCache } = await this._service.getLikesAlbum(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);
    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsHandler;
