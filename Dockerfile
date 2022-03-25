FROM mcr.microsoft.com/playwright:v1.15.0-focal

ENV PATH "$PATH:/root/home/node_modules/allure-commandline/bin"

WORKDIR /root/home/

COPY . .

RUN npm ci

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y openjdk-11-jre

CMD ["node", "restapi/test-api.js"]
