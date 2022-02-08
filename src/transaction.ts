const blake2b = require('blake2b')
let nacl = require('tweetnacl')
const BigNumber = require('bignumber.js');
import {
    publicKeyFromPrivateKey, sigHash, transactionID
} from '../lib/lib.sc'


interface Input {
    address: string;
    txid: string;
    amount: string;
}

interface OutPut {
    address: string;
    amount: string;
}

interface SeriesData {
    inputs: Array<Input>;
    outputs: Array<OutPut>;
    fee: string
    decimal: number;
}

export async function signTransaction(params){
    const { txObj, privs } = params;

    if (!privs || privs.length === 0) {
        throw new Error('Must have private key.');
    }

    let transaction = { siacoininputs: new Array(), siacoinoutputs: new Array(), minerfees: new Array(), transactionsignatures: new Array() }

    const seriesData: SeriesData = txObj;

    let totalInputAmount = new BigNumber(0)
    let totalOutputAmount = new BigNumber(0)

    const inputs = seriesData.inputs.map(input => {
        const amount = BigNumber(input.amount).times(new BigNumber(10).pow(seriesData.decimal)).toFixed();
        if (amount.indexOf(".") !== -1) {
            throw new Error('input amount value invalid.');
        }
        let keyItem = privs.filter(function (fp) {
            return fp.address === input.address
        });
        totalInputAmount = new BigNumber(totalInputAmount).plus(new BigNumber(amount))
        console.log("ed25519:${publicKeyFromPrivateKey(keyItem[0].key)}===", publicKeyFromPrivateKey(keyItem[0].key))
        return {
            parentid: input.txid,
            unlockconditions: {
                publickeys: [ `ed25519:${publicKeyFromPrivateKey(keyItem[0].key)}` ],
                signaturesrequired: 1
            }
        }
    });
    for(let i = 0; i < inputs.length; i++ ) {
        transaction.siacoininputs.push(inputs[i])
    }
    const outputs = seriesData.outputs.map(output => {
        const amount = (new BigNumber(output.amount).times(new BigNumber(10).pow(seriesData.decimal))).toFixed()
        if (amount.indexOf(".") !== -1) {
            throw new Error('input amount value invalid.');
        }
        totalOutputAmount = new BigNumber(totalOutputAmount).plus(new BigNumber(amount))
        return {
            value: amount,
            unlockhash: output.address
        };
    });
    for(let i = 0; i < outputs.length; i++) {
        transaction.siacoinoutputs.push(outputs[i])
    }
    const calcFee = (new BigNumber(seriesData.fee).times(new BigNumber(10).pow(seriesData.decimal))).toFixed()
    transaction.minerfees.push(calcFee)
    const signs = seriesData.inputs.map(input => {
        let keyItem = privs.filter(function (fp) {
            return fp.address === input.address
        });
        let keypair = nacl.sign.keyPair.fromSecretKey(new Uint8Array(Buffer.from(keyItem[0].key, 'hex')))
        return {
            parentID: input.txid,
            publicKeyIndex: 0,
            coveredFields: { wholeTransaction: true },
            signature: Buffer.from(nacl.sign.detached(sigHash(transaction, input.txid, 0, 0), keypair.secretKey)).toString('base64')
        }
    });
    for(let i = 0; i < signs.length; i++) {
        transaction.transactionsignatures.push(signs[i])
    }
    return {
        "Hash": Buffer.from(transactionID(transaction)).toString('hex'),
        "transaction": JSON.stringify(transaction)
    }
}
