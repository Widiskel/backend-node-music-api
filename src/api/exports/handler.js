class ExportsHandler {
  constructor(service, validator, playlistService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;

    this.exportPlaylistHandler = this.exportPlaylistHandler.bind(this);
  }

  async exportPlaylistHandler(request, h) {
    this._validator.validateExportNotesPayload(request.payload);
    const { playlistId: idPlaylist } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const message = {
      playlistId: idPlaylist,
      targetEmail: request.payload.targetEmail,
    };

    console.log(JSON.stringify(message));

    await this._playlistService.verifyPlaylistOwner(idPlaylist, credentialId);
    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
