require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const AlbumsValidator = require('./validator/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const ClientError = require('./exceptions/ClientError');
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
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
  ]);
  await server.start();
  console.log(`Server OpenMusic berjalan pada ${server.info.uri}`);
};

init();
