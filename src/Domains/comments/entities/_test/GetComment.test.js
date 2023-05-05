const GetComment = require('../GetComment');
const tgl =  new Date().toISOString();

describe('GetComment entities', () => {
  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const payload = {
      content: 'test',
    };
    // Action & Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload isDelete not contain needed property', async () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: tgl,
      username: 'username',
      is_delete: null,
    };
    const payload2 = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: tgl,
      username: 'username',
      is_delete: undefined,
    };

    // Action && Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new GetComment(payload2)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', async () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: tgl,
      username: 'username',
      is_delete: '1',
    };
    // Action & Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetComment object correctly', async () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: tgl,
      username: 'username',
      is_delete: 0,
    };
    // Action
    const { id, content, date, username, is_delete: isDelete } = new GetComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(isDelete).toEqual(payload.is_delete);
  });
  it('should create GetComment object correctly', async () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: '**komentar telah dihapus**',
      date: tgl,
      username: 'username',
      is_delete: 1,
    };
    // Action
    const { id, content, date, username, is_delete: isDelete } = new GetComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(isDelete).toEqual(payload.is_delete);
  });
});
