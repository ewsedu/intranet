FROM node:10.14.0-alpine

MAINTAINER DerekYeung 466836531@qq.com

RUN apk --update add tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
RUN npm i --production --registry=https://registry.npm.taobao.org
ADD . /user/src/app
EXPOSE 8888

CMD npm run docker