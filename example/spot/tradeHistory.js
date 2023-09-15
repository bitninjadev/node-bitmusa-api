const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Fetch trade history
    bitmusa
        .tradeHistory((symbol = "ETH/USDT"), (startTime = 1694757577925), (endTime = 1694757560736), (direction = "BUY"), (size = 10))
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})();
