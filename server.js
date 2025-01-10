const net = require('net');
const crypto = require('crypto');

const port = 8080;

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',       
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

const server = net.createServer((socket) => {
    console.log('Client connected!');  

    socket.on('data', (data) => {
        console.log(`Received data from client: ${data.toString()}`);

        const randomHelloServer = crypto.randomBytes(8).toString('hex');
        const serverHello = `Server hello: ${randomHelloServer} Public Key:\n${publicKey}`;
        console.log('Sent server hello and public key')

        socket.write(serverHello);
    });
  
    socket.on('end', () => {
      console.log('Client disconnected!');
    });
});
  
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
