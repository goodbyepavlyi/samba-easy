const fs = require('node:fs');
const path = require('node:path');

const debug = require('debug')('Config');

module.exports = class Config {
    // ############
    // #  Config  #
    // ############
    async getConfig() {
        if (this.config) 
            return this.config;
        
        debug('Loading configuration...');

        let config;
        try {
            config = fs.readFileSync(path.join('/config', 'config.json'), 'utf8');
            config = JSON.parse(config);
            
            debug('Configuration loaded!');
        } catch (error) {
            config = {
                shares: {},
                clients: {},
            };
            
            debug('Default configuration generated.');
        }

        this.__saveConfig(config);

        this.config = config;
    }

    async saveConfig() {
        const config = await this.getConfig();
        await this.__saveConfig(config);
    }

    async __saveConfig(config) {
        debug('Saving configuration...');

        fs.writeFileSync(path.join('/config', 'config.json'), JSON.stringify(config, false, 2), { mode: 0o660, });

        debug('Configuration saved!');
    }
}