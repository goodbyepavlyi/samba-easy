const fs = require('node:fs');
const path = require('node:path');

module.exports = class Config {
    // ############
    // #  Config  #
    // ############
    async getConfig() {
        if (this.config) 
            return this.config;
        
        console.log('(Config) Loading configuration...');

        let config;
        try {
            config = fs.readFileSync(path.join('/config', 'config.json'), 'utf8');
            config = JSON.parse(config);
            
            console.log('(Config) Configuration loaded!');
        } catch (error) {
            config = {
                shares: {},
                clients: {},
            };
            
            console.log('(Config) Default configuration generated.');
        }

        this.__saveConfig(config);

        this.config = config;
    }

    async saveConfig() {
        const config = await this.getConfig();
        await this.__saveConfig(config);
    }

    async __saveConfig(config) {
        console.log('(Config) Saving configuration...');

        fs.writeFileSync(path.join('/config', 'config.json'), JSON.stringify(config, false, 2), { mode: 0o660, });

        console.log('(Config) Configuration saved!');
    }
}