const Bitmusa = require("node-bitmusa-api");

const options = {
    xApiKey: "YOUR_API_KEY",
    authKey: "YOUR_AUTHORIZATION_KEY",
    baseURL: "https://openapi.bitmusa.com",
    timeout: 5000,
};

const bitmusa = new Bitmusa(options);

(async function () {
    // Cancel all orders
    bitmusa
        .cancelAllOrders((symbol = "ETH/USDT"))
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
