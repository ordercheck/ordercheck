const { createServer } = require('./app.js');
const config = {
  port: 80,
};
const server = createServer(config);

const io = require('socket.io')(server);
server.app.set('io', io);

const port = config.port;
server.listen(port, () => {
  console.log(`ORDERCHECK SERVER IS RUNNING ::: ${port}`);
});

module.exports = io;
