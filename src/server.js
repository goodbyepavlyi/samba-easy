require('./services/Server.js');

const WireGuard = require('./services/WireGuard.js');

WireGuard.getConfig().catch(err => {
    console.error(err);

    process.exit(1);
});
