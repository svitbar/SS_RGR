const net = require('net');
const crypto = require('crypto');

const host = 'localhost';
const port = 8080;

const client = new net.Socket();

client.connect(port, host, () => {
  console.log('Connected to server!');

    const randomHello = crypto.randomBytes(8).toString('hex');
    console.log(`Sent client hello`);

    client.write(randomHello);
});

client.on('data', (data) => {
    const serverResponse = data.toString();
    console.log(`Received data from server: ${serverResponse}`);

    if (serverResponse.includes('Public Key:')) {
        const publicKey = serverResponse.split('Public Key:')[1].trim();
    }
});

client.on('end', () => {
  console.log('Disconnected from server!');
});
