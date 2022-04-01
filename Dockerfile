FROM node:bullseye

ENV PATH "$PATH:/root/home/node_modules/allure-commandline/bin"

WORKDIR /root/home/

COPY . .

RUN npm ci

CMD ["node", "api.js"]