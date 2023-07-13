const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Perform a Futures market buy order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "BUY"), (quantity = 1), (price = false), (params = { type: "MARKET" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a Futures market buy order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "BUY"), (quantity = 1)) // If a price parameter is not provided, it will function as a market order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a Futures market buy order
    bitmusa
        .futuresMarketBuy((symbol = "BTCUSDT"), (quantity = 1))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Perform a Futures market sell order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "SELL"), (quantity = 1), (price = false), (params = { type: "MARKET" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a Futures market sell order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "SELL"), (quantity = 1)) // If a price parameter is not provided, it will function as a market order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a Futures market sell order
    bitmusa
        .futuresMarketSell((symbol = "BTCUSDT"), (quantity = 1))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*

{ code: 0, message: 'success' }

*/
