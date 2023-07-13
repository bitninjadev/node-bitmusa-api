const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Perform a Futures limit buy order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "BUY"), (quantity = 1), (price = 31000), (params = { type: "LIMIT" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    // Alternative method to perform a Futures limit buy order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "BUY"), (quantity = 1), (price = 31000)) // If a price parameter exists, it will function as a limit order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    // Alternative method to perform a Futures limit buy order
    bitmusa
        .futuresLimitBuy((symbol = "BTCUSDT"), (quantity = 1), (price = 29000))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    // Perform a Futures limit sell order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "SELL"), (quantity = 1), (price = 31000), (params = { type: "LIMIT" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    // Alternative method to perform a Futures limit sell order
    bitmusa
        .futuresOrder((symbol = "BTCUSDT"), (side = "SELL"), (quantity = 1), (price = 31000)) // If a price parameter exists, it will function as a limit order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.lgo(err);
        });
    // Alternative method to perform a Futures limit sell order
    bitmusa
        .futuresLimitSell((symbol = "BTCUSDT"), (quantity = 1), (price = 29000))
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
