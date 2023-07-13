const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch balances for all symbols
    bitmusa
        .balance()
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Fetch balances for a specific symbol
    bitmusa
        .balance((symbol = "ETH/USDT"))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*

[
  {
    id: 5307,
    memberId: 83071,
    coin: {
      name: 'JUST',
      nameCn: 'JUST',
      unit: 'JST',
      status: 0,
      minTxFee: 50,
      maxTxFee: 50,
      cnyRate: 0,
      usdRate: 0.0164,
      enableRpc: 0,
      sort: 5,
      canSend: 1,
      canWithdraw: 1,
      canRecharge: 1,
      canTransfer: 0,
      canAutoWithdraw: 0,
      withdrawScale: 8,
      withdrawThreshold: 1,
      minWithdrawAmount: 100,
      maxWithdrawAmount: 10000,
      minRechargeAmount: 1e-8,
      isPlatformCoin: 1,
      isToken: 1,
      hasLegal: false,
      allBalance: null,
      coldWalletAddress: '',
      hotAllBalance: null,
      blockHeight: null,
      minerFee: null,
      infolink: '',
      information: 'JST',
      accountType: 0,
      depositAddress: null,
      memoAdjust: null,
      scanTxidWeburl: null,
      scanAddressWeburl: null,
      visible: 1,
      testMode: 0,
      networkCoins: null,
      icon: 'https://dev-static.teamneonex.com/image/coin/JST.svg',
      defaultIcon: 'https://dev-static.teamneonex.com/image/coin/default.svg',
      spotTradable: null
    },
    balance: 9900000101.8,
    frozenBalance: 100000000,
    lockedBalance: 0,
    address: '',
    version: 0,
    isLock: false
  },
  {
    id: 5286,
    memberId: 83071,
    coin: {
      name: 'ALPACA Finance',
      nameCn: 'ALPACA Finance',
      unit: 'ALPACA',
      status: 0,
      minTxFee: 0.3,
      maxTxFee: 0.3,
      cnyRate: 0,
      usdRate: 0.1683,
      enableRpc: 0,
      sort: 5,
      canSend: 1,
      canWithdraw: 1,
      canRecharge: 1,
      canTransfer: 0,
      canAutoWithdraw: 0,
      withdrawScale: 1,
      withdrawThreshold: 1,
      minWithdrawAmount: 0.6,
      maxWithdrawAmount: 2000000,
      minRechargeAmount: 1e-8,
      isPlatformCoin: 1,
      isToken: 1,
      hasLegal: false,
      allBalance: null,
      coldWalletAddress: '',
      hotAllBalance: null,
      blockHeight: null,
      minerFee: null,
      infolink: '',
      information: 'ALPACA',
      accountType: 0,
      depositAddress: null,
      memoAdjust: null,
      scanTxidWeburl: 'https://bscscan.com/tx/',
      scanAddressWeburl: 'https://bscscan.com/address/',
      visible: 1,
      testMode: 0,
      networkCoins: null,
      icon: 'https://dev-static.teamneonex.com/image/coin/ALPACA.svg',
      defaultIcon: 'https://dev-static.teamneonex.com/image/coin/default.svg',
      spotTradable: null
    },
    balance: 9999999957.7,
    frozenBalance: 0,
    lockedBalance: 0,
    address: '',
    version: 0,
    isLock: false
  },
  {
    id: 5310,
    memberId: 83071,
    coin: {
      name: 'MOBOX',
      nameCn: 'MOBOX',
      unit: 'MBOX',
      status: 0,
      minTxFee: 0.2,
      maxTxFee: 0.2,
      cnyRate: 0,
      usdRate: 0.244,
      enableRpc: 0,
      sort: 5,
      canSend: 1,
      canWithdraw: 1,
      canRecharge: 1,
      canTransfer: 0,
      canAutoWithdraw: 0,
      withdrawScale: 1,
      withdrawThreshold: 1,
      minWithdrawAmount: 0.4,
      maxWithdrawAmount: 2000000,
      minRechargeAmount: 1e-8,
      isPlatformCoin: 1,
      isToken: 1,
      hasLegal: false,
      allBalance: null,
      coldWalletAddress: '',
      hotAllBalance: null,
      blockHeight: null,
      minerFee: null,
      infolink: '',
      information: 'MBOX',
      accountType: 0,
      depositAddress: null,
      memoAdjust: null,
      scanTxidWeburl: 'https://bscscan.com/tx/',
      scanAddressWeburl: 'https://bscscan.com/address/',
      visible: 1,
      testMode: 0,
      networkCoins: null,
      icon: 'https://dev-static.teamneonex.com/image/coin/MBOX.svg',
      defaultIcon: 'https://dev-static.teamneonex.com/image/coin/default.svg',
      spotTradable: null
    },
    balance: 9900000033.6,
    frozenBalance: 100000000,
    lockedBalance: 0,
    address: '',
    version: 0,
    isLock: false
  }
]

{
  id: 5304,
  memberId: 83071,
  coin: {
    name: 'Ethereum',
    nameCn: 'Ethereum',
    unit: 'ETH',
    status: 0,
    minTxFee: 0.001,
    maxTxFee: 0.001,
    cnyRate: 0,
    usdRate: 1594.22,
    enableRpc: 1,
    sort: 2,
    canSend: 1,
    canWithdraw: 1,
    canRecharge: 1,
    canTransfer: 0,
    canAutoWithdraw: 0,
    withdrawScale: 6,
    withdrawThreshold: 1,
    minWithdrawAmount: 0.1,
    maxWithdrawAmount: 100,
    minRechargeAmount: 0.0001,
    isPlatformCoin: 1,
    isToken: 0,
    hasLegal: false,
    allBalance: null,
    coldWalletAddress: '',
    hotAllBalance: null,
    blockHeight: null,
    minerFee: null,
    infolink: '',
    information: 'ETH',
    accountType: 0,
    depositAddress: '0x7A8C7756B95C7370C52DE5604C88247BD84A1F75',
    memoAdjust: null,
    scanTxidWeburl: 'https://etherscan.io/tx/',
    scanAddressWeburl: 'https://etherscan.io/address/',
    visible: 1,
    testMode: 0,
    networkCoins: null,
    icon: 'https://dev-static.teamneonex.com/image/coin/ETH.svg',
    defaultIcon: 'https://dev-static.teamneonex.com/image/coin/default.svg',
    spotTradable: null
  },
  balance: 9899999999.9109,
  frozenBalance: 100000000,
  lockedBalance: 0,
  address: '',
  version: 0,
  isLock: false
}

*/
