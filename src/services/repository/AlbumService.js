const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBAlbumToModel } = require('../../utils/dbAlbumToModel');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBSongsToModel } = require('../../utils/dbSongToModel');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows.map(mapDBAlbumToModel)[0];
    const songsQuery = {
      text: 'SELECT * FROM songs WHERE "album_id" = $1',
      values: [album.id],
    };
    const songsResult = await this._pool.query(songsQuery);

    const songs = songsResult.rows.map(mapDBSongsToModel);

    return {
      ...album,
      songs,
    };
  }

  async updateAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui albums. Id tidak ditemukan');
    }
  }

  async updateAlbumImage(id, imagesUrl) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET images = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [imagesUrl, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui albums. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    this.checkAlbum(id);
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this._pool.query(query);
  }

  async likesAlbum(id, userId) {
    this.checkAlbum(id);

    const checkQuery = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [id, userId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length) {
      throw new InvariantError('Anda telah menyukai album ini');
    }

    const query = {
      text: 'INSERT INTO user_album_likes (user_id, album_id) VALUES($1, $2) RETURNING id',
      values: [userId, id],
    };
    const result = await this._pool.query(query);
    await this._cacheService.delete(`album_likes:${id}`);

    return result.rows[0].id;
  }

  async dislikesAlbum(id, userId) {
    this.checkAlbum(id);

    const checkQuery = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [id, userId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (!checkResult.rows.length) {
      throw new InvariantError('Anda belum pernah menyukai album ini');
    }

    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [id, userId],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`album_likes:${id}`);
  }

  async likesAlbumCount(id) {
    this.checkAlbum(id);

    try {
      const result = await this._cacheService.get(`album_likes:${id}`);
      return [JSON.parse(result), true];
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);
      const { count } = result.rows[0];

      const response = {
        status: 'success',
        data: {
          likes: parseInt(count, 10),
        },
      };
      await this._cacheService.set(`album_likes:${id}`, JSON.stringify(response));

      return [response, false];
    }
  }

  async checkAlbum(id) {
    const checkAlbumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const checkAlbum = await this._pool.query(checkAlbumQuery);

    if (!checkAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumService;
