class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addAlbum = this.addAlbum.bind(this);
  }

  addAlbum(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);
      const { name, year } = request.payload;

      const album = this._service.addAlbum({ name, year });

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          album,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(400);
      return response;
    }
  }

  /** kode disembunyikan */
}
module.exports = AlbumHandler;
