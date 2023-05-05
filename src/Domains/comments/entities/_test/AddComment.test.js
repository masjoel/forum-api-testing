const AddComment = require('../AddComment');

describe('AddComment entities', () => {
  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const payload = {
      content: 'test',
    };
    // Action & Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw when payload did not meet data type specification', async () => {
    // Arrange
    const payload = {
      content: [],
      thread_id: 11111,
      user_id: 'user-123',
    };
    // Action & Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', async () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
      thread_id: 'thread-123',
      user_id: 'user-123',
    };
    // Action
    const { content, thread_id: threadId, user_id: userId } = new AddComment(payload);
    // Assert
    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.thread_id);
    expect(userId).toEqual(payload.user_id);
  });
});
