const net = require('net');
const crypto = require('crypto');

const port = 8080;

const server = net.createServer((socket) => {
    console.log('Client connected!');  

    socket.on('data', (data) => {
        console.log(`Received data from client: ${data.toString()}`);
    });
  
    socket.on('end', () => {
      console.log('Client disconnected!');
    });
});
  
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
