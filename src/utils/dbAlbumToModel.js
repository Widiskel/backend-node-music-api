/* eslint-disable camelcase */
const mapDBAlbumToModel = ({
  id,
  name,
  year,
  images,
}) => ({
  id,
  name,
  year,
  coverUrl: images,
});

module.exports = { mapDBAlbumToModel };
