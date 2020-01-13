'use strict';
const dotenv = require('dotenv');
dotenv.config();

const Hoek = require('hoek');
const Manifest = require('./config/manifest');
const Glue = require('glue');

const composeOptions = {
    relativeTo: __dirname
};

async function startServer () {
    try {
        var server = await Glue.compose(Manifest.get('/'), composeOptions);
        await server.start();
        console.info(`Server started at ${ server.info.uri }`);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startServer();
