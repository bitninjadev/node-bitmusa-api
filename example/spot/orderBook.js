const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch order book
    bitmusa
        .orderBook((symbol = "ETH/USDT"))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*

{
  ask: {
    direction: 'SELL',
    maxAmount: 0,
    minAmount: 0,
    highestPrice: 0,
    lowestPrice: 0,
    symbol: 'ETH/USDT',
    items: []
  },
  bid: {
    direction: 'BUY',
    maxAmount: 10,
    minAmount: 10,
    highestPrice: 2090,
    lowestPrice: 2000,
    symbol: 'ETH/USDT',
    items: [ [Object], [Object], [Object] ]
  }
}

*/
