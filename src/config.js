const { release } = require('./package.json');

module.exports.RELEASE = release;
module.exports.PORT = process.env.PORT || 7456;
module.exports.PASSWORD = process.env.PASSWORD;
module.exports.SB_WORKGROUP = process.env.SB_WORKGROUP || 'WORKGROUP';
module.exports.SB_SERVER_NAME = process.env.SB_SERVER_NAME || 'Samba';
module.exports.SB_FOLLOW_SYMLINKS = process.env.SB_FOLLOW_SYMLINKS || 'yes';
module.exports.SB_LOG_LEVEL = process.env.SB_LOG_LEVEL || 0;
module.exports.SB_WIDE_LINKS = process.env.SB_WIDE_LINKS || 'yes';
module.exports.SB_HOSTS_ALLOW = process.env.SB_HOSTS_ALLOW || '127.0.0.0/8 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16';
module.exports.SB_INTERFACES = process.env.INTERFACES || null;