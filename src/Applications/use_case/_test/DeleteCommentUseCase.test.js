const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain id', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if id not string', async () => {
    // Arrange
    const useCasePayload = {
      id: 123,
      user_id: 'user-123',
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const user = {
      id: 'user-123',
      username: 'username',
    };
    const useCasePayload = {
      id: 'comment-123',
      user_id: user.id,
    };
    const mockGetComment = new GetComment({
      id: 'comment-123',
      content: 'sebuah comment',
      date: 'tgl comment',
      username: user.username,
      is_delete: 0,
    });
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    /** mocking needed function */
    mockCommentRepository.verifyUsersComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetComment));
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const deleteComment = await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(deleteComment).toEqual(true);
    expect(mockCommentRepository.verifyUsersComment)
      .toBeCalledWith(mockGetComment.id, user.id);
    expect(mockCommentRepository.getCommentById)
      .toBeCalledWith(mockGetComment.id);
    expect(mockCommentRepository.deleteComment)
      .toBeCalledWith(mockGetComment.id);
  });
});
