import { arrayBufferToBase64, base64ToArrayBuffer } from './utilities.js';
export default class Identity {
    algorithm = {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256'
    };
    uuid;
    keyPair;
    constructor(uuid, keyPairBase64) {
        this.uuid = uuid ?? crypto.randomUUID();
        if (keyPairBase64) {
            this.keyPair = this.loadKeyPair(keyPairBase64);
        }
        else {
            this.keyPair = this.generateRSAKeyPair();
        }
    }
    /* add param to select key */
    async encrypt(str) {
        const encryptedBuffer = await crypto.subtle.encrypt(this.algorithm, (await this.keyPair).publicKey, new TextEncoder().encode(str));
        return arrayBufferToBase64(encryptedBuffer);
    }
    /* add param to select key */
    async decrypt(base64) {
        const decryptBuffer = await crypto.subtle.decrypt(this.algorithm, (await this.keyPair).privateKey, base64ToArrayBuffer(base64));
        return new TextDecoder().decode(decryptBuffer);
    }
    generateRSAKeyPair() {
        return crypto.subtle.generateKey(this.algorithm, true, ['encrypt', 'decrypt']);
    }
    async loadKeyPair(keyPairBase64) {
        const publicKey = await crypto.subtle.importKey('spki', base64ToArrayBuffer(keyPairBase64.publicKey), this.algorithm, true, ['encrypt']);
        const privateKey = await crypto.subtle.importKey('pkcs8', base64ToArrayBuffer(keyPairBase64.privateKey), this.algorithm, true, ['decrypt']);
        return { publicKey, privateKey };
    }
    getUUID() {
        return this.uuid;
    }
    async getPublicKey() {
        const publicKeyArrayBuffer = await crypto.subtle.exportKey('spki', (await this.keyPair).publicKey);
        return arrayBufferToBase64(publicKeyArrayBuffer);
    }
    async getPrivateKey() {
        const publicKeyArrayBuffer = await crypto.subtle.exportKey('pkcs8', (await this.keyPair).privateKey);
        return arrayBufferToBase64(publicKeyArrayBuffer);
    }
    async getKeyPair() {
        return { publicKey: await this.getPublicKey(), privateKey: await this.getPrivateKey() };
    }
}
