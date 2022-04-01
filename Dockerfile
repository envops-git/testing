FROM node:slim

ENV PATH "$PATH:/root/home/node_modules/allure-commandline/bin"

WORKDIR /root/home/

RUN apt-get update

RUN apt-get install -y openjdk-11-jre

COPY . .

RUN npm ci

RUN npx playwright install-deps

CMD ["npx", "playwright", "install-deps", "&&", "node", "testing-api.js"]