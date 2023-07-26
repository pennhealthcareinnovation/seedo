# DEVELOPMENT IMAGE
FROM node:18.12.1 AS development
LABEL maintainer="Emeka C. Anyanwu, Center for Healthcare Innovation, Penn Medicine"

USER node

WORKDIR /app/server
COPY --chown=node:node server/package*.json /app/server/

RUN npm ci

COPY --chown=node:node server .

RUN npm run prisma:generate &&\
    npm run build:nest

CMD ["npm", "run", "start:debug"]

# PRODUCTION IMAGE
FROM node:16.14 AS production
WORKDIR /app/server
RUN npm install -g npm@8.5.0
USER node
COPY --chown=node:node --from=development /app /app
RUN npm prune --production
CMD ["npm", "run", "start:prod"]