import { arrayBufferToBase64, base64ToArrayBuffer, formatAsPEM } from './utilities.js';

export default class Identity {
  private algorithm: RsaHashedKeyGenParams = {
    name: 'RSA-OAEP',
    modulusLength: 4096,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: 'SHA-256'
  };
  private uuid: string;
  private keyPair: Promise<CryptoKeyPair>;

  constructor(uuid?: string, keyPairBase64?: { publicKey: string, privateKey: string }) {
    this.uuid = uuid ?? crypto.randomUUID();

    if (keyPairBase64) {
      this.keyPair = this.loadKeyPair(keyPairBase64);
    } else {
      this.keyPair = this.generateRSAKeyPair();
    }
  }

  /* add param to select key */
  public async encrypt(str: string): Promise<string> {
    const encryptedBuffer = await crypto.subtle.encrypt(this.algorithm, (await this.keyPair).publicKey, new TextEncoder().encode(str));
    return arrayBufferToBase64(encryptedBuffer);
  }

  /* add param to select key */
  public async decrypt(base64: string): Promise<string> {
    const decryptBuffer = await crypto.subtle.decrypt(this.algorithm, (await this.keyPair).privateKey, base64ToArrayBuffer(base64));
    return new TextDecoder().decode(decryptBuffer);
  }

  private generateRSAKeyPair(): Promise<CryptoKeyPair> {
    return crypto.subtle.generateKey(this.algorithm, true, ['encrypt', 'decrypt']);
  }

  private async loadKeyPair(keyPairBase64: { publicKey: string, privateKey: string }): Promise<CryptoKeyPair> {
    const publicKey = await crypto.subtle.importKey('spki', base64ToArrayBuffer(keyPairBase64.publicKey), this.algorithm, true, ['encrypt']);
    const privateKey = await crypto.subtle.importKey('pkcs8', base64ToArrayBuffer(keyPairBase64.privateKey), this.algorithm, true, ['decrypt']);

    return { publicKey, privateKey };
  }

  public getUUID(): string {
    return this.uuid;
  }

  public async getPublicKey(): Promise<string> {
    const publicKeyArrayBuffer = await crypto.subtle.exportKey('spki', (await this.keyPair).publicKey);
    return arrayBufferToBase64(publicKeyArrayBuffer);
  }

  public async getPrivateKey(): Promise<string> {
    const publicKeyArrayBuffer = await crypto.subtle.exportKey('pkcs8', (await this.keyPair).privateKey);
    return arrayBufferToBase64(publicKeyArrayBuffer);
  }

  public async getKeyPair(): Promise<{ publicKey: string; privateKey: string; }> {
    return { publicKey: await this.getPublicKey(), privateKey: await this.getPrivateKey() };
  }
}