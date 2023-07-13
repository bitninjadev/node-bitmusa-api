const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Perform a market buy order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "BUY"), (quantity = 10), (price = false), (params = { type: "MARKET" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a market buy order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "BUY"), (quantity = 10)) // If a price parameter is not provided, it will function as a market order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a market buy order
    bitmusa
        .marketBuy((symbol = "ETH/USDT"), (quantity = 10))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Perform a market sell order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "SELL"), (quantity = 10), (price = false), (params = { type: "MARKET" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a market sell order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "SELL"), (quantity = 10)) // If a price parameter is not provided, it will function as a market order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a market sell order
    bitmusa
        .marketSell((symbol = "ETH/USDT"), (quantity = 10))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();

/*

{ data: 'F168911013921058', code: 0, message: 'success' }

*/
