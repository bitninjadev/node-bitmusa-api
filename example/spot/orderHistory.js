const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch order history
    bitmusa
        .orderHistory((symbol = "ETH/USDT"), (orderStatus = "TRADING"), (size = 10), (startTime = 1694757577925), (endTime = 1694757560736))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();
