const net = require('net');
const crypto = require('crypto');
const {encryptAES, decryptAES, encryptedRSA, decryptedRSA} = require('./utils');

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
    let serverRandom;
    let clientRandom;
    let sessionKey;

    socket.on('data', (data) => {
        const [type, payload] = data.toString().split('|');

        switch(type) {
            case 'HELLO':
                console.log(`Received hello from client: ${payload.toString()}`);
                clientRandom = payload.toString();

                serverRandom = crypto.randomBytes(8).toString('hex');
                const serverHello = `HELLO|Server hello: ${serverRandom} Public Key:\n${publicKey}`;
        
                socket.write(serverHello);
                console.log('Sent server hello and public key');
                break;
            case 'PREMASTER':
                const decrypted = decryptedRSA(Buffer.from(payload, 'base64'), privateKey)
                console.log(`Received premaster from client: ${decrypted}`);

                sessionKey = crypto.createHash('sha256')
                    .update(clientRandom + serverRandom + decrypted)
                    .digest();
                
                console.log(`Generate session key: ${sessionKey.toString('hex')}`);
                break;
            case 'READY':
                const decryptedReady = decryptAES(payload, sessionKey);
                console.log(`Receive from client: ${decryptedReady}`);

                const ready = 'Ready for connection from server';
                const encryptedReady = encryptAES(ready, sessionKey);
                console.log(`Encrypted ready: ${encryptedReady}`);
                socket.write(`READY|${encryptedReady}`);
                console.log('Sent ready message to client');

                console.log('Connection is set up. Handshaking over');
                break;
            case 'MESSAGE':
                const decryptedMes = decryptAES(payload, sessionKey);
                console.log(`Receive from client: ${decryptedMes}`);
                break;
            default:
                console.log(`Unexpected request: ${data}`);
        }
    });
  
    socket.on('end', () => {
      console.log('Client disconnected!');
    });
});
  
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
