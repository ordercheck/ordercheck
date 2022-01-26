FROM node:12

WORKDIR /node/app

COPY package.json ./

RUN npm install 

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80