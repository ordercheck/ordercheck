FROM node:12

WORKDIR /node/app

RUN npm install -g node-gyp && \
    node-gyp clean && \
    npm cache clean
    
COPY package.json ./

RUN npm install

COPY ./ ./

CMD ["npm", "run", "dev"]

EXPOSE 80