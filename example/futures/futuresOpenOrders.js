const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch Futures Open Orders
    bitmusa
        .futuresOpenOrders((symbol = "BTCUSDT"))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Fetch Futures Open Orders with timestamp
    bitmusa
    .futuresOpenOrders(symbol = "BTCUSDT", new Date("2023-06-01").getTime())
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
    console.log(err);
    });

    // Fetch Futures Open Orders by size
    bitmusa
        .futuresOpenOrders((symbol = "BTCUSDT"), 0, (size = 1))
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
    id: 658,
    ticker_id: 1,
    member_id: 83071,
    order_id: 'F8307116891192059017469',
    margin_mode: 0, // 0 means Isolated Margin, 1 means Cross Margin
    direction: 0, // 0 means Open Position, 1 means Close Position
    position: 1, // 0 means LONG Position, 1 means SHORT position
    order_type: 1,
    status: 0,
    tif_mode: 0,
    trigger_type: 0,
    trigger_direction: 0,
    ticker: 'BTCUSDT',
    coin_symbol: 'BTC',
    base_symbol: 'USDT',
    leverage: 1,
    order_price: 31000,
    order_qty: 1,
    traded_price: 0,
    traded_qty: 0,
    traded_value: 0,
    left_qty: 1,
    is_post_only: false,
    is_reduce_only: false,
    is_price_protected: false,
    trigger_id: null,
    trigger: null,
    order_time: '2023-07-11T23:46:46',
    filled_time: null,
    cancel_time: null
  },
  {
    id: 656,
    ticker_id: 1,
    member_id: 83071,
    order_id: 'F8307116891181635333165',
    margin_mode: 0, // 0 means Isolated Margin, 1 means Cross Margin
    direction: 0, // 0 means Open Position, 1 means Close Position
    position: 0, // 0 means LONG Position, 1 means SHORT position
    order_type: 1,
    status: 0,
    tif_mode: 0,
    trigger_type: 0,
    trigger_direction: 0,
    ticker: 'BTCUSDT',
    coin_symbol: 'BTC',
    base_symbol: 'USDT',
    leverage: 1,
    order_price: 29000,
    order_qty: 1,
    traded_price: 0,
    traded_qty: 0,
    traded_value: 0,
    left_qty: 1,
    is_post_only: false,
    is_reduce_only: false,
    is_price_protected: false,
    trigger_id: null,
    trigger: null,
    order_time: '2023-07-11T23:29:24',
    filled_time: null,
    cancel_time: null
  }
]

*/
