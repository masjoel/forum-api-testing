const CommentRepository = require('../../Domains/comments/CommentRepository');

class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    /** @type CommentRepository */
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { id, user_id: userId } = useCasePayload;
    await this._commentRepository.getCommentById(id);
    await this._commentRepository.verifyUsersComment(id, userId);
    return this._commentRepository.deleteComment(id);
  }

  _validatePayload(payload) {
    const { id, user_id: userId } = payload;
    if (!id || !userId) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof userId !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentUseCase;
