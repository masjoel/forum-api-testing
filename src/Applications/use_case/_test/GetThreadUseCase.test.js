const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const GetThreadUseCase = require('../GetThreadUseCase');
const tgl =  new Date().toISOString();

describe('GetThreadUseCase', () => {
  it('should throw error if use case payload not contain id', async () => {
    // Arrange
    const useCasePayload = {};
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_ID');
  });

  it('should throw error if id not string', async () => {
    // Arrange
    const useCasePayload = {
      id: 123,
    };
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread action correctly with comments', async () => {
    // Arrange
    const user = {
      id: 'user-123',
      username: 'dicoding',
    };
    const useCasePayload = {
      id: 'thread-123',
    };
    const mockGetThread = new GetThread({
      id: useCasePayload.id,
      title: 'sebuah thread',
      body: 'body thread',
      date: tgl,
      username: user.username,
    });
    const mockGetComments = [
      new GetComment({
        id: 'comment-123',
        content: 'sebuah comment',
        date: tgl,
        username: user.username,
        is_delete: 0,
      }),
      new GetComment({
        id: 'comment-124',
        content: 'sebuah comment',
        date: tgl,
        username: user.username,
        is_delete: 1,
      }),
    ];
    const expectedGetComments = [
      new GetComment({
        id: 'comment-123',
        content: 'sebuah comment',
        date: tgl,
        username: user.username,
        is_delete: 0,
      }),
      new GetComment({
        id: 'comment-124',
        content: '**komentar telah dihapus**',
        date: tgl,
        username: user.username,
        is_delete: 1,
      }),
    ];
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    /** mocking needed function */
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetComments));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new GetThread({
        id: useCasePayload.id,
        title: 'sebuah thread',
        body: 'body thread',
        date: tgl,
        username: user.username,
      })));
    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    mockGetThread.comments = expectedGetComments.map((c) => new GetComment(c));

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toStrictEqual(mockGetThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockGetThread.id);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(mockGetThread.id);
  });

  it('should orchestrating the get thread action correctly without comments', async () => {
    // Arrange
    const user = {
      id: 'user-123',
      username: 'dicoding',
    };
    const useCasePayload = {
      id: 'thread-123',
    };
    const mockGetThread = new GetThread({
      id: useCasePayload.id,
      title: 'sebuah thread',
      body: 'body thread',
      date: tgl,
      username: user.username,
    });
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    /** mocking needed function */
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetThread));
    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toStrictEqual(new GetThread({
      id: useCasePayload.id,
      title: 'sebuah thread',
      body: 'body thread',
      date: tgl,
      username: user.username,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockGetThread.id);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(mockGetThread.id);
  });
});