FROM node:10.16.3

WORKDIR /node/app

COPY package.json ./

RUN apt-get install build-essential

RUN npm install 

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80