const mapDBAlbumToModel = ({
    id,
    name,
    year,
    created_at,
    updated_at,
}) => ({
    id,
    name,
    year,
    createdAt: created_at,
    updatedAt: updated_at,
});

const mapDBSongsToAlbum = ({

}) => ({

});

module.exports = {
    mapDBAlbumToModel,
    mapDBSongsToAlbum,
}