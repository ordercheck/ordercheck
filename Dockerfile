FROM node:12

RUN mkdir /app

WORKDIR /app

COPY package.json ./

RUN npm install 

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80