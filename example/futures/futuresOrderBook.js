const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch Futures Order Book
    bitmusa
        .futuresOrderbook((symbol = "BTCUSDT"), (size = 50))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

})();

/*

{
  sell: [
    {
      payload: null,
      price: '31000.0',
      pk: '01H51NNYQ6MFZF8AK733Y5HGXV',
      ticker: 'BTCUSDT',
      amount: '46500.0',
      qty: '1.5',
      total: 212814.1225,
      total_qty: 6.948,
      position: '1',
      scale: '0',
      updated_time: '1689119206016',
      mode: 'add'
    },
    {
      payload: null,
      price: '30528.6',
      pk: '01H519Z58YE15KEYCC60C9MZD0',
      ticker: 'BTCUSDT',
      amount: '8578.5366',
      qty: '0.281',
      total: 166314.1225,
      total_qty: 5.448,
      position: '1',
      scale: '0',
      updated_time: '1689039901981',
      mode: 'add'
    },
  ],
  buy: [
    {
      payload: null,
      price: '30524.1',
      pk: '01H519ZEA8726H5PRHJRXD6FQE',
      ticker: 'BTCUSDT',
      amount: '262934.5974',
      qty: '8.614',
      total: 262934.5974,
      total_qty: 8.614,
      position: '0',
      scale: '0',
      updated_time: '1689119453748',
      mode: 'add'
    },
    {
      payload: null,
      price: '30524.0',
      pk: '01H519Z9EJCMQ916XT2DNQW6YK',
      ticker: 'BTCUSDT',
      amount: '106803.476',
      qty: '3.499',
      total: 369738.0734,
      total_qty: 12.113,
      position: '0',
      scale: '0',
      updated_time: '1689039917479',
      mode: 'add'
    },
  ]
}
*/
