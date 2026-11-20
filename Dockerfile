# peetzweg.com on Coolify: "Dockerfile" build pack, base directory "/", port 3000.
# Builds only apps/www (the rest of the workspace isn't part of the site) as a Node server
# and runs Nitro's bundled output, which needs no node_modules at runtime.

FROM node:24.22.1-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/www/package.json apps/www/
# The root postinstall builds libs/*, which the site doesn't use.
RUN pnpm install --frozen-lockfile --filter www... --ignore-scripts
COPY apps/www apps/www
RUN pnpm --filter www build

FROM node:24.22.1-alpine
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=build /repo/apps/www/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
