FROM node:8.12-alpine

RUN apk add g++ make python

RUN mkdir /app

WORKDIR /app

COPY package.json ./

RUN npm install 

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80