# BUIDLER IMAGE
FROM node:16.14 AS builder
LABEL maintainer="Emeka C. Anyanwu, Center for Healthcare Innovation, Penn Medicine"

RUN npm install -g npm@8.5.0

USER node

WORKDIR /app
COPY --chown=node:node package*.json /app/
COPY --chown=node:node function/package*.json /app/function/
COPY --chown=node:node server/package*.json /app/server/

RUN npm ci

WORKDIR /app/server
COPY --chown=node:node server/* .
RUN npm run prisma:generate && npm run build

WORKDIR /app/function
COPY --chown=node:node function/* .

CMD ["npm", "run", "start:debug"]

# DEPLOY IMAGE
FROM node:16.14 AS deploy

# Install npm, zip, azure-cli
# azure-cli install as per: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt#option-2-step-by-step-installation-instructions
RUN npm install -g npm@8.5.0 && \    
    
    apt update && \
    apt install -yq ca-certificates curl apt-transport-https lsb-release gnupg zip && \

    curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null && \
    echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/azure-cli.list && \
    apt update && \
    apt install azure-cli && \

    apt clean

COPY --chown=node:node --from=builder /app /app

WORKDIR /app

RUN npm prune --production && \
    node /app/function/shim-functions.js && \

    zip -r /home/node/deploy_package.zip /app && \
    
    cp /app/function/entrypoint.sh /home/node/entrypoint.sh && \
    chmod +x /home/node/entrypoint.sh && \

    rm -rf /app

ENTRYPOINT /home/node/entrypoint.sh