FROM node:16.13-alpine3.13 AS builder
LABEL maintainer="Emeka C. Anyanwu, Center for Healthcare Innovation, Penn Medicine"

# git, openssh - dependencies for NPM
RUN apk --no-cache add git openssh
RUN npm install -g npm@6

WORKDIR /server
COPY package*.json ./
RUN npm ci

COPY . .

WORKDIR /server

RUN npm run build

CMD ["npm", "run", "start:prod"]