export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let out: string = '';
  let bytes: Uint8Array = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]);
  }

  return btoa(out);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  let out: string = atob(base64);
  let bytes: Uint8Array = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) {
    bytes[i] = out.charCodeAt(i);
  }

  return bytes.buffer;
}

export function formatAsPEM(keyStr: string, type: 'PUBLIC' | 'PRIVATE') {
  let pemString = `-----BEGIN ${type} KEY-----\n`;

  while (keyStr.length > 0) {
    pemString += keyStr.substring(0, 64) + '\n';
    keyStr = keyStr.substring(64);
  }

  pemString = pemString + `-----END ${type} KEY-----`;
  return pemString;
}