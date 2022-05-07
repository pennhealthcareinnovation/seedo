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

RUN npm ci

WORKDIR /app/server
COPY --chown=node:node server/* .

RUN npm run prisma:generate && npm run build

CMD ["npm", "run", "start:debug"]

# PRODUCTION IMAGE
FROM node:16.14 AS production
RUN npm install -g npm@8.5.0
USER node
COPY --chown=node:node --from=development /app /app
RUN npm prune --production
CMD ["npm", "run", "start:prod"]