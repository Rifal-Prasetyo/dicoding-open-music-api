class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postPlaylistHanler = this.postPlaylistHanler(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler(this);
    this.postSongToPlaylistByIdHandler = this.postSongToPlaylistByIdHandler(this);
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler(this);
    this.deleteSongFromPlaylistByIdHandler = this.deleteSongFromPlaylistByIdHandler(this);
  }

  async postPlaylistHanler(request, h) {
    console.log('playlist handler dieksekusi');
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
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deletePlaylistById({ playlistId });
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus berdasarkan id dan pemilik(anda)',
    };
  }

  async postSongToPlaylistByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    // TODO: create Validator to Playlist Validator
    // TODO: post song must be owner or collaborator
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongToPlaylist({ playlistId, songId });
    const response = h.response({
      status: 'success',
      message: 'lagu berhasil di tambahkan ke album',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request) {
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
    const { id: playlistId } = request.params;
    const { id: songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist({ playlistId, songId });
    return {
      status: 'success',
      message: 'lagu berhasil dihapus dari daftar playlist',
    };
  }
}

module.exports = PlaylistsHandler;
