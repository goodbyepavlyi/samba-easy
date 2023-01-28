/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

'use strict';

class API {
    // #######################
    // #  API Call Function  #
    // #######################
    async call({ method, path, body }) {
        const res = await fetch(`./api${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
                ? JSON.stringify(body)
                : undefined,
        });

        if (res.status === 204) return undefined;

        const json = await res.json();

        if (!res.ok) throw new Error(json.error || res.statusText);

        return json;
    }

    // #######################
    // #  General API Calls  #
    // #######################
    async getRelease() {
        return this.call({
            method: 'get',
            path: '/release',
        });
    }

    // #######################
    // #  Session API Calls  #
    // #######################
    async getSession() {
        return this.call({
            method: 'get',
            path: '/session',
        });
    }

    async createSession({ password }) {
        return this.call({
            method: 'post',
            path: '/session',
            body: { password },
        });
    }

    async deleteSession() {
        return this.call({
            method: 'delete',
            path: '/session',
        });
    }

    // #####################
    // #  Share API Calls  #
    // #####################
    async getShares() {
        return this.call({
            method: 'get',
            path: '/samba/share',
        }).then(shares => shares.map(share => ({
            ...share,
            createdAt: new Date(share.createdAt),
            updatedAt: new Date(share.updatedAt),
        })));
    }

    async createShare({ name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced }) {
        return this.call({
            method: 'post',
            path: '/samba/share',
            body: { name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced },
        });
    }

    async deleteShare({ shareId }) {
        return this.call({
            method: 'delete',
            path: `/samba/share/${shareId}`,
        });
    }

    async editShare({ shareId, name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced }) {
        return this.call({
            method: 'put',
            path: `/samba/share/${shareId}/edit/`,
            body: { name, path, toggleBrowsable, toggleReadOnly, toggleGuests, toggleVeto, toggleRecycle, advanced },
        });
    }

    async enableShare({ shareId }) {
        return this.call({
            method: 'post',
            path: `/samba/share/${shareId}/enable`,
        });
    }

    async disableShare({ shareId }) {
        return this.call({
            method: 'post',
            path: `/samba/share/${shareId}/disable`,
        });
    }

    // ######################
    // #  Client API Calls  #
    // ######################
    async getClients() {
        return this.call({
            method: 'get',
            path: '/samba/client',
        }).then(clients => clients.map(client => ({
            ...client,
            createdAt: new Date(client.createdAt),
            updatedAt: new Date(client.updatedAt),
        })));
    }

    async createClient({ name, password }) {
        return this.call({
            method: 'post',
            path: '/samba/client',
            body: { name, password },
        });
    }

    async deleteClient({ clientId }) {
        return this.call({
            method: 'delete',
            path: `/samba/client/${clientId}`,
        });
    }

    async editClient({ clientId, name, password }) {
        return this.call({
            method: 'put',
            path: `/samba/client/${clientId}/edit/`,
            body: { clientId, name, password },
        });
    }

    async enableClient({ clientId }) {
        return this.call({
            method: 'post',
            path: `/samba/client/${clientId}/enable`,
        });
    }

    async disableClient({ clientId }) {
        return this.call({
            method: 'post',
            path: `/samba/client/${clientId}/disable`,
        });
    }
}
