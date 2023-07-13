const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch Futures Tickers
    bitmusa
        .futuresTickers()
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*

{
  pk: '01H4ZJ0G061AJP46RDE2423SJY',
  ticker: 'BTCUSDT',
  base_price: 31003,
  high_price: 31003,
  low_price: 30524.1,
  last_price: 30524.1,
  mark_price: 30524.1,
  index_price: 30595.8209,
  funding_fee_rate: 0.0469,
  funding_time: 1688983200000,
  remaining_funding_time: 1811997,
  change_price: -478.9,
  change_rate: -1.5447,
  total_qty: 789.2899999999995,
  total_value: 24092864.93160001,
  last_updated_time: 1689121788003
}

*/
