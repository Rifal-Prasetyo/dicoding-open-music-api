/* eslint-disable import/no-extraneous-dependencies */
const autoBind = require('auto-bind');
// const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;
    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    this._validator.validateExportPlaylistsPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };

    // verify owner
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    // send
    this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
