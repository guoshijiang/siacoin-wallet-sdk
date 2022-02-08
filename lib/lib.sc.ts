const BigNumber = require('bignumber.js');
const blake2b = require('blake2b');
const nacl = require('tweetnacl');

export function publicKeyFromPrivateKey (privateKey) {
    let keypair = nacl.sign.keyPair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, 'hex')))
    return Buffer.from(keypair.publicKey).toString('hex')
}

function encodeOutput(output) {
    return Buffer.concat([
        encodeCurrency(output.value),
        Buffer.from(output.unlockhash, 'hex').slice(0, 32)
    ]);
}

function encodeCurrency(c) {
    let hex = new BigNumber(c).toString(16)
    if (hex === '0') {
        hex = ''
    } else if (hex.length % 2 != 0) {
        hex = '0' + hex
    }
    return Buffer.concat([
        encodeInt(hex.length / 2),
        Buffer.from(hex, 'hex')
    ])
}

function encodeInput(input) {
    return Buffer.concat([
        Buffer.from(input.parentid, 'hex'),
        encodeUnlockConditions(input.unlockconditions)
    ]);
}

function encodeUnlockConditions(uc) {
    return Buffer.concat([
        encodeInt(uc.timelock),
        encodeInt(1),
        encodePublicKey(uc.publickeys[0]),
        encodeInt(uc.signaturesrequired)
    ]);
}

function encodePublicKey(pk) {
    let [alg, key] = pk.split(':')
    let algBuf = Buffer.alloc(16)
    algBuf.write(alg)
    return Buffer.concat([
        algBuf,
        encodeInt(key.length / 2),
        Buffer.from(key, 'hex')
    ])
}

function encodeInt(n) {
    const buf = Buffer.alloc(8)
    buf.writeInt32LE(n)
    return buf
}

export function sigHash(txn, parentid, keyIndex, timelock) {
    return blake2b(32).update(Buffer.concat([
        encodeInt(txn.siacoininputs.length),
        Buffer.concat(txn.siacoininputs.map(si => Buffer.concat([
            Buffer.from([1]),
            encodeInput(si)
        ]))),
        encodeInt(txn.siacoinoutputs.length),
        Buffer.concat(txn.siacoinoutputs.map(encodeOutput)),
        encodeInt(0),
        encodeInt(0),
        encodeInt(0),
        encodeInt(0),
        encodeInt(0),
        encodeInt(txn.minerfees.length),
        Buffer.concat(txn.minerfees.map(encodeCurrency)),
        encodeInt(0),
        Buffer.from(parentid, 'hex'),
        encodeInt(keyIndex),
        encodeInt(timelock)
    ])).digest()
}

export function transactionID(txn) {
    return blake2b(32).update(Buffer.concat([
        encodeInt(txn.siacoininputs.length),
        Buffer.concat(txn.siacoininputs.map(si => encodeInput(si))),
        encodeInt(txn.siacoinoutputs.length),
        Buffer.concat(txn.siacoinoutputs.map(encodeOutput)),
        encodeInt(0),
        encodeInt(0),
        encodeInt(0),
        encodeInt(0),
        encodeInt(0),
        encodeInt(txn.minerfees.length),
        Buffer.concat(txn.minerfees.map(encodeCurrency)),
        encodeInt(0)
    ])).digest();
}

export function deriveAddressPublicKey(publicKey) {
    if (publicKey?.length !== 32) {
        throw new Error('invalid public key')
    }
    let Algorithm = 'ed25519'
    let buf = new Uint8Array(65).fill(0)
    for (let i = 0; i < Algorithm.length; i++) {
        buf[i + 1] = Algorithm.charCodeAt(i)
    }
    buf[17] = publicKey.length
    for (let i = 0; i < publicKey.length; i++) {
        buf[i + 25] = publicKey[i]
    }
    let pubkeyHash = blake2b(32).update(buf.slice(0, 57)).digest()
    const timelockhash = [
        0x51, 0x87, 0xb7, 0xa8, 0x02, 0x1b, 0xf4, 0xf2,
        0xc0, 0x04, 0xea, 0x3a, 0x54, 0xcf, 0xec, 0xe1,
        0x75, 0x4f, 0x11, 0xc7, 0x62, 0x4d, 0x23, 0x63,
        0xc7, 0xf4, 0xcf, 0x4f, 0xdd, 0xd1, 0x44, 0x1e
    ]
    const sigsrequiredHash = [
        0xb3, 0x60, 0x10, 0xeb, 0x28, 0x5c, 0x15, 0x4a,
        0x8c, 0xd6, 0x30, 0x84, 0xac, 0xbe, 0x7e, 0xac,
        0x0c, 0x4d, 0x62, 0x5a, 0xb4, 0xe1, 0xa7, 0x6e,
        0x62, 0x4a, 0x87, 0x98, 0xcb, 0x63, 0x49, 0x7b
    ]
    buf[0] = 0x01
    for (let i = 0; i < timelockhash.length; i++) {
        buf[i + 1] = timelockhash[i]
    }
    for (let i = 0; i < pubkeyHash.length; i++) {
        buf[i + 33] = pubkeyHash[i]
    }
    let tlpkHash = blake2b(32).update(buf).digest()
    for (let i = 0; i < tlpkHash.length; i++) {
        buf[i + 1] = tlpkHash[i]
    }
    for (let i = 0; i < sigsrequiredHash.length; i++) {
        buf[i + 33] = sigsrequiredHash[i]
    }
    let unlockhashArr = blake2b(32).update(buf).digest()
    let unlockhash = blake2b(32).update(buf).digest('hex')
    let checksum = blake2b(32).update(unlockhashArr).digest('hex')
    let address = unlockhash + checksum.slice(0, 12)
    return address;
}