const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const user = {
      id: 'user-123',
      username: 'username',
    };
    const thread = {
      id: 'thread-123',
      title: 'sebuah thread',
    };
    const useCasePaylaod = {
      content: 'sebuah comment',
      thread_id: thread.id,
      user_id: user.id,
    };
    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'sebuah comment',
      user_id: 'username',
    });
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    /** mocking needed function */
    mockThreadRepository.verifyFoundThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePaylaod);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: 'sebuah comment',
      user_id: 'username',
    }));
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment(useCasePaylaod));
    expect(mockThreadRepository.verifyFoundThreadById).toBeCalledWith(thread.id);
  });
});
