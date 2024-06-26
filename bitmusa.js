/* ============================================================
 * node-bitmusa-api
 * https://github.com/satoshi-bitninja/node-bitmusa-api
 * ============================================================
 * Copyright 2023 bitninja
 * Released under the MIT License
 * ============================================================ */

const axios = require("axios");
const Websocket = require("ws");

class Bitmusa {
    constructor(options = {}) {
        // API base URLs
        this.baseUrl = "https://openapi.bitmusa.com";
        this.streamUrl = "";

        // Default options
        this.options = this.getDefaultOptions();
        this.subscriptions = {};
        this.callbacks = {};

        // Validate and initialize options
        if (typeof options !== "object") {
            throw new Error("options must be an object");
        } else if (typeof options === "object") {
            if (typeof options.reconnect !== "undefined") this.options.reconnect = options.reconnect;
            if (typeof options.keepAlive !== "undefined") this.options.keepAlive = options.keepAlive;
            if (typeof options.timeout !== "undefined") this.options.timeout = options.timeout;
            if (typeof options.xApiKey !== "undefined" && typeof options.authKey !== "undefined") {
                this.options.xApiKey = options.xApiKey;
                this.options.authKey = options.authKey;
            } else {
                throw new Error("xApiKey and authKey must be specified upon creating bitmusa instance");
            }

            if (options.useTestnet === true) {
                this.options.useTestnet = true;
                if (typeof options.baseUrl !== "undefined" && typeof options.streamUrl !== "undefined") {
                    this.baseUrl = options.baseUrl;
                    this.streamUrl = options.streamUrl;
                } else {
                    throw new Error("baseUrl and streamUrl must be specified when useTestnet is set to true");
                }
            }
        }
    }

    getDefaultOptions() {
        return {
            xApiKey: null,
            authKey: null,
            timeout: 1000,
            useTestnet: false,
            reconnect: true,
            keepAlive: true,
        };
    }

    async requestAPI(path, method, parameters = null) {
        method = method.toUpperCase();
        const headers = {
            Authorization: `Bearer ${this.options.authKey}`,
            "x-api-key": this.options.xApiKey,
            "Content-Type": "application/json",
        };
        const url = `${this.baseUrl}${path}`;
        const requestOptions = {
            method: method,
            url: url,
            headers: headers,
            data: parameters,
            responseType: "json",
            timeout: this.options.timeout,
        };
        if (method === "GET") {
            requestOptions.params = parameters;
        }
        try {
            const response = await axios.request(requestOptions);
            const responseData = response.data || {};
            return { data: responseData, debug: 0 };
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const errorCode = errorData.code || error.response.status;
                const errorMessage = errorData.message || error.message;
                return { data: { code: errorCode, message: errorMessage, debug: 1 } };
            } else {
                throw new Error(`Failed to requestAPI ${path}: ${error.message}`);
            }
        }
    }

    /**
     * Subscribes to a specific channel.
     * @param {string} channel - The channel to subscribe to
     * @param {function} callback - Callback function to handle incoming messages.
     *                              This function should accept two parameters:
     *                                1. channel (string): The channel from which the message is received.
     *                                2. data (object/string): The data received from the socket.
     *                                Example: (channel, data) => { ... }
     * @param {boolean} isPrivate - Indicates if the subscription is private (requires authentication)
     */
    async subscribe(channel, callback) {
        if (this.subscriptions[channel]) {
            console.log(`Already subscribed to channel: ${channel}`);
        } else {
            await this._openSocket(channel, callback);
        }
    }

    /**
     * Opens a WebSocket connection to a specific channel.
     * @param {string} channel - The channel to connect to
     * @param {function} callback - Callback function to handle incoming messages.
     *                              This function should accept two parameters:
     *                                1. channel (string): The channel from which the message is received.
     *                                2. data (object/string): The data received from the socket.
     *                                Example: (channel, data) => { ... }
     * @param {boolean} isPrivate - Indicates if the connection is private (requires authentication)
     */
    async _openSocket(channel, callback,) {
        let url = `${this.streamUrl}${channel}`;
        console.log(channel)
        const ws = new Websocket(url);
        ws.on("open", this._handleSocketOpen.bind(this, channel));
        ws.on("close", this._handleSocketClose.bind(this, channel));
        ws.on("error", this._handleSocketError.bind(this, channel));
        ws.on("message", (data) => this._handleSocketMessage(channel, callback, data));
        ws.on("ping", this._handleSocketPing.bind(this, ws));

        this.subscriptions[channel] = ws;
        this.callbacks[channel] = callback;

        if (!this.vitalCheckStarted) {
            this._startVitalCheck();
            this.vitalCheckStarted = true;
        }
    }

    _handleSocketPing(ws) {
        ws.pong();
    }

    _handleSocketOpen(channel) {
        console.log(`Subscribed to channel: ${channel}`);
        this.subscriptions[channel].alive = true;
    }

    // Handle WebSocket close
    _handleSocketClose(channel) {
        console.log(`Disconnected for channel: ${channel}`);
        if (this.options.reconnect) {
            console.log(`Reconnecting to channel: ${channel}`);
            this._openSocket(channel, this.callbacks[channel]);
        }
    }

    _handleSocketMessage(channel, callback, data) {
        try {
            const parsedData = JSON.parse(data);
            callback(channel, parsedData);
        } catch (error) {
            console.error(`Error parsing message from channel ${channel}:`, error);
        }
    }

    _handleSocketError(channel, error) {
        console.error(`WebSocket error on channel ${channel}:`, error);
        if (this.options.reconnect) {
            console.log(`Attempting to reconnect to channel: ${channel}`);
            this._openSocket(channel, this.callbacks[channel]);
        }
    }

    _terminate(channel) {
        let ws = this.subscriptions[channel];
        ws.terminate();
    }

    _startVitalCheck(interval = 30 * 1000) {
        // Default to 30 seconds
        setInterval(() => {
            for (let channel in this.subscriptions) {
                const ws = this.subscriptions[channel];
                if (ws && ws.readyState === Websocket.OPEN) {            
                    if (!ws.alive) {
                        console.log(`Disconnected Channel: ${channel}`);
                        if (this.options.reconnect) {
                            console.log("trying reconnect...");
                            const callback = this.callbacks[channel];
                            console.log(callback);
                            this._openSocket(channel, callback);
                        }
                    }
                }
            }
        }, interval);
    }

    async getListenKey() {
        const funcName = "[getListenKey]";
        try {
            const response = await this.requestAPI("/api/v1/spot/userDataStream", "post");
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json.data.listenKey;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateListenKey() {
        const funcName = "[updateListenKey]";
        try {
            const response = await this.requestAPI("/api/v1/spot/userDataStream", "put");
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteListenKey() {
        const funcName = "[deleteListenKey]";
        try {
            const response = await this.requestAPI("/api/v1/spot/userDataStream", "delete");
            const json = response.data;
            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getFuturesListenKey() {
        const funcName = "[getFuturesListenKey]";
        try {
            const response = await this.requestAPI("/api/v2/future/userDataStream", "post");
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
            return json.data.listenKey;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateFuturesListenKey() {
        const funcName = "[updateFuturesListenKey]";
        try {
            const response = await this.requestAPI("/api/v1/future/userDataStream", "put");
            const json = response.data;
            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteFuturesListenKey() {
        const funcName = "[deleteFuturesListenKey]";
        try {
            const response = await this.requestAPI("/api/v1/future/userDataStream", "delete");
            const json = response.data;
            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    _userStreamKeepAlive(interval = 59 * 60 * 1000) {
        //updates listenKey every 59 minutes
        setInverval(async () => {
            await this.updateListenKey();
        }, interval);
    }

    _futuresUserStreamKeepAlive(interval = 59 * 60 * 1000) {
        //updates listenKey every 59 minutes
        setInterval(async () => {
            await this.updateFuturesListenKey();
        }, interval);
    }

    /**
     * Initiates a subscription to an order book stream for a specified trading symbol.
     * @param {string} symbol - The trading symbol to subscribe to, e.g., 'BTCUSDT'. Default: 'BTCUSDT'.
     * @param {string} level - The depth of the order book to subscribe to. Accepted values: '5', '10', '20'. Default: '5'.
     * @param {string} frequency - The frequency at which the stream is updated. Accepted values: '1s', '100ms'. Default: '100ms'.
     * @param {function} callback - The callback function to handle incoming messages. If not provided, defaults to logging to the console.
     */
    orderBookStream(symbol = "BTCUSDT", level = "5", frequency = "100ms", callback = console.log) {
        const channel = `/ws/spot/public?stream=${symbol}@depth${level}@${frequency}`;
        this.subscribe(channel, callback);
    }

    /**
     * Initiates a subscription to a kline (candlestick chart data) stream for a specified trading symbol.
     *
     * @param {string} symbol - The trading symbol to subscribe to, e.g., 'BTCUSDT'. Default: 'BTCUSDT'.
     * @param {string} interval - The time interval for the kline/candlestick data. Accepted values: '1min', '3min', '5min', '15min', '30min', '1H', '2H', '4H', '6H', '8H', '12H', '1D', '1W', '1M'. Default: '1min'.
     * @param {function} callback - The callback function to handle incoming messages. If not provided, defaults to logging to the console.
     */
    klineStream(symbol = "BTCUSDT", interval = "1min", callback = console.log) {
        const channel = `/ws/spot/public?stream=${symbol.toLowerCase()}@kline_${interval}`;
        this.subscribe(channel, callback);
    }

    /**
     * Initiates a subscription to a futures order book stream for a specified trading symbol.
     *
     * @param {string} symbol - The trading symbol to subscribe to, e.g., 'BTCUSDT'. Default: 'BTCUSDT'.
     * @param {string} level - The depth of the order book to subscribe to. Accepted values: '5', '10', '20'. Default: '5'.
     * @param {string} frequency - The frequency at which the stream is updated. Accepted values: '1s', '100ms'. Default: '100ms'.
     * @param {function} callback - The callback function to handle incoming messages. If not provided, defaults to logging to the console.
     */
    futuresOrderBookStream(symbol = "BTCUSDT", level = "5", frequency = "100ms", callback = console.log) {
        const channel = `/ws/future/public?stream=${symbol}@depth${level}@${frequency}`;
        this.subscribe(channel, callback);
    }

    /**
     * Initiates a subscription to a kline (candlestick chart data) stream for a specified trading symbol.
     *
     * @param {string} symbol - The trading symbol to subscribe to, e.g., 'BTCUSDT'. Default: 'BTCUSDT'.
     * @param {string} interval - The time interval for the kline/candlestick data. Accepted values: '1min', '3min', '5min', '15min', '30min', '1H', '2H', '4H', '6H', '8H', '12H', '1D', '1W', '1M'. Default: '1min'.
     * @param {function} callback - The callback function to handle incoming messages. If not provided, defaults to logging to the console.
     */
    futuresKlineStream(symbol = "BTCUSDT", interval = "1min", callback = console.log) {
        const channel = `/ws/future/public?stream=${symbol}@kline_${interval}`;
        this.subscribe(channel, callback);
    }

    async userDataStream(callback = console.log) {
        const funcName = "[userDataStream]";
        try {
            this.options.spotListenKey = await this.getListenKey();
        } catch (error) {
            throw new Error(`${funcName} ${error.message}`)
        }

        if (this.keepAlive === true) {
            this._userStreamKeepAlive();
        }

        const channel = `/ws/spot/wallet/${this.options.spotListenKey}`;
        this.subscribe(channel, callback);
    }

    async futuresUserDataStream(callback = console.log) {
        const funcName = "[futuresUserDataStream]";
        try {
            this.options.futuresListenKey = await this.getFuturesListenKey();
        } catch (error) {
            throw new Error(`${funcName} ${error.message}`)
        }
        if (this.keepAlive === true) {
            this._futuresUserStreamKeepAlive();
        }

        const channel = `/ws/future/wallet/${this.options.futuresListenKey}`;
        this.subscribe(channel, callback);
    }

    async order(symbol = null, direction = null, quantity = null, price = null, params = {}) {
        const funcName = "[order]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!direction) throw new Error(`${funcName} direction is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);

        direction = direction.toUpperCase();
        symbol = symbol.toUpperCase();

        if (direction !== "BUY" && direction !== "SELL") throw new Error(`${funcName} direction must be BUY or SELL`);

        if (price) {
            if (typeof params.type === "undefined") params.type = "LIMIT_PRICE";
        } else {
            price = 0;
            if (typeof params.type === "undefined") params.type = "MARKET_PRICE";
        }

        var type = params.type.toUpperCase();

        if (type === "MARKET" || type === "MARKET_PRICE") {
            type = "MARKET_PRICE";
        }

        if (type === "LIMIT" || type === "LIMIT_PRICE") {
            type = "LIMIT_PRICE";
        }

        var options = {
            symbol: symbol,
            price: `${price}`,
            amount: `${quantity}`,
            direction: direction,
            type: type,
        };

        try {
            const response = await this.requestAPI("/api/v1/spot/order", "post", options);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async limitBuy(symbol, quantity = null, price = null, params = { type: "LIMIT_PRICE" }) {
        const funcName = "[limitBuy]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);
        if (!price) throw new Error(`${funcName} price is blank`);

        symbol = symbol.toUpperCase();

        try {
            const response = await this.order(symbol, "BUY", quantity, price, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async limitSell(symbol, quantity = null, price = null, params = { type: "LIMIT_PRICE" }) {
        const funcName = "[limitSell]:";

        if (!symbol) throw new Error(`${funcName} quantity is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);
        if (!price) throw new Error(`${funcName} price is blank`);

        symbol = symbol.toUpperCase();

        try {
            const response = await this.order(symbol, "SELL", quantity, price, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async marketBuy(symbol, quantity = null, params = { type: "MARKET_PRICE" }) {
        const funcName = "[marketBuy]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);

        symbol = symbol.toUpperCase();

        try {
            const response = await this.order(symbol, "BUY", quantity, 0, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async marketSell(symbol, quantity = null, params = { type: "MARKET_PRICE" }) {
        const funcName = "[marketSell]:";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);

        symbol = symbol.toUpperCase();

        try {
            const response = await this.order(symbol, "SELL", quantity, 0, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async cancelOrder(orderId) {
        const funcName = "[cancelOrder]:";

        if (!orderId) throw new Error(`${funcName} orderId is blank`);

        try {
            const response = await this.requestAPI(`/api/v1/spot/order/cancel/${orderId}`, "post");
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async cancelAllOrders(symbol = null) {
        const funcName = "[cancelAllOrders]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);

        symbol = symbol.toUpperCase();

        var options = {
            symbol: symbol,
        };

        try {
            const response = await this.requestAPI(`/api/v1/spot/order/cancel/all`, "post", options);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async openOrders(symbol = null, pageNo = 1, pageSize = 10) {
        const funcName = "[openOrders]:";

        if (pageNo < 1) throw new Error(`${funcName} pageNo start from 1`);
        if (!symbol) throw new Error(`${funcName} symbol is blank`);

        symbol = symbol.toUpperCase();

        var parameters = {
            pageNo: pageNo,
            pageSize: pageSize,
            symbol: symbol,
        };

        try {
            const response = await this.requestAPI("/api/v1/spot/order", "get", parameters);
            const json = response.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json.data.content;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async recentTrades(symbol = null, size = 20) {
        const funcName = "[recentTrades]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);

        symbol = symbol.toUpperCase();

        var parameters = {
            symbol: symbol,
            size: size,
        };

        try {
            const response = await this.requestAPI("/api/v1/spot/market/trade", "get", parameters);
            const json = response.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async tickers(symbol = null) {
        const funcName = "[tickers]:";

        try {
            const response = await this.requestAPI("/api/v1/spot/market", "get");
            const json = response.data;
            const data = json.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            if (!symbol) {
                return json;
            } else {
                const ticker = data.find((item) => item.symbol == symbol);

                if (!ticker) throw new Error(`${funcName} symbol not found`);
                return ticker;
            }
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async prices(symbol = null) {
        const funcName = "[prices]:";

        try {
            const response = await this.requestAPI("/api/v1/spot/market", "get");
            const json = response.data;
            const data = json.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            if (symbol) {
                symbol = symbol.toUpperCase();

                const ticker = data.find((item) => item.symbol == symbol);
                if (!ticker) throw new Error(`${funcName} ${symbol} is not found`);
                if (!ticker.close) throw new Error(`${funcName} ${symbol} close price is not found`);
                return ticker.close;
            } else {
                const prices = json.map((item) => {
                    return { symbol: item.symbol, close: item.close };
                });

                return prices;
            }
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async balance(symbol = null) {
        const funcName = "[balance]:";

        try {
            const response = await this.requestAPI("/api/v1/spot/wallet", "get");
            const json = response.data;
            const data = json.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            if (symbol) {
                symbol = symbol.toUpperCase();
                if (symbol.split("/").length == 2) throw new Error(`${funcName} symbol must be like BTC`);

                const balance = data.find((item) => item.coin.unit == symbol);
                if (!balance) throw new Error(`${funcName} ${symbol} is not found`);

                return balance;
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async orderBook(symbol = null) {
        const funcName = "[orderBook]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);

        symbol = symbol.toUpperCase();

        var parameters = {
            symbol: symbol,
        };

        try {
            const response = await this.requestAPI("/api/v1/spot/market/orderbook", "get", parameters);
            const json = response.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
            if (json == "") throw new Error(`${funcName} ${symbol} is not found`);

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async klines(symbol = null, interval = "1", startTime = null, endTime = null, size = 100) {
        const funcName = "[klines]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!interval) throw new Error(`${funcName} interval is blank`);
        if (!startTime && !endTime && !size) throw new Error(`${funcName} either timestamps or size must specified`);

        symbol = symbol.toUpperCase();

        var parameters = {
            symbol: symbol,
            from: startTime,
            to: endTime,
            resolution: interval,
        };

        try {
            const response = await this.requestAPI("/api/v1/spot/market/kline", "get", parameters);
            const json = response.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async orderHistory(symbol = null, orderStatus = null, size = 10, startTime = null, endTime = null) {
        const funcName = "[orderHistory]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!orderStatus) throw new Error(`${funcName} orderStatus is blank`);
        if (!startTime && !endTime && !size) throw new Error(`${funcName} either timestamp or size must be specified`);

        symbol = symbol.toUpperCase();
        orderStatus = orderStatus.toUpperCase();

        var parameters = {
            symbol: symbol,
            startTime: startTime,
            endTime: endTime,
            status: orderStatus,
            size: size,
        };

        try {
            const response = await this.requestAPI("/api/v1/spot/order/history", "get", parameters);
            const json = response.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async tradeHistory(symbol = null, startTime = null, endTime = null, direction = "BUY", size = 10) {
        const funcName = "[tradeHistory]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!startTime && !endTime && !size) throw new Error(`${funcName} either timestamp or size must be specified`);
        if (!direction || (direction.toUpperCase() !== "BUY" && direction.toUpperCase() !== "SELL")) throw new Error(`${funcName} direction must be either BUY or SELL`);

        symbol = symbol.toUpperCase();
        direction = direction.toUpperCase();

        var parameters = {
            symbol: symbol,
            startTime: startTime,
            endTime: endTime,
            direction: direction,
            size: size,
        };

        try {
            const response = await this.requestAPI("/api/v1/spot/trade/history", "get", parameters);
            const json = response.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            logger.error(error);
        }
    }

    async futuresOrder(
        symbol = null,
        side = null,
        quantity = null,
        price = null,
        params = {
            marginMode: "ISOLATED",
            closePosition: false,
            reduceOnly: false,
            postOnly: false,
            takeProfit: {},
            stopLoss: {},
        }
    ) {
        const funcName = "[futuresOrder]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!side) throw new Error(`${funcName} side is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);

        symbol = symbol.toUpperCase();
        side = side.toUpperCase();

        var marginMode = 0; //Default margin mode is ISOLATED

        if (params.marginMode) {
            if (params.marginMode.toUpperCase() !== "ISOLATED" && params.marginMode.toUpperCase() !== "CROSSED") {
                throw new Error("Margin mode must be either ISOLATED or CROSSED");
            }

            if (params.marginMode.toUpperCase() === "CROSSED") {
                marginMode = 1;
            }
        }

        if (price) {
            if (typeof params.type === "undefined") params.type = "LIMIT_PRICE";
        } else {
            price = 0;
            if (typeof params.type === "undefined") params.type = "MARKET_PRICE";
        }

        var type = params.type.toUpperCase();

        if (type === "MARKET" || type === "MARKET_PRICE") {
            type = 0;
        }

        if (type === "LIMIT" || type === "LIMIT_PRICE") {
            type = 1;
        }

        var direction = params.closePosition ? 1 : 0;

        if (side !== "BUY" && side !== "SELL") throw new Error(`${funcName} side must be BUY or SELL`);
        if (side === "BUY") side = 0;
        if (side === "SELL") side = 1;

        function setOrderOptions(orderType, orderParams) {
            if (!orderParams || Object.keys(orderParams).length === 0) {
                return {};
            }

            const triggerTypeMap = { MARK: 1, LAST: 2 };
            const orderTypeMap = { MARKET: 0, LIMIT: 1 };

            const triggerType = triggerTypeMap[orderParams.triggerType.toUpperCase()];
            const orderTypeNum = orderTypeMap[orderParams.orderType.toUpperCase()];

            if (orderTypeNum === 1 && !orderParams.orderPrice) {
                throw new Error(`[futuresOrder] ${orderType} order price must be specified for limit ${orderType} order`);
            }

            return {
                [`is_${orderType}`]: true,
                [`${orderType}_trigger_type`]: triggerType,
                [`${orderType}_trigger_price`]: orderParams.triggerPrice,
                [`${orderType}_order_type`]: orderTypeNum,
                [`${orderType}_order_price`]: orderParams.orderPrice,
            };
        }

        const takeProfitOptions = setOrderOptions("take_profit", params.takeProfit);
        const stopLossOptions = setOrderOptions("stop_loss", params.stopLoss);

        var options = {
            direction: direction, // 0: Open, 1: Close
            ticker: `${symbol}`,
            margin_mode: marginMode,
            position: side,
            order_type: type,
            order_price: price,
            order_qty: quantity,
            is_reduce_only: params.reduceOnly,
            is_post_only: params.postOnly,
            ...takeProfitOptions,
            ...stopLossOptions,
        };

        try {
            const response = await this.requestAPI("/api/v2/future/order", "post", options);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresLimitBuy(symbol = null, quantity = null, price = null, params = {}) {
        const funcName = "[futuresLimitBuy]:";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!quantity) throw new Error(`${funcName} amount is blank`);
        if (!price) throw new Error(`${funcName} price is blank`);

        symbol = symbol.toUpperCase();

        Object.assign(params, { type: "LIMIT_PRICE" });

        try {
            const response = await this.futuresOrder(symbol, "BUY", quantity, price, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresLimitSell(symbol, quantity = null, price = null, params = {}) {
        const funcName = "[futuresLimitSell]:";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);
        if (!price) throw new Error(`${funcName} price is blank`);

        symbol = symbol.toUpperCase();

        Object.assign(params, { type: "LIMIT_PRICE" });

        try {
            const response = await this.futuresOrder(symbol, "SELL", quantity, price, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresMarketBuy(symbol, quantity = null, params = {}) {
        const funcName = "[futuresMarketBuy]:";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);

        symbol = symbol.toUpperCase();

        Object.assign(params, { type: "MARKET_PRICE" });

        try {
            const response = await this.futuresOrder(symbol, "BUY", quantity, 0, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresMarketSell(symbol, quantity, params = {}) {
        const funcName = "[futuresMarketSell]:";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!quantity) throw new Error(`${funcName} quantity is blank`);

        symbol = symbol.toUpperCase();

        Object.assign(params, { type: "MARKET_PRICE" });

        try {
            const response = await this.futuresOrder(symbol, "SELL", quantity, 0, params);
            return response;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async cancelFuturesOrder(order_id) {
        const funcName = "[cancelFuturesOrder]:";
        if (!order_id) throw new Error(`${funcName} order_id is blank`);

        try {
            const response = await this.requestAPI(`/api/v2/future/order/cancel/${order_id}`, "post");
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async cancelAllFuturesOrders(symbol = null) {
        const funcName = "[cancelAllFuturesOrders]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        try {
            const response = await this.requestAPI(`/api/v2/future/order/cancel/all?ticker=${symbol}`, "post");
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async closeAllFuturesPositions(symbol = null) {
        const funcName = "[closeAllFuturesOrders]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        try {
            const response = await this.requestAPI(`/api/v2/future/position/close/all?ticker=${symbol}`, "post");
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresRecentTrades(symbol, size = 20) {
        const funcName = "[futuresRecentTrades]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        var parameters = {
            ticker: symbol,
            size: size,
        };

        try {
            const response = await this.requestAPI("/api/v2/future/market/trade", "get", parameters);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json.data;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresLeverage(symbol = null, leverage = 1) {
        const funcName = "[futuresLeverage]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!leverage) throw new Error(`${funcName} leverage is blank`);

        symbol = symbol.toUpperCase();

        var options = {
            ticker: symbol,
            leverage: leverage,
        };

        try {
            const response = await this.requestAPI("/api/v2/future/leverage", "post", options);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresOrderbook(symbol = null, size = 50) {
        const funcName = "[futuresOrderbook]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        var parameters = {
            ticker: symbol,
            size: size,
        };

        try {
            const response = await this.requestAPI("/api/v2/future/market/orderbook", "get", parameters);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json.data;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresOpenOrders(symbol = null, start_time = null, size = 50) {
        const funcName = "[futuresOpenOrders]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);

        symbol = symbol.toUpperCase();

        var options = {
            ticker: symbol,
            size: size,
        };

        if (start_time) options = { ...options, start_time: start_time };

        try {
            const response = await this.requestAPI("/api/v2/future/order", "get", options);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json.data;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresExposure(symbol = null) {
        const funcName = "[futuresExposure]:";

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        var options = {
            ticker: symbol,
        };

        try {
            const response = await this.requestAPI("/api/v2/future/position", "get", options);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json.data[0];
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresBalance(symbol = null) {
        const funcName = "[futuresBalance]:";

        try {
            const response = await this.requestAPI("/api/v2/future/wallet", "get", {});
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            if (!symbol) {
                return json.data;
            } else {
                const ticker = json.data.find((item) => item.symbol == symbol);
                if (!ticker) throw new Error(`${funcName} ${symbol} is not found`);

                return ticker;
            }
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresTickers() {
        const funcName = "[futuresTickers]:";

        var options = {
            ticker: "BTCUSDT", // required, not supported all tickers
        };

        try {
            const response = await this.requestAPI("/api/v2/future/market", "get", options);
            const json = response.data;

            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            return json.data;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async futuresPrices(symbol = null) {
        const funcName = "[futuresPrices]:";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        var options = {
            ticker: symbol,
        };

        try {
            const response = await this.requestAPI("/api/v2/future/market", "get", options);
            const json = response.data;
            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            } else if (json.data.ticker === symbol) {
                return json.data.last_price;
            }
            throw new Error(`${funcName} ${symbol} is not found`);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async futuresKlines(symbol = "BTCUSDT", interval = "1min", startTime = null, endTime = null, size = 100) {
        const funcName = "[futuresKlines]:";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!interval) throw new Error(`${funcName} interval is blank`);
        symbol = symbol.toUpperCase();
        var options = {
            ticker: symbol,
            interval: interval,
            startTime: startTime,
            endTime: endTime,
            size: size,
        };
        try {
            const response = await this.requestAPI("/api/v2/future/market/kline", "get", options);
            const json = response.data;
            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }
            return json;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async futuresTradeHistory(symbol = "BTCUSDT", position = null, direction = null, orderType = null, startTime = null, endTime = null, page = 1, size = null) {
        const funcName = "[futuresTradeHistory]";
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        if (position) {
            position = position.toUpperCase();
            if (!["BUY", "SELL"].includes(position)) throw new Error(`${funcName} position must be either 'BUY' or 'SELL'`);
        }

        if (direction) {
            direction = direction.toUpperCase();
            if (!["OPEN, CLOSE"].includes(direction)) throw new Error(`${funcName} direction must be either 'OPEN' or 'CLOSE'`);
        }

        if (orderType) {
            orderType = orderType.toUpperCase();
            if (!["MARKET", "LIMIT", "TAKE_PROFIT", "STOP_LOSS", "LIQUIDATION"].includes(orderType)) throw new Error(`${funcName} invalid orderType`);
        }

        if (!startTime && !endTime && !size) throw new Error(`${funcName} either timestamps or size must be speicifed`);

        var options = {
            ticker: symbol,
            position: position,
            direction: direction,
            order_type: orderType,
            startTime: startTime,
            endTime: endTime,
            page: page,
            size: size,
        };
        try {
            const response = await this.requestAPI("/api/v2/future/trade/history", "get", options);
            const json = response.data;
            if (json.code !== 0) {
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }
            return json.content;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

// export the class
module.exports = Bitmusa;
