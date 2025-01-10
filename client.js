const net = require('net');
const crypto = require('crypto');

const host = 'localhost';
const port = 8080;

const client = new net.Socket();

client.connect(port, host, () => {
  console.log('Connected to server!');

    const randomHello = crypto.randomBytes(8).toString('hex');
    console.log(`Client hello: ${randomHello}`);

    client.write(randomHello);
});

client.on('end', () => {
  console.log('Disconnected from server!');
});
