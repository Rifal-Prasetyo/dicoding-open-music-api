// eslint-disable-next-line import/no-extraneous-dependencies
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists({ owner: credentialId });
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById({ playlistId });
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus berdasarkan id dan pemilik(anda)',
    };
  }

  async postSongToPlaylistByIdHandler(request, h) {
    await this._validator.validatePostSongToPlaylistSchema(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addPlaylistActivities(playlistId, songId, credentialId, 'add');
    await this._service.addSongToPlaylist({ playlistId, songId });
    const response = h.response({
      status: 'success',
      message: 'lagu berhasil di tambahkan ke album',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getSongsFromPlaylist({ playlistId });
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    await this._validator.validatePostSongToPlaylistSchema(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addPlaylistActivities(playlistId, songId, credentialId, 'delete');
    await this._service.deleteSongFromPlaylist({ playlistId, songId });
    return {
      status: 'success',
      message: 'lagu berhasil dihapus dari daftar playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivitiesById(playlistId);
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
