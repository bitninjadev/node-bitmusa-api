# node-bitmusa-api
The node-bitmusa-api is a node.js module developed to interact with the Bitmusa API. Created to assist you in crafting your own projects that merge with Bitmusa - a platform launched in 2022 - this project's main objective is to provide comprehensive coverage of the API.


### quick start

```bash

Installation: npm install node-bitmusa-api
```

```js
// 1. create Bitmusa Client
const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    useTestnet: true,
    baseUrl: "TESTNET_URL",
    streamUrl: "TESTNET_URL"
    timeout: 5000,
    reconnect: true,
    keepAlive: true,
};

const bitmusa = new Bitmusa(options);


// 2. check balance
bitmusa.balance().then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});
```

# Bitmusa Futures API
For details, please review sample codes provided in the "example" folder.

#### Futures Balance
```js
await bitmusa.futuresBalance("USDT")
```

#### Futures Limit Order
```js
await bitmusa.futuresOrder((symbol = "BTCUSDT"), (side = "BUY"), (quantity = 1), (price = 31000))
```

```js
await bitmusa.futuresLimitBuy((symbol = "BTCUSDT"), (quantity = 1), (price = 29000))
```

```js
await bitmusa.futuresLimitSell((symbol = "BTCUSDT"), (quantity = 1), (price = 29000))
```

#### Futures Market Order
```js
await bitmusa.futuresOrder((symbol = "BTCUSDT"), (side = "BUY"), (quantity = 1), (price = false))
```

```js
await bitmusa.futuresMarketBuy((symbol = "BTCUSDT"), (quantity = 1))
```

```js
await bitmusa.futuresMarketSell((symbol = "BTCUSDT"), (quantity = 1))
```

#### Futures Close Order Example
```js
await bitmusa.futuresOrder((symbol = "BTCUSDT"), (side = "BUY"), (quantity = 1), (price = 31000), (params = { closePosition: true }))
```

#### Futures Positions
```js
await bitmusa.futuresExposure("BTCUSDT")
```

#### Futures Open Orders
```js
await bitmusa.futuresOpenOrders((symbol = "BTCUSDT"))
```

#### Futures Prices
```js
await bitmusa.futuresPrices("BTCUSDT")
```

# Bitmusa Spot Trading

#### balance
```js
await bitmusa.balance()
```

#### Limit Order
```js
await bitmusa.order((symbol = "ETH/USDT"), (direction = "BUY"), (quantity = 10), (price = 2000))
```

```js
await bitmusa.limitBuy((symbol = "ETH/USDT"), (quantity = 10), (price = 2000))
```

```js
await bitmusa.limitSell((symbol = "ETH/USDT"), (quantity = 10), (price = 2000))
```

#### Market Order
```js
await bitmusa.order((symbol = "ETH/USDT"), (direction = "BUY"), (quantity = 10), (price = false))
```

```js
await bitmusa.marketSell((symbol = "ETH/USDT"), (quantity = 10))
```

```js
await bitmusa.marketBuy((symbol = "ETH/USDT"), (quantity = 10))
```

#### Prices
```js
await bitmusa.prices((symbol = "")) // for all pairs
```

#### Order Cancel
```js
await bitmusa.cancelOrder((orderId = "Q168911032722964"))
```


# API Reference

### Spot

#### Order
- order(): Places an order
- limitBuy(): Places a limit buy order
- limitSell(): Places a limit sell order
- marketBuy(): Places a market buy order
- marketSell(): Places a market sell order 
- openOrders(): Retrieves a list of all current open orders
- cancelOrder(): Cancel an order
- cancelAllOrders(): Cancels all current open orders
#### Trade
- recentTrades(): Retrieves the most recent trades on the spot market.
#### Market
- prices(): Retrieves the current prices for all symbols. If no symbol is specified, it returns prices for all symbols.
- tickers(): Retrieves current ticker information for all symbols. If no symbol is specified, it returns ticker information for all symbols.
- orderBook(): Retrieves the current order book.
#### Asset
- balance():Retrieves the balance of a specific asset. If no asset is specified, it returns balances for all assets.
- requestWithdrawal(): Requests a withdrawal. [not supported]
- createDepositAddress(): Creates a deposit address. [not supported]
#### Other
- tradingFees(): Retrieves transaction fee information. [not supported]
- transactionFees(): Retrieves transaction fee information. [not supported]

### Futures

#### Order
- futuresOrder(): Places an order 
- futuresLimitBuy(): Places a limit buy order
- futuresLimitSell(): Places a limit sell order
- futuresMarketBuy(): Places a market buy order
- futuresMarketSell(): Places a market sell order
- cancelFutureOrder(): Cancels a futures order.
- cancelAllFutureOrders(): Cancels all futures orders.
- closeAllFuturesPositions(): Closes all open positions
- futuresLeverage(): Adjusts the leverage for the futures trading
#### Trade
- futuresOpenOrders(): Gets a list of open futures orders.
- futuresRecentTrades(): Retrieves the most recent trades
- futuresExposure(): Retrieves information on the current open positions
#### Market
- futuresPrices(): Retrieves the current prices for all symbols. If no symbol is specified, it returns prices for all symbol
- futuresTickers(): Retrieves current ticker information for all symbols. If no symbol is specified, it returns ticker information for all symbols
- futuresOrderBook(): Retrieves the current order book
#### Asset
- futuresBalance(): Retrieves the balance of assets held. If no symbol is specified, it returns prices for all symbols
- futuresTransactions(): Gets the history of futures account deposits and withdrawals [not supported]
- requestFuturesWithdrawal() : Requests a withdrawal from a futures account [not supported]
#### Other
- futuresTradingFees(): Retrieves futures trading fee information [not supported]

