const uuid = require('uuid');

const Config = require("./Config");
const Samba = require("./Samba");
const ServerError = require("./ServerError");
const Util = require('./Util');

module.exports = class ClientManager {
    /**
     * 
     * @param {Samba} samba 
     * @param {Config} config 
     */
    constructor(samba, config) {
        this.samba = samba;
        this.config = config;

        this.clients = {};
    }

    async initialize() {
        const config = await this.config.getConfig();

        this.clients = config.clients;
    }

    async save() {
        this.config.config.clients = this.clients;
        await this.config.saveConfig();
        await this.samba.restartSamba();
    }

    /**
     * Returns an Array of clients
     * @returns {Array}
     */
    getClients() {
        return Object.entries(this.clients).map(([clientId, client]) => ({
            id: clientId,
            ...client
        }));
    }

    /**
     * Returns the Client
     * @param {Object} data
     * @param {String} data.name
     * @param {String} data.clientId
     * @returns {Object}
     */
    async getClient({ clientId }) {
        const client = this.clients[clientId];
        if (!client) throw new ServerError(`Client Not Found: ${clientId}`, 404);

        return client;
    }

    /**
     * Creates a Client
     * @param {Object} data 
     * @param {String} data.clientId 
     * @param {String} data.name 
     * @param {String} data.password 
     * @returns {Object}
     */
    async createClient({ clientId, name, password }) {
        if (!name) throw new Error('Missing: Name');
        if (!password) throw new Error('Missing: Password');
        
        if (!clientId && Object.values(this.clients).some(client => client.name == name)) 
            throw new ServerError('User already exists!', 400)

        const client = await this.getClient({ clientId })
            .then(data => ({
                ...data,
                name,
                password
            }))
            .catch(error => {
                if (!error.message.startsWith("Client Not Found")) return;

                const uid = Math.floor(Math.random() * (5000 - 4000 + 1) + 4000);
                
                return {
                    name,
                    enabled: true,
                    uid,
                    password,
                    mounts: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            });

        if (!clientId) 
            clientId = uuid.v4();
    
        this.clients[clientId] = client;
        
        this.save();
        
        return client;
    }

    /**
     * Deletes a Client
     * @param {Object} data 
     * @param {String} data.clientId 
     * @returns {Object}
     */
    async deleteClient({ clientId }) {
        const client = await this.getClient({ clientId });
        if (!client) return;

        await this.__deleteClient(client);

        delete this.clients[clientId];
        this.save();
    }

    async __deleteClient(client) {
        await Util.exec(`smbpasswd -x "${client.name}"`).catch(() => null);
        await Util.exec(`userdel -f "${client.name}"`);
        await Util.exec(`groupdel -f "${client.name}"`);
    }

    /**
     * Enables client
     * @param {Object} data 
     * @param {Object} data.clientId
     * @returns {Object} 
     */
    async enableClient({ clientId }) {
        const client = await this.getClient({ clientId });
        if (!client) return;

        client.enabled = true;
        client.updatedAt = new Date();

        this.clients[clientId] = client;
        this.save();

        return client;
    }

    /**
     * Disables client
     * @param {Object} data 
     * @param {Object} data.clientId
     * @returns {Object} 
     */
    async disableClient({ clientId }) {
        const client = await this.getClient({ clientId });
        if (!client) return;

        client.enabled = false;
        client.updatedAt = new Date();

        this.clients[clientId] = client;
        this.save();

        return client;
    }
};