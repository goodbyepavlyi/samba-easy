/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-new */

'use strict';

new Vue({
    el: '#app',
    data: {
        page: "clients",
        isDark: null,
        error: null,
        deletePopUp: null,

        // ####################
        // #  Authentication  #
        // ####################
        authentication: {
            authenticated: null,
            authenticating: false,
            requiresPassword: null,
        },

        loginPage: {
            password: null,
            error: null,
        },
        
        // ###########
        // #  Share  #
        // ###########
        shares: null,
        sharePopUp: null,
        
        // ############
        // #  Client  #
        // ############
        clients: null,
        clientPopUp: null,
        
        // #############
        // #  Release  #
        // #############
        currentRelease: null,
        latestRelease: null,
    },
    methods: {
        dateTime: (value) => {
            return new Intl.DateTimeFormat(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }).format(value);
        },

        toggleTheme() {
            if (this.isDark) {
                localStorage.theme = "light";
                document.documentElement.classList.remove('dark');
            } else {
                localStorage.theme = "dark";
                document.documentElement.classList.add('dark');
            }

            this.isDark = !this.isDark;
        },

        async refresh() {
            if (!this.authentication.authenticated) return;

            this.clients = await this.api.getClients();
            this.shares = await this.api.getShares();
        },

        // Session
        login(event) {
            event.preventDefault();

            if (!this.loginPage.password || this.authentication.authenticating) return;

            this.authentication.authenticating = true;
            this.api.createSession({ password: this.loginPage.password, })
                .then(async () => {
                    const session = await this.api.getSession();

                    this.authentication.authenticated = session.authenticated;
                    this.authentication.requiresPassword = session.requiresPassword;

                    return this.refresh();
                })
                .catch(error => {
                    this.loginPage.error = (error.message || error.toString());
                    setTimeout(() => this.loginPage.error = null, 5000);
                })
                .finally(() => {
                    this.authentication.authenticating = false;
                    this.password = null;
                });
        },
        logout(event) {
            event.preventDefault();

            this.api.deleteSession()
                .then(() => {
                    this.authentication.authenticated = false;
                    this.clients = null;
                })
                .catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                });
        },
        
        // ########################
        // #  UI Based Functions  #
        // ########################
        
        // Changes page
        changePage(page) {
            this.page = page;
        },

        // Closes the Delete Pop-Up
        closeDeletePopUp() {
            this.deletePopUp = null;
        },

        // #####################
        // #  Share Functions  #
        // #####################

        createShare(share) {
            const { name, path } = share;
            if (!(name || path)) return;

            this.api.createShare(share)
                .then(() => this.closeSharePopUp())
                .catch(error => {
                    share.error = (error.message || error.toString())
                    setTimeout(() => share.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        deleteShare(share) {
            const { id: shareId } = share;
            if (!(shareId)) return;

            this.api.deleteShare({ shareId })
                .then(() => this.closeDeletePopUp())
                .catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        editShare(share) {
            const { id: shareId, name, path } = share;
            if (!(shareId || name || path)) return;

            this.api.editShare({ ...share, shareId })
                .then(() => this.closeSharePopUp())
                .catch(error => {
                    share.error = (error.message || error.toString())
                    setTimeout(() => share.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        enableShare(share) {
            const { id: shareId } = share;
            if (!(shareId)) return;

            this.api.enableShare({ shareId })
                .catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        disableShare(share) {
            const { id: shareId } = share;
            if (!(shareId)) return;

            this.api.disableShare({ shareId })
                .catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        // ###################
        // #  Share Pop-Ups  #
        // ###################
        
        // Create
        openSharePopUp(share) {
            if (share) share.edit = true;
            this.sharePopUp = share || {
                toggleBrowsable: true,
            };
        },
        closeSharePopUp() {
            this.sharePopUp = null;
        },

        // Delete
        openShareDeletePopUp(share) {
            share.type = "share";
            share.title = "Share";
            this.deletePopUp = share;
        },

        // ####################
        // #  Client Pop-Ups  #
        // ####################
        
        // Create Pop-Up
        openClientPopUp(client) {
            if (client) client.edit = true;
            this.clientPopUp = client || {};
        },
        closeClientPopUp() {
            this.clientPopUp = null;
        },

        openClientDeletePopUp(client) {
            client.type = "client";
            client.title = "Client";
            this.deletePopUp = client;
        },

        // ######################
        // #  Client Functions  #
        // ######################

        createClient(client) {
            const { name, password } = client;
            if (!(name || password)) return;

            this.api.createClient(client)
                .then(() => this.closeClientPopUp())
                .catch(error => {
                    client.error = (error.message || error.toString())
                    setTimeout(() => client.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        deleteClient(client) {
            const { id: clientId } = client;
            if (!(clientId)) return;

            this.api.deleteClient({ clientId })
                .then(() => this.closeDeletePopUp())
                .catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        editClient(client) {
            const { id: clientId, name, password } = client;
            if (!(clientId || name || password)) return;

            this.api.editClient({ ...client, clientId })
                .then(() => this.closeClientPopUp())
                .catch(error => {
                    client.error = (error.message || error.toString())
                    setTimeout(() => client.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        enableClient(client) {
            const { id: clientId } = client;
            if (!(clientId)) return;

            this.api.enableClient({ clientId })
                .catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },

        disableClient(client) {
            const { id: clientId } = client;
            if (!(clientId)) return;

            this.api.disableClient({ clientId })
                .catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                })
                .finally(() => this.refresh().catch(console.error));
        },
    },
    filters: {
        timeago: value => {
            return timeago().format(value);
        },
    },
    mounted() {
        this.isDark = (localStorage.theme === 'dark' ? true : false);

        this.api = new API();
        this.api.getSession()
            .then(session => {
                this.authentication.authenticated = session.authenticated;
                this.authentication.requiresPassword = session.requiresPassword;
                
                this.refresh().catch(error => {
                    this.error = (error.message || error.toString());
                    setTimeout(() => this.error = null, 5000);
                });
            })
            .catch(error => {
                this.error = (error.message || error.toString());
                setTimeout(() => this.error = null, 5000);
            });

        setInterval(() => {
            this.refresh().catch(console.error);
        }, 1000);

        Promise.resolve().then(async () => {
            const currentRelease = await this.api.getRelease();
            const latestRelease = await fetch('https://goodbyepavlyi.github.io/samba-easy/changelog.json')
                .then(res => res.json())
                .then(releases => {
                    const releasesArray = Object.entries(releases).map(([version, changelog]) => ({
                        version: parseInt(version, 10),
                        changelog,
                    }));
                    releasesArray.sort((a, b) => {
                        return b.version - a.version;
                    });

                    return releasesArray[0];
                });

            console.log(`Current Release: ${currentRelease}`);
            console.log(`Latest Release: ${latestRelease.version}`);

            if (currentRelease >= latestRelease.version) return;

            this.currentRelease = currentRelease;
            this.latestRelease = latestRelease;
        }).catch(console.error);
    },
});
