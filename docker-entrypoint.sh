#!/bin/sh

# Ensure data directory exists and is writable
mkdir -p /app/data

# Fix ownership if running as root (e.g., when host volume is root-owned)
if [ "$(id -u)" = "0" ]; then
    chown -R nextjs:nodejs /app/data

    # Grant nextjs access to Docker socket by matching its group
    if [ -S /var/run/docker.sock ]; then
        SOCK_GID=$(stat -c '%g' /var/run/docker.sock)
        # Find or create a group with the socket's GID
        if ! getent group "$SOCK_GID" > /dev/null 2>&1; then
            addgroup -g "$SOCK_GID" -S dockersock
        fi
        SOCK_GROUP=$(getent group "$SOCK_GID" | cut -d: -f1)
        addgroup nextjs "$SOCK_GROUP" 2>/dev/null || true
    fi

    exec su-exec nextjs node server.js
else
    exec node server.js
fi
