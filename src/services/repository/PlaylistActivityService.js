const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivityService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const queryUser = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };

    const resultUser = await this._pool.query(queryUser);

    if (!resultUser.rows.length) {
      throw new NotFoundError('Pengguna yang akan ditambahkan tidak ditemukan');
    }

    const queryPlaylist = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist yang akan ditambahkan tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistActivity(playlistId) {
    const query = {
      text: `
      SELECT pa.username, pa.title, pa.action, pa.created_at AS time
      FROM playlist_activity pa
      WHERE pa.playlist_id = $1
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    const activities = result.rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.time.toISOString(),
    }));

    const response = {
      playlistId,
      activities,
    };

    return response;
  }

  async addPlaylistActivity(playlistId, userId, title, activity) {
    const userQuery = {
      text: `
      SELECT username
      FROM users
      WHERE id = $1
    `,
      values: [userId],
    };
    const userResult = await this._pool.query(userQuery);
    const { username } = userResult.rows[0];

    const query = {
      text: `
      INSERT INTO playlist_activity (title, action, username, playlist_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `,
      values: [title, activity, username, playlistId],
    };
    await this._pool.query(query);
  }
}

module.exports = PlaylistActivityService;
