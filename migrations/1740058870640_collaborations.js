/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // memberikan foreign key pada playlsit terhadap kolom id dari tabel playlist
  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');

  // memberikan foreign key pada user terhadap kolom id dari tabel users
  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id');
  pgm.dropConstraint('collaborations', 'fk_collaborations.user_id_users.id');
  pgm.dropTable('collaborations');
};
