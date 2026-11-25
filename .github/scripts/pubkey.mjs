import { readFileSync } from 'node:fs';
import { hkdfSync, createPrivateKey, createPublicKey } from 'node:crypto';
const sa = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
const seed = Buffer.from(hkdfSync('sha256', sa.private_key, 'moda-enma', 'transport-v1', 32));
const priv = createPrivateKey({ key: Buffer.concat([Buffer.from('302e020100300506032b656e04220420', 'hex'), seed]), format: 'der', type: 'pkcs8' });
const pub = createPublicKey(priv).export({ type: 'spki', format: 'der' }).subarray(-32);
console.log('PUBKEY=' + pub.toString('hex'));
