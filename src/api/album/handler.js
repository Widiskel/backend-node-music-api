class AlbumHandler {
  constructor(service, validator, storage, uploadValidator) {
    console.log('AlbumHandler constructor called.');
    this._service = service;
    this._validator = validator;
    this._storage = storage;
    this._uploadValidator = uploadValidator;

    this.addAlbumHandler = this.addAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.updateAlbumByIdHandler = this.updateAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.addCoversHandler = this.addCoversHandler.bind(this);
    this.likesAlbumHandler = this.likesAlbumHandler.bind(this);
    this.dislikesAlbumHandler = this.dislikesAlbumHandler.bind(this);
    this.likesAlbumCountHandler = this.likesAlbumCountHandler.bind(this);
  }

  async addCoversHandler(request, h) {
    const { cover: data } = request.payload;
    this._uploadValidator.validateImageHeaders(data.hapi.headers);

    const { id } = request.params;

    const filename = await this._storage.writeFile(data, data.hapi, 'albums');
    const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/images/albums/${filename}`;

    await this._service.updateAlbumImage(id, fileUrl);
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async addAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const album = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album baru berhasil ditambahkan',
      data: {
        albumId: album,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async updateAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.updateAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async likesAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._service.likesAlbum(id, userId);

    const response = h.response({
      status: 'success',
      message: 'Menyukai album',
    });
    response.code(201);
    return response;
  }

  async dislikesAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._service.dislikesAlbum(id, userId);

    const response = h.response({
      status: 'success',
      message: 'Batal album',
    });
    response.code(201);
    return response;
  }

  async likesAlbumCountHandler(request) {
    const { id } = request.params;

    const likes = await this._service.likesAlbumCount(id);

    return likes;
  }
}

module.exports = AlbumHandler;
