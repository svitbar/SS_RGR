const crypto = require('crypto');

const encryptAES = (plaintext, key) => {
    const cipher = crypto.createCipheriv('aes-256-ctr', key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
};

const decryptAES = (cipherText, key) => {
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

const encryptedRSA = (plainText, publicKey) => crypto.publicEncrypt(
    {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
    Buffer.from(plainText, 'utf8')
);

const decryptedRSA = (encryptedText, privateKey) => crypto.privateDecrypt(
    {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
    encryptedText
);

module.exports = { encryptAES, decryptAES, encryptedRSA, decryptedRSA };
