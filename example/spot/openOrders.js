const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch open orders
    bitmusa
        .openOrders((symbol = "ETH/USDT"), (page = 1), (pageSize = 10))
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
    orderId: 'E168911113071895',
    memberId: 83071,
    symbol: 'ETH/USDT',
    coinSymbol: 'ETH',
    baseSymbol: 'USDT',
    status: 'TRADING',
    direction: 'BUY',
    type: 'LIMIT_PRICE',
    price: 2090,
    amountSymbol: 'ETH',
    amountType: 'COIN',
    amount: 10,
    tradedAmount: 0,
    turnover: 0,
    time: 1689111130718,
    completedTime: null,
    canceledTime: null,
    useDiscount: '0',
    orderResource: 'CUSTOMER',
    detail: [],
    completed: false
  },
  {
    orderId: 'M168911113065194',
    memberId: 83071,
    symbol: 'ETH/USDT',
    coinSymbol: 'ETH',
    baseSymbol: 'USDT',
    status: 'TRADING',
    direction: 'BUY',
    type: 'LIMIT_PRICE',
    price: 2080,
    amountSymbol: 'ETH',
    amountType: 'COIN',
    amount: 10,
    tradedAmount: 0,
    turnover: 0,
    time: 1689111130651,
    completedTime: null,
    canceledTime: null,
    useDiscount: '0',
    orderResource: 'CUSTOMER',
    detail: [],
    completed: false
  },
  {
    orderId: 'J168911113001986',
    memberId: 83071,
    symbol: 'ETH/USDT',
    coinSymbol: 'ETH',
    baseSymbol: 'USDT',
    status: 'TRADING',
    direction: 'BUY',
    type: 'LIMIT_PRICE',
    price: 2000,
    amountSymbol: 'ETH',
    amountType: 'COIN',
    amount: 10,
    tradedAmount: 0,
    turnover: 0,
    time: 1689111130019,
    completedTime: null,
    canceledTime: null,
    useDiscount: '0',
    orderResource: 'CUSTOMER',
    detail: [],
    completed: false
  }
]

If no orders are found, the response will be an empty array.

*/
