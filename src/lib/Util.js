const debug = require('debug')('Util');
const childProcess = require('child_process');

module.exports = class Util {
    static async exec(cmd, { log = true, } = {}) {
        if (typeof log === 'string')
            // eslint-disable-next-line no-console
            debug(`$ ${log}`);
        else if (log === true)
            // eslint-disable-next-line no-console
            debug(`$ ${cmd}`);

        if (process.platform !== 'linux')
            return '';

        return new Promise((resolve, reject) => {
            childProcess.exec(cmd, { shell: 'bash', }, (err, stdout) => {
                if (err) return reject(err);

                return resolve(String(stdout).trim());
            });
        });
    }

};