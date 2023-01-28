const fs = require('fs');
const path = require('path');

const debug = require('debug')('Samba');

const Config = require('./Config');
const Util = require('./Util');

const {
    SB_WORKGROUP,
    SB_SERVER_NAME,
    SB_FOLLOW_SYMLINKS,
    SB_LOG_LEVEL,
    SB_WIDE_LINKS,
    SB_HOSTS_ALLOW,
    SB_INTERFACES,
} = require('../config');

const ClientManager = require('./ClientManager');
const ShareManager = require('./ShareManager');

module.exports = class Samba {
    /**
     * @param {Config} config 
     */
    constructor(config) {
        this.config = config;
        this.clientManager = new ClientManager(this, config);
        this.shareManager = new ShareManager(this, config);

        this.initialize();
    }

    async initialize() {
        // Important: The client and share manager have to be initialized first
        await this.clientManager.initialize();
        await this.shareManager.initialize();

        await this.saveConfig();
        this.startSamba();
    }

    // #####################
    // #  Samba Functions  #
    // #####################
    async startSamba() {
        return Util.exec('/etc/init.d/smbd start');
    }
    
    async restartSamba() {
        await this.__saveConfig();  
        return Util.exec('/etc/init.d/smbd restart');
    }

    // ############
    // #  Config  #
    // ############
    async saveConfig() {
        this.config.saveConfig();
        this.__saveConfig();
    }

    async __saveConfig() {
        let samba = `
; Note: Do not edit this file directly.
; Your changes will be overwritten!

[global]
workgroup = ${SB_WORKGROUP}
server string = ${SB_SERVER_NAME}
server role = standalone server
server services = -dns, -nbt
server signing = default
server multi channel support = yes
log level = ${SB_LOG_LEVEL}
;log file = /usr/local/samba/var/log.%m
;max log size = 50
hosts allow = ${SB_HOSTS_ALLOW}
hosts deny = 0.0.0.0/0
security = user
guest account = nobody
pam password change = yes
map to guest = bad user
usershare allow guests = yes
create mask = 0664
force create mode = 0664
directory mask = 0775
force directory mode = 0775
follow symlinks = ${SB_FOLLOW_SYMLINKS}
wide links = ${SB_WIDE_LINKS}
unix extensions = no
printing = bsd
printcap name = /dev/null
disable spoolss = yes
disable netbios = yes
smb ports = 445
client ipc min protocol = default
client ipc max protocol = default
;wins support = yes
;wins server = w.x.y.z
;wins proxy = yes
dns proxy = no
socket options = TCP_NODELAY
strict locking = no
local master = no
winbind scan trusted domains = yes
vfs objects = fruit streams_xattr
fruit:metadata = stream
fruit:model = MacSamba
fruit:posix_rename = yes
fruit:veto_appledouble = no
fruit:wipe_intentionally_left_blank_rfork = yes
fruit:delete_empty_adfiles = yes
fruit:time machine = yes
${SB_INTERFACES ? `interfaces = ${SB_INTERFACES}\nbind interfaces only = yes` : ''}`;

        for (const [shareId, share] of Object.entries(this.shareManager.getShares())) {
            if (!(share.enabled && share.name && share.path))
                continue;

            samba += await this.shareManager.getSambaConfig({ shareId: share.id });
        }

        for (const [clientId, client] of Object.entries(this.clientManager.getClients())) {
            if (!client.enabled) {
                await Util.exec(`smbpasswd -x "${client.name}"`).catch(() => null);
                continue;
            }

            // Creating the group
            await Util.exec(`id -g "${client.uid}" &>/dev/null || id -gn "${client.name}" &>/dev/null || groupadd -f -g "${client.uid}" "${client.name}"`);
            
            // Creating the user
            await Util.exec(`id -u "${client.uid}" &>/dev/null || id -un "${client.name}" &>/dev/null || useradd -g "${client.uid}" -M -u "${client.uid}" "${client.name}"`);
            await Util.exec(`echo -e "${client.password}\\n${client.password}" | smbpasswd -a -s "${client.name}"`);
        }

        debug('Config saving...');

        fs.writeFileSync(path.join('/etc/samba', 'smb.conf'), samba, { mode: 0o600, });

        debug('Config saved.');
    }
};