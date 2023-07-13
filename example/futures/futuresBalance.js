const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch Futures Balance
    bitmusa
        .futuresBalance("USDT")
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*

{
  symbol: 'USDT',
  total_wallet_balance: 9999993.74717648,
  total_margin_balance: 9999994.69874898,
  total_available_balance: 9741547.83460004,
  total_unpnl: 0.9515725,
  position: [
    {
      position: 0,
      entry_price: 30526.32501176,
      margin_gap: 0,
      id: 16,
      status: 0,
      liquid_price: 152.63162506,
      close_fee: 0,
      ticker: 'BTCUSDT',
      bankruptcy_price: 0,
      take_profit_price: 0,
      member_id: 83071,
      coin_symbol: 'BTC',
      initial_margin: 198421.11257644,
      entry_time: '2023-07-11T10:04:44',
      base_symbol: 'USDT',
      maintenance_margin: 992.10556288,
      stop_loss_price: 0,
      close_time: null,
      leverage: 1,
      liquid_margin: 30373.6933867,
      adl: 0,
      ticker_id: 1,
      qty: 6.5,
      position_margin: 198421.11257644,
      return_liquid_margin: null,
      margin_mode: 0,
      value: 198421.11257644,
      extra_margin: 0,
      mark_price: 30526.47140753,
      unpnl: 0.9515725
    }
  ]
}

*/
