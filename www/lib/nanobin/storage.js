import { formatAsPEM } from './utilities.js';
function getKeyPair() {
    const keyPair = localStorage.getItem('keyPair');
    if (keyPair) {
        return JSON.parse(keyPair);
    }
    else {
        console.error("[nanobin] Key 'keyPair' doesn't exist in storage.");
    }
}
export function getUUID() {
    const uuid = localStorage.getItem('uuid');
    if (uuid) {
        return uuid;
    }
    else {
        console.error("[nanobin] Key 'uuid' doesn't exist in storage.");
    }
}
export function getPublicKeyAsPEM() {
    const keyPair = getKeyPair();
    if (keyPair) {
        return formatAsPEM(keyPair.publicKey, 'PUBLIC');
    }
    else {
        console.error("[nanobin] Unable to retrieve public key.");
    }
}
export function getPrivateKeyAsPEM() {
    const keyPair = getKeyPair();
    if (keyPair) {
        return formatAsPEM(keyPair.privateKey, 'PRIVATE');
    }
    else {
        console.error("[nanobin] Unable to retrieve private key.");
    }
}
