const path = require('path');

const express = require('express');
const expressSession = require('express-session');

const { PORT, RELEASE, PASSWORD } = require('../config');
const ServerError = require('./ServerError');
const Samba = require('./Samba');

module.exports = class Server {
    /**
     * 
     * @param {Samba} samba 
     */
    constructor(samba) {
        this.samba = samba;

        this.app = express()
            .disable('etag')
            .use('/', express.static(path.join(__dirname, '..', 'www')))
            .use(express.json())
            .use(expressSession({
                secret: String(Math.random()),
                resave: true,
                saveUninitialized: true,
            }))

            .get('/api/release', (this.respond(async () => {
                return RELEASE;
            })))

            // ####################
            // #  Authentication  #
            // ####################
            .get('/api/session', this.respond(async req => {
                const requiresPassword = !!process.env.PASSWORD;
                const authenticated = requiresPassword 
                    ? !!(req.session && req.session.authenticated) 
                    : true;

                return {
                    requiresPassword,
                    authenticated,
                };
            }))
            .post('/api/session', this.respond(async req => {
                const { password } = req.body;

                if (typeof password !== 'string')
                    throw new ServerError('Missing: Password', 401);

                if (password !== PASSWORD)
                    throw new ServerError('Incorrect Password', 401);

                req.session.authenticated = true;
                req.session.save();

                console.log(`(Server) New Session: ${req.session.id}`);
            }))
            .delete('/api/session', this.respond(async req => {
                const sessionId = req.session.id;

                req.session.destroy();

                console.log(`(Server) Deleted Session: ${sessionId}`);
            }))
            .use((req, res, next) => {
                if (!PASSWORD) return next();

                if (req.session && req.session.authenticated) return next();

                return res.status(401).json({
                    error: 'Not Logged In',
                });
            })

            // ###########
            // #  Share  #
            // ###########
            .get('/api/samba/share', this.respond(async req => {
                return this.samba.shareManager.getShares();
            }))
            .post('/api/samba/share', this.respond(async req => {
                const { name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced } = req.body;

                return this.samba.shareManager.createShare({ name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced });
            }))
            .delete('/api/samba/share/:shareId', this.respond(async req => {
                const { shareId } = req.params;

                return this.samba.shareManager.deleteShare({ shareId });
            }))
            .put('/api/samba/share/:shareId/edit', this.respond(async req => {
                const { shareId } = req.params;
                const { name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced } = req.body;

                return this.samba.shareManager.createShare({ shareId, name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced });
            }))
            .post('/api/samba/share/:shareId/enable', this.respond(async req => {
                const { shareId } = req.params;

                return this.samba.shareManager.enableShare({ shareId });
            }))
            .post('/api/samba/share/:shareId/disable', this.respond(async req => {
                const { shareId } = req.params;

                return this.samba.shareManager.disableShare({ shareId });
            }))

            // ############
            // #  Client  #
            // ############
            .get('/api/samba/client', this.respond(async req => {
                return this.samba.clientManager.getClients();
            }))
            .post('/api/samba/client', this.respond(async req => {
                const { name, password } = req.body;

                return this.samba.clientManager.createClient({ name, password });
            }))
            .delete('/api/samba/client/:clientId', this.respond(async req => {
                const { clientId } = req.params;

                return this.samba.clientManager.deleteClient({ clientId });
            }))
            .put('/api/samba/client/:clientId/edit', this.respond(async req => {
                const { clientId } = req.params;
                const data = req.body;

                return this.samba.clientManager.createClient({ ...data, clientId });
            }))
            .post('/api/samba/client/:clientId/enable', this.respond(async req => {
                const { clientId } = req.params;

                return this.samba.clientManager.enableClient({ clientId });
            }))
            .post('/api/samba/client/:clientId/disable', this.respond(async req => {
                const { clientId } = req.params;

                return this.samba.clientManager.disableClient({ clientId });
            }))

            .listen(PORT, () => {
                console.log(`(Server) Listening on http://0.0.0.0:${PORT}`);
            });
    }

    respond(callback) {
        return function (req, res) {
            Promise.resolve()
                .then(async () => callback(req, res))
                .then(result => {
                    if (res.headersSent) 
                        return;

                    if (typeof result === 'undefined') 
                        return res.status(204).end();

                    return res.status(200).json(result);
                })
                .catch(error => {
                    if (typeof error === 'string')
                        error = new Error(error);

                    // eslint-disable-next-line no-console
                    console.error(error);

                    return res
                        .status(error.statusCode || 500)
                        .json({
                            error: error.message || error.toString(),
                            stack: error.stack,
                        });
                });
        }
    }
};