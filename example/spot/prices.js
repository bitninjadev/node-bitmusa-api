const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch the latest prices for all currency pairs
    bitmusa
        .prices((symbol = ""))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Fetch the latest price for a specific currency pair ("ETH/USDT")
    bitmusa
        .prices((symbol = "ETH/USDT"))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*
Sample output for prices():

[
  { symbol: 'BTC/USDT', close: 31498.65 },
  { symbol: 'ETH/USDT', close: 1594.22 },
  { symbol: 'TRX/USDT', close: 0.07782 },
  { symbol: 'MUSA/USDT', close: 100.375 },
  { symbol: 'EOS/USDT', close: 0.706 },
  { symbol: 'SOL/USDT', close: 23.07 },
  { symbol: 'BNB/USDT', close: 206 },
  { symbol: 'BNB/ETH', close: 0.1899 },
  { symbol: 'BNB/BTC', close: 0.012005 },
  { symbol: 'XRP/USDT', close: 0.5695 },
  { symbol: 'APT/USDT', close: 12.7383 },
  { symbol: 'BLUR/USDT', close: 0.5624 },
  { symbol: 'BAKE/USDT', close: 0.0835 },
  { symbol: 'CAKE/USDT', close: 3.361 },
  { symbol: 'SHIB/USDT', close: 0.00000556 },
  { symbol: 'VALOR/USDT', close: 0.2301 },
  { symbol: 'XVS/USDT', close: 3.6 },
  { symbol: 'TRV/USDT', close: 0.00539 },
  { symbol: 'TITAN/USDT', close: 0.0684 },
  { symbol: 'WOZX/USDT', close: 0.06032 },
  { symbol: 'SOFI/USDT', close: 0.0967 },
  { symbol: 'SAND/USDT', close: 0.6834 },
  { symbol: 'MVC/USDT', close: 0.003701 },
  { symbol: 'ALPACA/USDT', close: 0.1683 },
  { symbol: 'MIX/USDT', close: 0.0033 },
  { symbol: 'MBOX/USDT', close: 0.244 },
  { symbol: 'MATIC/USDT', close: 0.5375 },
  { symbol: 'JST/USDT', close: 0.0164 },
  { symbol: 'IQ/USDT', close: 0.00354 },
  { symbol: 'EGG/USDT', close: 0.0072 },
  { symbol: 'DVI/USDT', close: 0.02657 },
  { symbol: 'CHESS/USDT', close: 0.103 },
  { symbol: 'BTT/USDT', close: 7.5e-7 },
  { symbol: 'BIFI/USDT', close: 475.5 },
  { symbol: 'AUTO/USDT', close: 200 },
  { symbol: 'ASM/USDT', close: 0.01481 },
  { symbol: 'APM/USDT', close: 0.0178 }
]

Sample output for prices("ETH/USDT"):

1594.22

*/
