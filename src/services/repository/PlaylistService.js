const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDbPlaylistToModel } = require('../../utils/dbPlaylistToModel');

class PlaylistService {
  constructor(collabService, playlistActivityService) {
    this._pool = new Pool();
    this._collabService = collabService;
    this._playlistActivityService = playlistActivityService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylist(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username
        FROM playlist p
        LEFT JOIN collaborations c ON c.playlist_id = p.id
        JOIN users u ON u.id = p.owner
        WHERE p.owner = $1 OR c.user_id = $1
        GROUP BY p.id, p.name, u.username`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      username: row.username,
    }));
  }

  async getPlaylistById({ id, owner }) {
    const query = {
      text: `SELECT p.* FROM playlist p
      LEFT JOIN collaborations c ON c.playlist_id = p.id
      WHERE p.id = $1 AND (p.owner = $2 OR c.user_id = $2)
      GROUP BY p.i`,
      values: [id, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows.map(mapDbPlaylistToModel)[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist({ songId, playlistId, userId }) {
    const id = `playlist-song-${nanoid(16)}`;

    const songQuery = {
      text: 'SELECT title FROM songs WHERE id = $1',
      values: [songId],
    };
    const songResult = await this._pool.query(songQuery);

    if (songResult.rows.length === 0) {
      throw new NotFoundError('Lagu yang akan ditambahkan tidak ditemukan');
    }

    const songTitle = songResult.rows[0].title;

    const query = {
      text: 'INSERT INTO playlist_song VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._playlistActivityService.addPlaylistActivity(playlistId, userId, songTitle, 'add');
    return result.rows[0].id;
  }

  async getSongFromPlaylist({ playlistId }) {
    const query = {
      text: `
    SELECT p.id AS playlist_id, p.name AS playlist_name, u.username,
    s.id AS song_id, s.title, s.performer
    FROM songs s
    JOIN playlist_song ps ON ps.song_id = s.id
    JOIN playlist p ON p.id = ps.playlist_id
    JOIN users u ON u.id = p.owner
    WHERE p.id = $1
  `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = {
      id: result.rows[0].playlist_id,
      name: result.rows[0].playlist_name,
      username: result.rows[0].username,
      songs: result.rows.map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      })),
    };

    return playlist;
  }

  async deleteSongFromPlaylist({ songId, playlistId, userId }) {
    const songQuery = {
      text: 'SELECT title FROM songs WHERE id = $1',
      values: [songId],
    };
    const songResult = await this._pool.query(songQuery);

    if (songResult.rows.length === 0) {
      throw new NotFoundError('Lagu yang akan dihapus tidak ditemukan');
    }

    const songTitle = songResult.rows[0].title;

    const query = `
    DELETE FROM playlist_song
    WHERE playlist_id = $1
    AND song_id = $2
  `;
    const values = [playlistId, songId];

    const result = await this._pool.query(query, values);

    if (result.rowCount === 0) {
      throw new NotFoundError('Lagu tidak ditemukan pada playlist');
    }

    await this._playlistActivityService.addPlaylistActivity(playlistId, userId, songTitle, 'delete');
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id],
    };
    console.log(query);
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collabService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
