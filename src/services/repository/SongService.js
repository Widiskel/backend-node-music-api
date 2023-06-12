const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBSongToModel, mapDBSongsToModel } = require('../../utils/dbSongToModel');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAllSong(queryParams) {
    const { title, performer } = queryParams;
    const query = {
      text: 'SELECT * FROM songs ',
    };
    const values = [];

    if (title && performer) {
      query.text += ' WHERE title ILIKE $1 AND performer ILIKE $2';
      values.push(`%${title}%`, `%${performer}%`);
    } else if (title) {
      query.text += ' WHERE title ILIKE $1';
      values.push(`%${title}%`);
    } else if (performer) {
      query.text += ' WHERE performer ILIKE $1';
      values.push(`%${performer}%`);
    }

    query.values = values;
    const result = await this._pool.query(query);
    console.log(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBSongsToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    console.log(result);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBSongToModel)[0];
  }

  async updateSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    let setClause = 'title = $1, year = $2, genre = $3, performer = $4, updated_at = $5';
    const values = [title, year, genre, performer, updatedAt];

    if (albumId !== undefined) {
      setClause += `, album_id = $${values.length + 1}`;
      values.push(albumId);
    }

    if (duration !== undefined) {
      setClause += `, duration = $${values.length + 1}`;
      values.push(duration);
    }

    const query = {
      text: `UPDATE songs SET ${setClause} WHERE id = $${values.length + 1} RETURNING id`,
      values: values.concat(id),
    };
    console.log(query);

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongService;
