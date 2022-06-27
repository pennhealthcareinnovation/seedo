# BUIDLER IMAGE
FROM node:16.14 AS builder
LABEL maintainer="Emeka C. Anyanwu, Center for Healthcare Innovation, Penn Medicine"

RUN npm install -g npm@8.5.0 && apt update && apt install -yq zip

USER node

WORKDIR /app
COPY --chown=node:node package*.json /app/
COPY --chown=node:node function/package*.json /app/function/
COPY --chown=node:node server/package*.json /app/server/

RUN npm ci

WORKDIR /app/server
COPY --chown=node:node server .
RUN npm run prisma:generate

WORKDIR /app/function
COPY --chown=node:node function .
RUN npm run build

WORKDIR /app
RUN npm prune --production && \
    node /app/function/shim-functions.js && \
    cp /app/function/host.json . && \
    zip -r /app/deploy_package.zip .

# DEPLOY IMAGE
FROM mcr.microsoft.com/azure-cli:2.9.1 AS deploy
WORKDIR /root
COPY --from=builder /app/function/deploy.sh \ 
                    /app/deploy_package.zip \
                    ./
RUN chmod +x /root/deploy.sh
CMD /root/deploy.sh