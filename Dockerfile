FROM node:16.14 AS builder
LABEL maintainer="Emeka C. Anyanwu, Center for Healthcare Innovation, Penn Medicine"

# git - dependency for NPM
RUN apt update && apt install -yq git && apt clean
RUN npm install -g npm@8.5.0

USER node

WORKDIR /server
COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .

WORKDIR /server

RUN npm run build

CMD ["npm", "run", "start:prod"]