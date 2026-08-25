# The slot's whole runtime: node + pnpm, and nothing else. The source is bind-
# mounted rather than copied, so this image is rebuilt only when the node or
# pnpm version changes — not when the app does.
#
# Debian rather than Alpine on purpose: pnpm installs platform-specific native
# binaries (rollup, oxlint, tailwind's oxide), and the host runs glibc. A musl
# image would resolve a different set and refuse to start against a node_modules
# installed on the host.
FROM node:22-slim

RUN corepack enable

# uid/gid 1000 is `ehsan` on the host, so files the container writes into the
# bind mount (node_modules, .vite) stay owned by you.
USER node
WORKDIR /app

ENV PNPM_HOME=/home/node/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
