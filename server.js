const express = require('express');
const next = require('next');
// const {createProxyMiddleware} = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

console.log('Starting server...');

app.prepare().then(() => {
    console.log('App prepared, setting up express...');
    const server = express();
    const port = process.env.PORT || 3000;

    server.set('trust proxy', 1);

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
    server.use((req, res, next) => {
        const host = req.header('host');

        if (!dev && req.header('x-forwarded-proto') !== 'https') {
            res.redirect(301, `https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });
});
