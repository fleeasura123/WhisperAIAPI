const express = require('express');
const cors = require('cors');

const webApiPort = 21000;

global.g_app = express();

g_app.use(cors());

g_app.use((err, req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

require('./controllers/audio-controller');

g_app.listen(webApiPort, () => {
    console.log('WebAPI is listening on PORT: ' + webApiPort);
});

