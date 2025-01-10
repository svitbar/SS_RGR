const net = require('net');
const crypto = require('crypto');

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
            const encrypted = crypto.publicEncrypt(
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha256",
                },
                Buffer.from(premaster, 'utf8')
            );
            client.write(`PREMASTER|${encrypted.toString('base64')}`);
            console.log('Sent premaster secret to server');      

            const sessionKey = crypto.createHash('sha256')
                .update(clientRandom + serverRandom + premaster)
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

client.on('end', () => {
  console.log('Disconnected from server!');
});
