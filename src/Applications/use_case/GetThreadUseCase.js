const CommentRepository = require('../../Domains/comments/CommentRepository');
const GetComment = require('../../Domains/comments/entities/GetComment');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    /** @type ThreadRepository */
    this._threadRepository = threadRepository;
    /** @type CommentRepository */    
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const thread = await this._threadRepository.getThreadById(useCasePayload.id);
    const comments = await this._commentRepository.getCommentsByThreadId(useCasePayload.id);
    if (comments.length > 0) {
      thread.comments = comments.map((comment) => new GetComment(comment));
    }
    return thread;
  }

  _validatePayload(payload) {
    const { id } = payload;
    if (!id) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_ID');
    }

    if (typeof id !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadUseCase;
