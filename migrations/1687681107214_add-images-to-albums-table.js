/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('albums', {
    images: {
      type: 'TEXT',
      default: '',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'images');
};
