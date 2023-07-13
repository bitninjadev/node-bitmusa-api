const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch all tickers
    // This method returns a list of objects, each representing a ticker for a different currency pair
    bitmusa
        .tickers((symbol = ""))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Fetch a specific ticker
    // This method returns an object representing a ticker for the specified currency pair
    bitmusa
        .tickers((symbol = "ETH/USDT"))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*
Sample output for tickers():

[
  {
    symbol: 'ASM/USDT',
    open: 0.01481,
    high: 0.01481,
    low: 0,
    close: 0.01481,
    chg: 0,
    change: 0,
    volume: 0,
    turnover: 0,
    lastDayClose: 0.01481,
    usdRate: 0.01481,
    baseUsdRate: 1,
    zone: 0,
    baseCoinScale: 5
  },
  {
    symbol: 'APM/USDT',
    open: 0.0178,
    high: 0.0178,
    low: 0,
    close: 0.0178,
    chg: 0,
    change: 0,
    volume: 0,
    turnover: 0,
    lastDayClose: 0.0178,
    usdRate: 0.0178,
    baseUsdRate: 1,
    zone: 0,
    baseCoinScale: 5
  }
]

Sample output for tickers("ETH/USDT"):

{
  symbol: 'ETH/USDT',
  open: 1890.26,
  high: 2817.77,
  low: 1594.22,
  close: 1594.22,
  chg: -0.1567,
  change: -296.04,
  volume: 60.73,
  turnover: 121313.937776,
  lastDayClose: 1890.26,
  usdRate: 1594.22,
  baseUsdRate: 1,
  zone: 0,
  baseCoinScale: 2
}

*/
