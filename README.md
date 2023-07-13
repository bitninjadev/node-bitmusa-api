# node-bitmusa-api
The node-bitmusa-api is a node.js module designed for use with the Bitmusa API. Created to assist you in crafting your own projects that merge with Bitmusa - a platform launched in 2022 - this project's main objective is to provide comprehensive coverage of the API.


### quick start

```bash

Installation: npm install node-bitmusa-api
```

```js
// 1. create Bitmusa Client
const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);


// 2. check balance
bitmusa.balance().then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});
```



# API Reference

### Spot

#### Order
- createOrder(): Creates an order.
- cancelOrder(): Cancels an order. 
- cancelAllOrders(): Cancels all orders.
- fetchOpenOrders(): Gets a list of all open orders. [not supported specific market]
- fetchOrders() : Gets the list of orders in a specific market.
- getOrder(): Gets details of a specific order. [not supported]
#### Trade
- fetchTrades() : Retrieves the list of trades in a specific market.
- fetchRecentTrades(): Retrieves the recent trades of a specific market.
#### Market
- fetchTickers() : Retrieves the ticker information
- getTicker() : Gets the current ticker information for a specific market.
- fetchOrderBook() : Retrieves order book information for a specific market.
- fetchMarkets(): Gets the list of available markets. [not supported]
- getMarket() : Gets the details of a specific market. [not supported]
#### Asset
- fetchTransations() : Retrieves deposit and withdrawal history.
- fetchBalance() : Retrieves the balance of a held asset.
- getBalance(): Get specific asset balance.
- requestWithdrawal(): Requests a withdrawal. [not supported]
- createDepositAddress(): Creates a deposit address. [not supported]
#### Other
- fetchTradingFees() : Retrieves transaction fee information. [not supported]
- getTradingFee() : get transaction fee information for specific token. [not supported]
- fetchTransactionFees() : Retrieves transaction fee information. [not supported]
- getTransactionFee() : get transaction fee information for specific token. [not supported]

### Futures
#### Order
- openFutureOrder(): Creates a future order.
- closeFutureOrder(): Close a future order.
- closeAllFutureOrders(): Close all future orders.
- cancelFutureOrder(): Cancels a futures order.
- cancelAllFutureOrders(): Cancels all futures orders.

#### Trade
- fetchFuturePositions(): Gets details of a specific futures order position.
- fetchFutureOpenOrders(): Gets a list of open futures orders.
- fetchFutureOrders() : Gets a list of futures orders in a specific market.
- fetchFutureTrades() : Retrieves a list of futures trades in a specific market.

#### Market
- fetchFutureTickers() : Retrieves the current futures ticker information for a specific market. [not supported]
- getFutureTicker() : Retrieves the current futures ticker information for a specific market.
- getFuturePrice() : Get futures price for a specific market.
- fetchFutureMarkets(): Gets the list of available futures markets. [not supported]
- getFutureMarket(): Gets the details of futures transactions in a specific market. [not supported]
- fetchFutureOrderBook() : Retrieves futures price information for a specific market.
- fetchFutureRecentTrades(): Retrieves the recent futures transaction history of a specific market.

#### Asset
- fetchFutureBalance(): Retrieves the balance of assets held in the futures account.
- getFutureBalance(): Gets the balance of assets held in the futures account.
- getFutureTransactions(): Gets the history of futures account deposits and withdrawals. [not supported]
- requestFutureWithdrawal() : Requests a withdrawal from a futures account. [not supported]

#### Other
- getFutureTradingFees(): Retrieves futures trading fee information. [not supported]


# Example


## 1. signIn
### **[Note]** this is private api. so you must grant permission to use this api. send email to support@bitmusa.com
```js
bitmusa.signIn("[id]","[password]").then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});
```
### OK
```js
{
  data: {
    id: 1234,
    email: 'test@test.com',
    country: '1',
    phone: '34151234',
    token: '0ec14b76-27b3-4bad-940a-044c116f0cbe',
    googleState: null,
    status: null,
    googleKey: null,
    nickname: '1234'
  },
  code: 0,
  message: 'SUCCESS'
}
```
### Fail
```js
{ 
    data: null, 
    code: 20006, 
    message: 'Incorrect username or password' 
}

```

## createOrder
```js
bitmusa.createOrder("BUY", "BTC/USDT","0.0001","LIMIT_PRICE", "23500.0").then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});
```

### OK
```js
{ data: 'E167795149792251', code: 0, message: 'success' }
```

### Fail
```js
{ code: 4000, message: 'need sign in' }
```
