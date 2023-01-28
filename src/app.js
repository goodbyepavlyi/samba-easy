const Config = require('./lib/Config.js');
const Server = require('./lib/Server.js');
const Samba = require('./lib/Samba.js');

(async () => {
    const config = new Config();
    await config.getConfig();

    const samba = new Samba(config);
    const server = new Server(samba);
})()