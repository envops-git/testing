FROM node:slim

ENV PATH "$PATH:/root/home/node_modules/allure-commandline/bin"

WORKDIR /root/home/

RUN apt install default-jre

COPY . .

RUN npm ci

CMD ["node", "testing-api.js"]