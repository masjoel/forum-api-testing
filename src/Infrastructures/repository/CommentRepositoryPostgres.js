const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const GetComment = require('../../Domains/comments/entities/GetComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { content, thread_id: threadId, user_id: userId } = comment;
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, user_id) VALUES($1, $2, $3, $4) RETURNING id, content, thread_id, user_id',
      values: [id, content, threadId, userId],
    };
    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT * FROM comments INNER JOIN (SELECT id as user_id, username FROM users) AS users ON comments.user_id = users.user_id WHERE comments.thread_id = $1 ORDER BY comments.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows.map((comment) => new GetComment(comment));
  }

  async verifyUsersComment(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comments INNER JOIN (SELECT id as user_id, username FROM users) users ON comments.user_id = users.user_id WHERE id = $1 AND users.user_id = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('Akses tidak dizinkan');
    }
  }

  async getCommentById(commentId) {
    const query = {
      text: `SELECT * FROM comments INNER JOIN (SELECT id as user_id, username FROM users) AS users ON comments.user_id = users.user_id WHERE comments.id = $1 ORDER BY comments.date ASC`,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    return new GetComment(result.rows[0]);
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = 1 WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('tidak dapat menghapus comment ini');
    }
    return result.rowCount > 0;
  }

  async verifyFoundCommentById(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres; 
