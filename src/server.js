require('dotenv').config();
const Hapi = require('@hapi/hapi');
// eslint-disable-next-line import/no-extraneous-dependencies
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const AlbumsValidator = require('./validator/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');

// playlists
const playlists = require('./api/playlists');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  const albumsService = new AlbumsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  // initalize server
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register({
    plugin: Jwt,
  });
  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // add extension to handle error handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    // TODO: Create Exception
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    // continue respone to next handler
    // this concept like ExpressJS middleware
    return h.continue;
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
  ]);
  await server.start();
  console.log(`Server OpenMusic berjalan pada ${server.info.uri}`);
};

init();
