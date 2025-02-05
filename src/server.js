require('dotenv').config();

const Hapi = require("@hapi/hapi");
const init = async () => {
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
        if(response instanceof   fgfg  ) {
            const newResponse  = h.response({
                status: 'fail',
                message: response.message
            });
            newResponse.code(500);
            return newResponse;
        }
        // continue respone to next handler
        // this concept like ExpressJS middleware
        return h.continue
    });

    await server.start();
    console.log(`Server OpenMusic berjalan pada ${server.info.uri}`);
}

init();

