# DEVELOPMENT IMAGE
FROM node:16.14 AS development
LABEL maintainer="Emeka C. Anyanwu, Center for Healthcare Innovation, Penn Medicine"

# git - dependency for NPM
# RUN apt update && apt install -yq git && apt clean

RUN npm install -g npm@8.5.0

USER node

WORKDIR /app
COPY --chown=node:node package*.json /app/
COPY --chown=node:node server/package*.json /app/server/
COPY --chown=node:node web/package*.json /app/web/

RUN npm ci

WORKDIR /app/server
COPY --chown=node:node server .

RUN npm run prisma:generate

WORKDIR /app/web
COPY --chown=node:node web .

# overwrite index.html with the tempalted version before building
RUN cp index.html.template index.html && npm run build

CMD ["npm", "run", "dev"]


# PRODUCTION IMAGE
FROM nginx:1.21.3 AS production

WORKDIR /app/web
COPY --chown=node:node --from=development /app/web/dist .

# install node and envsub
RUN apt-get update && apt-get install -y curl gnupg2 && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g envsub
COPY --chown=node:node docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=node:node web/index.html.template /app/web/index.html.template
COPY --chown=node:node web/package.json /app/web/package.json
COPY --chown=node:node web/entrypoint.sh /app/web/entrypoint.sh
RUN chmod +x /app/web/entrypoint.sh

CMD ["/bin/sh", "-c", "/app/web/entrypoint.sh && nginx -g \"daemon off;\""]