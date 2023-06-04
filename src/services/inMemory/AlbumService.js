const { nanoid } = require('nanoid');

class AlbumService {
  constructor() {
    this._album = [];
  }

  addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newAlbum = {
      id, name, year, createdAt, updatedAt,
    };

    this._album.push(newAlbum);

    const isSuccess = this._album.filter((item) => item.id === id).length > 0;

    if (!isSuccess) {
      throw new Error('Catatan gagal ditambahkan');
    }

    return newAlbum;
  }
}

module.exports = AlbumService;
