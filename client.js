const net = require('net');
const crypto = require('crypto');
const {encryptAES, decryptAES, encryptedRSA, decryptedRSA} = require('./utils');

const host = 'localhost';
const port = 8080;

const client = new net.Socket();
let randomHello;

client.connect(port, host, () => {
  console.log('Connected to server!');

    randomHello = crypto.randomBytes(8).toString('hex');
    console.log(`Sent client hello`);

    client.write(`HELLO|${randomHello}`);
});

let sessionKey;

client.on('data', (data) => {
    const [type, payload] = data.toString().split('|');
    let publicKey;
    const clientRandom = randomHello;
    let serverRandom;
    let premaster;

    switch(type) {
        case 'HELLO':
            const serverResponse = payload.toString();
            console.log(`Received hello from server: ${serverResponse}`);
        
            if (serverResponse.includes('Public Key:')) {
                publicKey = serverResponse.split('Public Key:')[1].trim();
            }

            if (serverResponse.includes('Server hello:')) {
                serverRandom = serverResponse.split('Server hello:')[1].split(' Public Key:')[0].trim();
            }

            premaster = crypto.randomBytes(48).toString('hex');
            console.log(`Created premaster: ${premaster}`);
            const encrypted = encryptedRSA(premaster, publicKey);
            client.write(`PREMASTER|${encrypted.toString('base64')}`);
            console.log('Sent premaster secret to server');      

            sessionKey = crypto.createHash('sha256')
                .update(clientRandom + serverRandom + premaster)
                .digest();

            console.log(`Generate session key: ${sessionKey.toString('hex')}`);
            const ready = `Ready for connection from client`;
            const encryptedReady = encryptAES(ready, sessionKey);
            console.log(`Encrypted ready: ${encryptedReady}`);
            client.write(`READY|${encryptedReady}`);
            console.log('Sent ready message to server');
            break;
        case 'READY':
            const decryptedReady = decryptAES(payload, sessionKey);
            console.log(`Receive from server: ${decryptedReady}`);

            console.log('Connection is set up. Handshaking over');

            const mes = `Message from client!`;
            const encryptedMes = encryptAES(mes, sessionKey);
            client.write(`MESSAGE|${encryptedMes}`);
            console.log('Sent message to server');
            break;
        case 'MESSAGE':
            break;
        default:
            console.log(`Unexpected request: ${data}`);
    }
});

client.on('end', () => {
  console.log('Disconnected from server!');
});
