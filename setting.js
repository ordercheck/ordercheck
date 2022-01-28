const { createServer } = require('./app.js');
const config = {
  port: 80,
};
const server = createServer(config);
const io = require('socket.io')(server);
const port = config.port;
server.listen(port, () => {
  console.log(config);
  console.log(`ORDERCHECK SERVER IS RUNNING ::: ${port}`);
});

module.exports = io;
