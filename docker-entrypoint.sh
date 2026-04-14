#!/bin/sh

# Ensure data directory exists and is writable
mkdir -p /app/data

# Fix ownership if running as root (e.g., when host volume is root-owned)
if [ "$(id -u)" = "0" ]; then
    chown -R nextjs:nodejs /app/data
    # Allow nextjs user to access Docker socket if mounted
    if [ -S /var/run/docker.sock ]; then
        chown nextjs:nodejs /var/run/docker.sock
    fi
    exec su-exec nextjs node server.js
else
    exec node server.js
fi
