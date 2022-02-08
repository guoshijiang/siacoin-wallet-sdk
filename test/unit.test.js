import {
    CreateAddress
} from "../src/address";
import {
    signTransaction
} from "../src/transaction";


describe('test encode public key to public key', () => {
    test('encode key to public key', async () => {
        let key = "ewXkuoLxIEQ3Sf9ez/KzaDpfvvn3cNjuCnNLH/Nuc88="
        let aa = new Uint8Array(Buffer.from(key, 'base64'))
        console.log(" publicKey=", Buffer.from(aa).toString('hex'))
    });
});

describe('CreateAddress()', () => {
    test('test create address', async () => {
        let addr = CreateAddress()
        console.log("address=", addr)
    });
});

describe('signTransaction()', ()=>{
    test('sign transaction test', async () => {
        let inputs = [
            {
                "address": "7da412dd1a658daa03a820e5841ad8e9595c0914e6cc8341b91685c501fb98449c82235a4ef6",
                "txid": "7c537aab197a82469eec89e04b8d9505edb5754bef39bd8f79d17ae5611de1f2",
                "amount": "0.17197",
            }
        ]
        let outputs = [
            {
                "address": "24fba5da3a337babe4cfd4bc0c556c5a50df9c180df3d72819efdf70968d52dc9b9731a89b9e",
                "amount": "0.01",
            },{
                "address": "7da412dd1a658daa03a820e5841ad8e9595c0914e6cc8341b91685c501fb98449c82235a4ef6",
                "amount": "0.06197",
            }
        ]
        const privKeys = [
            {
                address: "7da412dd1a658daa03a820e5841ad8e9595c0914e6cc8341b91685c501fb98449c82235a4ef6",
                key: "privateKey",
            }
        ];
        const params =  {
            txObj: {
                inputs: inputs,
                outputs: outputs,
                decimal: 24,
                fee: "0.1"
            },
            privs: privKeys
        }
        const tx_sign_msg = await signTransaction(params)
        console.log("tx_sign_msg ===", tx_sign_msg)
    });
});

