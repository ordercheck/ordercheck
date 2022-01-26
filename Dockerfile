FROM node:14.16-alpine

WORKDIR /app

COPY package.json ./

RUN npm install 

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80