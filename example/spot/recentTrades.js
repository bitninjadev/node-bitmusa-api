const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch recent trades
    bitmusa
        .recentTrades((symbol = "ETH/USDT"), (page = 1), (pageSize = 10))
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
      id: '72736703',
      symbol: 'ETH/USDT',
      price: 1717.14,
      amount: 0.0146,
      buyTurnover: 25.070244,
      sellTurnover: 25.070244,
      direction: 'SELL',
      buyOrderId: 'R168903839505225',
      sellOrderId: 'E168911015680962',
      buyOrder: {
        orderId: 'R168903839505225',
        memberId: 83071,
        symbol: 'ETH/USDT',
        coinSymbol: 'ETH',
        baseSymbol: 'USDT',
        status: 'COMPLETED',
        direction: 'BUY',
        type: 'LIMIT_PRICE',
        price: 1717.14,
        amountSymbol: 'ETH',
        amountType: 'COIN',
        amount: 0.0177,
        tradedAmount: 0.0177,
        turnover: 30.393378,
        time: 1689038395052,
        completedTime: 1689110156856,
        canceledTime: null,
        useDiscount: '0',
        orderResource: 'CUSTOMER',
        detail: null,
        completed: true
      },
      sellOrder: {
        orderId: 'E168911015680962',
        memberId: 83071,
        symbol: 'ETH/USDT',
        coinSymbol: 'ETH',
        baseSymbol: 'USDT',
        status: 'TRADING',
        direction: 'SELL',
        type: 'MARKET_PRICE',
        price: 0,
        amountSymbol: 'ETH',
        amountType: 'COIN',
        amount: 10,
        tradedAmount: 0.1971,
        turnover: 330.310695,
        time: 1689110156809,
        completedTime: null,
        canceledTime: null,
        useDiscount: '0',
        orderResource: 'CUSTOMER',
        detail: null,
        completed: false
      },
      time: 1689110156843,
      timeString: '2023-07-11 21:15:56'
    }
]

*/
