const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'body thread',
        user_id: registeredUser.id,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addedThread = await threadRepositoryPostgres.addThread(addThread);
      
      const comment = {
        content: 'sebuah comment',
        thread_id: addedThread.id,
        user_id: registeredUser.id,
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(comment);

      // Assert
      const commentHelper = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(commentHelper).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);
      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'body thread',
        user_id: registeredUser.id,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addedThread = await threadRepositoryPostgres.addThread(addThread);
      const comment = {
        content: 'sebuah comment',
        thread_id: addedThread.id,
        user_id: registeredUser.id,
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(comment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: comment.content,
        user_id: registeredUser.id,
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should empty array when thread not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      const Comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
      expect(Comments.length).toEqual(0);
    });

    it('should return array of list comments when thread found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', user_id: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'content', thread_id: 'thread-123', user_id: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].content).toEqual('content');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].is_delete).toEqual(0);
      expect(comments[0]).toStrictEqual(new GetComment({
        id: 'comment-123',
        content: 'content',
        date: comments[0].date,
        username: 'dicoding',
        is_delete: 0,
      }));
    });

  });

  describe('verifyUsersComment function', () => {
    it('should throw error when user doesn\'t have action access for this comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', user_id: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', content: 'content', thread_id: 'thread-123', user_id: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyUsersComment('comment-123', 'user-12345')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when user doesn\'t have action access for this comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', user_id: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', content: 'content', thread_id: 'thread-123', user_id: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyUsersComment('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentById function', () => {
    it('should throw error when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return detail of comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', user_id: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', content: 'content', thread_id: 'thread-123', user_id: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');

      // Assert
      expect(comment).toStrictEqual(new GetComment({
        id: 'comment-123',
        content: 'content',
        date: comment.date,
        username: 'dicoding',
        is_delete: 0,
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should throw error when comment cannot be delete', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-123')).rejects.toThrowError(InvariantError);
    });

    it('should return true and not found comment if the comment has been delete', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', user_id: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', content: 'content', thread_id: 'thread-123', user_id: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const deleteComment = await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const threadComment = await CommentsTableTestHelper.findCommentsByIdWitFalseIsDelete('comment-123');
      expect(deleteComment).toEqual(true);
      expect(threadComment).toHaveLength(0);
    });
  });

  describe('verifyFoundCommentById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(commentRepositoryPostgres.verifyFoundCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', user_id: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', user_id: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(commentRepositoryPostgres.verifyFoundCommentById('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });
});