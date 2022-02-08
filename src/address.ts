const blake2b = require('blake2b');
const nacl = require('tweetnacl');
import {
    deriveAddressPublicKey
} from '../lib/lib.sc'


export function CreateAddress() {
    const keypair = nacl.sign.keyPair();
    return {
        "PublicKey": Buffer.from(keypair.publicKey).toString('hex'),
        "PrivateKey": Buffer.from(keypair.secretKey).toString('hex'),
        "Address":  deriveAddressPublicKey(keypair.publicKey).toString('hex')
    }
}