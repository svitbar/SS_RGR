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
    let serverRandom;
    let clientRandom;

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
                const decrypted = crypto.privateDecrypt(
                    {
                        key: privateKey,
                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                        oaepHash: "sha256",
                    },
                    Buffer.from(payload, 'base64')
                );
                console.log(`Received premaster from client: ${decrypted}`);

                const sessionKey = crypto.createHash('sha256')
                    .update(clientRandom + serverRandom + decrypted)
                    .digest('hex');
                
                console.log(`Generate session key: ${sessionKey}`);
                break;
            case 'READY':
                break;
            case 'MESSAGE':
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
