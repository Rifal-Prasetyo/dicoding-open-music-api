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
  pgm.createTable('user_album_likes', {
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // constraint foreign key user_id terhadap id pada kolom users
  pgm.addConstraint('user_album_likes', 'fk.user_album_likes.user_id_user.id', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');

  // constraint foreign key album_id terhadap id pada kolom albums
  pgm.addConstraint('user_album_likes', 'fk.user_album_likes.album_id_albums.id', 'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // hapus contraint dari tabel user_album_likes
  pgm.dropConstraint('user_album_likes', 'fk.user_album_likes.user_id_user.id');
  pgm.dropConstraint('user_album_likes', 'fk.user_album_likes.album_id_albums.id');

  pgm.dropTable('user_album_likes');
};
