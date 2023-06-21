class PlaylistActivityHandler {
  constructor(playlistActivityService, playlistService) {
    this._playlistActivityService = playlistActivityService;
    this._playlistService = playlistService;

    this.getPlaylistActivityHandler = this.getPlaylistActivityHandler.bind(this);
  }

  async getPlaylistActivityHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    const activity = await this._playlistActivityService.getPlaylistActivity(playlistId);

    return {
      status: 'success',
      data: activity,
    };
  }
}

module.exports = PlaylistActivityHandler;
