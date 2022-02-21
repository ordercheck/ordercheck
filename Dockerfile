FROM node:14.18.3

WORKDIR /app

COPY package.json ./

RUN npm install node-gyp@8.4.1

RUN npm install 

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80