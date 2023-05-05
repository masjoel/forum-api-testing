const AddedComment = require('../AddedComment');

describe('AddedComment entities', () => {
  it('should throw error when payload not contain neede property', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
    };
    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when paylod did not meet data type specifiation', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: [],
      user_id: 'user-123',
    };
    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      user_id: 'user-123',
    };
    // Action
    const { id, content, owner } = new AddedComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.user_id);
  });
});
