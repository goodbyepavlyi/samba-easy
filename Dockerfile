FROM docker.io/library/node:19 AS build_node_modules

# Create App Directory
COPY src/ /app/
WORKDIR /app
RUN npm ci --production

# Copy build result to a new image.
# This saves a lot of disk space.
FROM docker.io/library/node:19
COPY --from=build_node_modules /app /app

# Move node_modules one directory up, so during development
# we don't have to mount it in a volume.
# This results in much faster reloading!
#
# Also, some node_modules might be native, and
# the architecture & OS of your development machine might differ
# than what runs inside of docker.np
RUN mv /app/node_modules /node_modules

# Install Linux packages
# RUN apk --no-cache --no-progress upgrade && \
#     apk --no-cache --no-progress add bash samba shadow tini tzdata && \
#     rm -rf /tmp/*
RUN apt update && \
    apt install -y bash samba tini tzdata && \
    rm -rf /tmp/*

# Expose Ports
EXPOSE 7456 139 445

# Run Application
WORKDIR /app
ENTRYPOINT ["node", "app.js"]

HEALTHCHECK --interval=30s --timeout=10s \
  CMD smbclient -L \\localhost -U % -m SMB3