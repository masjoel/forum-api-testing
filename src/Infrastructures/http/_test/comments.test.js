const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persist comment with same user', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding',
        password: 'secret-password',
        fullname: 'Dicoding Indonesia',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      //--- Comment ---
      const requestPayload = {
        content: 'sebuah comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 201 and persist comment with different user', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding123',
        password: 'secret-password',
        fullname: 'Dicoding 123',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      //--- Add user ---
      const requestPayloadUserTom = {
        username: 'dicoding111',
        password: 'secret-password',
        fullname: 'Dicoding 111',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUserTom,
      });
      //--- Login user ---
      const responseAuthsTom = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUserTom.username,
          password: requestPayloadUserTom.password,
        },
      });
      const responseJsonAuthTom = JSON.parse(responseAuthsTom.payload);
      const { accessToken: accessTokenTom } = responseJsonAuthTom.data;
      //--- Comment ---
      const requestPayload = {
        content: 'sebuah comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessTokenTom}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding',
        password: 'secret-password',
        fullname: 'Dicoding Indonesia',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      //--- Comment ---
      const requestPayload = {
        content_fake: 'sebuah comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding',
        password: 'secret-password',
        fullname: 'Dicoding Indonesia',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      //--- Comment ---
      const requestPayload = {
        content: 12345,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 404 when request payload comment with not thread data', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding',
        password: 'secret-password',
        fullname: 'Dicoding Indonesia',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      const threadId = 'fakethreadid-123';
      //--- Comment ---
      const requestPayload = {
        content: 'sebuah comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 401 when request doesn\'t have authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah thread',
        thread_id: 'thread-123',
        user_id: 'user-123',
      };
      const threadId = 'fakethreadid-123';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when user has access (authorization) to delete comment', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding',
        password: 'secret-password',
        fullname: 'Dicoding Indonesia',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      //--- Comment ---
      const requestPayloadComment = {
        content: 'sebuah comment',
      };
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayloadComment,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonComment = JSON.parse(responseComment.payload);
      const { addedComment } = responseJsonComment.data;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when user has no access (authorization) to delete comment', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding123',
        password: 'secret-password',
        fullname: 'Dicoding 123',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      //--- Add user ---
      const requestPayloadUserTom = {
        username: 'dicoding111',
        password: 'secret-password',
        fullname: 'Dicoding 111',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUserTom,
      });
      //--- Login user ---
      const responseAuthsTom = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUserTom.username,
          password: requestPayloadUserTom.password,
        },
      });
      const responseJsonAuthTom = JSON.parse(responseAuthsTom.payload);
      const { accessToken: accessTokenTom } = responseJsonAuthTom.data;
      //--- Comment ---
      const requestPayloadComment = {
        content: 'sebuah comment',
      };
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayloadComment,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonComment = JSON.parse(responseComment.payload);
      const { addedComment } = responseJsonComment.data;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessTokenTom}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding',
        password: 'secret-password',
        fullname: 'Dicoding Indonesia',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      const commentIdFake = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${commentIdFake}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 401 when request doesn\'t have authentication', async () => {
      // Arrange
      const server = await createServer(container);
      //--- Add user ---
      const requestPayloadUser = {
        username: 'dicoding',
        password: 'secret-password',
        fullname: 'Dicoding Indonesia',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayloadUser,
      });
      //--- Login user ---
      const responseAuths = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestPayloadUser.username,
          password: requestPayloadUser.password,
        },
      });
      const responseJsonAuth = JSON.parse(responseAuths.payload);
      const { accessToken } = responseJsonAuth.data;
      //--- Thread ---
      const requestPayloadThread = {
        title: 'sebuah thread',
        body: 'body thread',
      };
      const responseThreads = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonThread = JSON.parse(responseThreads.payload);
      const { addedThread } = responseJsonThread.data;
      //--- Comment ---
      const requestPayloadComment = {
        content: 'sebuah comment',
      };
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestPayloadComment,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJsonComment = JSON.parse(responseComment.payload);
      const { addedComment } = responseJsonComment.data;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
