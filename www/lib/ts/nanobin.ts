import Identity from './identity.js';

export let identity: Identity;

const uuid = localStorage.getItem('uuid');
const keyPair = localStorage.getItem('keyPair');

if (uuid && keyPair) {
  console.info('[nanobin] Loaded existing identity from storage.');
  identity = new Identity(uuid, JSON.parse(keyPair) as { publicKey: string, privateKey: string });
} else {
  console.info('[nanobin] Created new identity.');
  identity = new Identity();

  localStorage.setItem('uuid', crypto.randomUUID());
  identity.getKeyPair().then((keyPair) => {
    localStorage.setItem('keyPair', JSON.stringify(keyPair));
  });
}