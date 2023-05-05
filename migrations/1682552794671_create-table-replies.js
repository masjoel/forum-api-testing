/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('replies', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      thread_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      comment_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      content: {
        type: 'TEXT',
        notNull: true,
      },
      is_delete: {
        type: 'SMALLINT',
        default: 0,
        notNull: true,
      },
      date: {
        type: 'TIMESTAMP',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
    });
    pgm.addConstraint('replies', 'fk_replies.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
    pgm.addConstraint('replies', 'fk_replies.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
    pgm.addConstraint('replies', 'fk_replies.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  };
  
  exports.down = pgm => {
    pgm.dropTable('replies');
  }  