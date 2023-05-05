const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddComment = require('../../Domains/comments/entities/AddComment');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
        /** @type ThreadRepository */
        this._threadRepository = threadRepository;
        /** @type CommentRepository */    
        this._commentRepository = commentRepository;
  }

  async execute(useCasePaylaod) {
    const addComment = new AddComment(useCasePaylaod);
    await this._threadRepository.verifyFoundThreadById(useCasePaylaod.thread_id);
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
