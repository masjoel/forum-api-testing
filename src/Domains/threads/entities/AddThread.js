class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body, user_id } = payload;

    this.title = title;
    this.body = body;
    this.user_id = user_id;
  }

  _verifyPayload({ title, body, user_id: userId }) {
    if (!title || !body || !userId) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof userId !== 'string') {
      throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddThread;
