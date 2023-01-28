const fs = require('node:fs');
const uuid = require('uuid');

const Config = require("./Config");
const Samba = require("./Samba");
const ServerError = require("./ServerError");

module.exports = class ShareManager {
    /**
     * 
     * @param {Samba} samba 
     * @param {Config} config 
     */
    constructor(samba, config) {
        this.samba = samba;
        this.config = config;

        this.shares = {};
    }

    async initialize() {
        const config = await this.config.getConfig();

        this.shares = config.shares;
    }

    async save() {
        this.config.config.shares = this.shares;
        await this.config.saveConfig();
        await this.samba.restartSamba();
    }

    /**
     * Returns an Array of shares
     * @returns {Array}
     */
    getShares() {
        return Object.entries(this.shares).map(([shareId, share]) => ({
            id: shareId,
            ...share
        }));
    }

    /**
     * Returns the Share
     * @param {Object} data
     * @param {String} data.name
     * @param {String} data.shareId 
     * @returns {Object}
     */
    async getShare({ shareId }) {
        const share = this.shares[shareId];
        if (!share) throw new ServerError(`Share Not Found: ${shareId}`, 404);

        return share;
    }

    /**
     * Returns the Share Samba Config
     * @param {Object} data
     * @param {String} data.shareId 
     * @returns {String}
     */
    async getSambaConfig({ shareId }) {
        const share = await this.getShare({ shareId });
        if (!share) return;

        let config = `
[${share.name}]
path = ${share.path}
browsable = ${share.toggleBrowsable ? 'yes' : 'no'}
read only = ${share.toggleReadOnly ? 'yes' : 'no'}
guest ok = ${share.toggleGuests ? 'yes' : 'no'}`;
        
        if (share.toggleVeto) config += `\nvfs objects = recycle\nrecycle:repository = .recycle\nrecycle:keeptree = yes\nrecycle:versions = yes`;
        if (share.toggleRecycle) config += `\nveto files = /._*/.apdisk/.AppleDouble/.DS_Store/.TemporaryItems/.Trashes/desktop.ini/ehthumbs.db/Network Trash Folder/Temporary Items/Thumbs.db/\ndelete veto files = yes`;
        if (share.advanced) config += advanced;

        return config;
    }

    /**
     * Creates a Share
     * @param {Object} data 
     * @param {String} data.shareId 
     * @param {String} data.name 
     * @param {String} data.password 
     * @returns {Object}
     */
    async createShare({ shareId, name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced }) {
        if (!name) throw new Error('Name is missing');
        if (!path) throw new Error('Path is missing');
        
        if (!shareId && Object.values(this.shares).filter(share => share.name === name).length) throw new ServerError('Share already exists!', 400)
        if (!fs.existsSync(path)) throw new ServerError('Path does not exist!', 400);

        shareId = shareId || uuid.v4();
        
        const share = {
            name,
            path,
            enabled: true,

            createdAt: new Date(),
            updatedAt: new Date(),

            toggleBrowsable,
            toggleReadOnly,
            toggleGuests,
            toggleVeto,
            toggleRecycle,
            
            advanced,
        };
    
        this.shares[shareId] = share;
        
        this.save();
        
        return share;
    }

    /**
     * Deletes a Share
     * @param {Object} data 
     * @param {String} data.shareId
     * @returns {Object}
     */
    async deleteShare({ shareId }) {
        const share = await this.getShare({ shareId });
        if (!share) return;

        delete this.shares[shareId];
        this.save();
    }

    /**
     * Enables share
     * @param {Object} data 
     * @param {Object} data.shareId
     * @returns {Object} 
     */
    async enableShare({ shareId }) {
        const share = await this.getShare({ shareId });
        if (!share) return;

        share.enabled = true;
        share.updatedAt = new Date();

        this.shares[shareId] = share;
        this.save();

        return share;
    }

    /**
     * Disables share
     * @param {Object} data 
     * @param {Object} data.shareId
     * @returns {Object} 
     */
    async disableShare({ shareId }) {
        const share = await this.getShare({ shareId });
        if (!share) return;

        share.enabled = false;
        share.updatedAt = new Date();

        this.shares[shareId] = share;
        this.save();

        return share;
    }
};