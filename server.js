'use strict';

const { createServer } = require('./app.js');
const option = {
  port: 80,
};

const www = async (config = {}) => {
  const server = await createServer(config);
  const port = config.port;
  server.listen(port, () => {
    console.log(config);
    console.log(`ORDERCHECK SERVER IS RUNNING ::: ${port}`);
  });
};

www(option);
