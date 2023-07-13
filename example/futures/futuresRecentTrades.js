const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch Futures Recent Trades
    bitmusa
        .futuresRecentTrades((symbol = "BTCUSDT"))
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
    ticker: 'BTCUSDT',
    price: '30526.3000000000000000',
    qty: '0.2490000000000000',
    value: '7601.0487000000000000',
    position: 0,
    traded_time: 1689069317093
  },
  {
    ticker: 'BTCUSDT',
    price: '30526.2000000000000000',
    qty: '0.0010000000000000',
    value: '30.5262000000000000',
    position: 0,
    traded_time: 1689069317090
  }
]

*/
