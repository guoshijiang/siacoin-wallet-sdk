## Siacoin Wallet NodeJs SDK

### 1. Introduce(描述)

This is the NodeJs library code of a Siacoin wallet, including address generation and transaction offline signature. The `address.ts` is the address generation code, the `transaction.ts` code is the signature code, and the code in `lib.sc` is the Siacoin underlying address generation algorithm and signature. Algorithm encapsulation.

这个是一个 Siacoin 钱包的 NodeJs 库代码，包含了地址的生成和离线签名，address 里面是地址生成的代码，transaction 里面的代码是签名的代码，lib.sc 里面的代码是 Siacoin 底层地址生成算法和签名算法的封装。


### 2. Why I write this lib(为什么写这么一个代码库)

The Siacoin chain is relatively second-hand, and I have to complain about this chain. Many modules in the open source go code are unstable, such as: explore, broadcast transactions will not return Hash, and the SDK of the official Js wallet has not been completed. The community is not very perfect. It is not convenient for wallet developers to quickly access.

For more than these reasons, I decided to write an open source codebase for everyone to use.

Siacoin 这个链比较二逼，这里不得不吐槽一下这个链，开源的 go 代码里面很多模块不稳定，例如：explore，广播交易不会返回 Hash, 没有完成的官方 Js 钱包的 SDK，社区不是很完善，不便于钱包开发人员快速接入。

基于不止以上这些原因，我决定写一个开源的代码库供大家使用。


### 3. How use it(怎么使用它)

#### 3.1 Install dependencies(安装依赖)

```angular2html
npm install
```

Then go directly to `unit.test.js` and execute it to see the effect
然后直接去 unit.test.js 里面执行看效果


# 让同行少走弯路
