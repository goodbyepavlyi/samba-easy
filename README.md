## ⚠ This project has reached its end of life, and is now just preserved here for posterity.

# Samba Easy

[![Build & Publish Docker Image to Docker Hub](https://github.com/goodbyepavlyi/samba-easy/actions/workflows/docker-image.yml/badge.svg?branch=production)](https://github.com/goodbyepavlyi/samba-easy/actions/workflows/docker-image.yml)
[![Docker](https://img.shields.io/docker/v/goodbyepavlyi/samba-easy/latest)](https://hub.docker.com/r/goodbyepavlyi/samba-easy)
[![Docker](https://img.shields.io/docker/pulls/goodbyepavlyi/samba-easy.svg)](https://hub.docker.com/r/goodbyepavlyi/samba-easy)
![GitHub Stars](https://img.shields.io/github/stars/goodbyepavlyi/samba-easy)

<p align="center">
  <img src="./assets/ui.png" width="802" />
</p>

## Features

* All-in-one: Samba + Web UI.
* Easy installation, simple to use.
* List, create, edit, delete, enable & disable clients/shares.

## Requirements

* A host with Docker installed.

## Installation

### 1. Install Docker

If you haven't installed Docker yet, install it by running:

```bash
$ curl -sSL https://get.docker.com | sh
$ sudo usermod -aG docker $(whoami)
$ exit
```

And log in again.

### 2. Run Samba Easy

To automatically install & run samba-easy, simply run:

<pre>
$ docker run -d \
  --name=samba-easy \
  -e PASSWORD=<b>ADMIN_PASSWORD</b> \
  -v ~/.samba-easy:/config \
  -p 139:139 \
  -p 445:445 \
  -p 7456:7456 \
  --restart unless-stopped \
  goodbyepavlyi/samba-easy
</pre>

> 💡 Replace `ADMIN_PASSWORD` with a password to log in on the Web UI.

The Web UI will now be available on `http://0.0.0.0:7466`.

> 💡 Your configuration files will be saved in `~/.samba-easy`

## Options

These options can be configured by setting environment variables using `-e KEY="VALUE"` in the `docker run` command.

| Env | Default | Description |
| - | - | - |
| `PASSWORD` | - | When set, requires a password when logging in to the Web UI. |
| `PORT` | `7456` | Port for accessing the Web UI. |
| `SB_WORKGROUP` | `WORKGROUP` | NT-Domain-Name or Workgroup-Name. |
| `SB_SERVER_NAME` | `Samba` | Server string is the equivalent of the NT Description field. |
| `SB_FOLLOW_SYMLINKS` | `yes` | Allows to follow symlinks. |
| `SB_LOG_LEVEL` | `0` | Clients IP address range. |
| `SB_WIDE_LINKS` | `yes` | Controls whether or not links in the UNIX file system may be followed by the server. |
| `SB_HOSTS_ALLOW` | `127.0.0.0/8 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16` | Set of hosts which are permitted to access a service. |
| `SAMBA_INTERFACES` | - | Allows you to override the default network interfaces list. |

> If you change `PORT`, make sure to also change the exposed port.
>
> More info: https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html

## Updating
 
To update to the latest version, simply run:

```bash
docker stop samba-easy
docker rm samba-easy
docker pull goodbyepavlyi/samba-easy
```

And then run the `docker run -d \ ...` command above again.

## Credit
* https://github.com/WeeJeWel/wg-easy
