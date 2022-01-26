FROM node:10.16.3

WORKDIR /node/app

COPY package.json ./

RUN apk update && apk add python make g++

RUN npm install 

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80