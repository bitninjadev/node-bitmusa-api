const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Perform a limit buy order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "BUY"), (quantity = 10), (price = 2000), (params = { type: "LIMIT" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a limit buy order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "BUY"), (quantity = 10), (price = 2000)) // If a price parameter exists, it will function as a limit order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a limit buy order
    bitmusa
        .limitBuy((symbol = "ETH/USDT"), (quantity = 10), (price = 2000))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Perform a limit sell order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "SELL"), (quantity = 10), (price = 2000), (params = { type: "LIMIT" }))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a limit sell order
    bitmusa
        .order((symbol = "ETH/USDT"), (direction = "SELL"), (quantity = 10), (price = 2000)) // If a price parameter exists, it will function as a limit order.
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    // Alternative method to perform a limit sell order
    bitmusa
        .limitSell((symbol = "ETH/USDT"), (quantity = 10), (price = 2000))
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
