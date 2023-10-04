const axios = require("axios");
const request = require("request");
const querystring = require("querystring");
const FormData = require('form-data');

class Bitmusa {
    constructor(options = {}) {
        this.options = this.getDefaultOptions();

        if (typeof options === "string") {
            throw new Error("options must be an object");
        } else if (typeof options === "object") {
            if (!options.xApiKey || !options.authKey) throw new Error("xApiKey or authKey is blank");

            this.setApiKey(options.xApiKey);
            this.setAuthKey(options.authKey);

            if (options.baseURL) {
                this.setBaseURL(options.baseURL);
            }
            if (options.timeout) {
                this.setTimeout(options.timeout);
            }
        }
    }

    getDefaultOptions() {
        return {
            baseURL: "https://openapi.bitmusa.com",
            timeout: 1000,
        };
    }

    setBaseURL(baseURL) {
        this.options.baseURL = baseURL;
    }

    getBaseURL() {
        return this.options.baseURL;
    }

    setAuthKey(authKey) {
        this.options.authKey = authKey;
    }

    getAuthKey() {
        return this.options.authKey;
    }

    setApiKey(xApiKey) {
        this.options.xApiKey = xApiKey;
    }

    getApiKey() {
        return this.options.xApiKey;
    }

    setTimeout(timeout) {
        this.options.timeout = timeout;
    }

    getTimeout() {
        return this.options.timeout;
    }

    async requestAPI(path, method, parameters = null) {
        method = method.toUpperCase();
        const headers = {
            Authorization: `Bearer ${this.options.authKey}`,
            "x-api-key": this.options.xApiKey,
            "Content-Type": "application/json",
        };
        const url = `${this.options.baseURL}${path}`;
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
            return response;
        } catch (error) {
            throw new Error(`Failed to requestAPI(${path}): ${error.message}`);
        }
    }

    async requestFuturesAPI(path, method, parameters = null) {
        method = method.toUpperCase();
        const headers = {
            Authorization: `Bearer ${this.options.authKey}`,
            "x-api-key": this.options.xApiKey,
            "Content-Type": "application/json",
        };
        const url = `${this.options.baseURL}${path}`;
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
            return response;
        } catch (error) {
            return error.response;
        }
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
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
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

            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
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
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
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
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
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
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;

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
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            if (!symbol) {
                return json;
            } else {
                const ticker = json.find((item) => item.symbol == symbol);

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
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            if (symbol) {
                symbol = symbol.toUpperCase();

                const ticker = json.find((item) => item.symbol == symbol);
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
            const response = await this.requestFuturesAPI("/api/v1/spot/wallet", "get");
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            if (symbol) {
                symbol = symbol.toUpperCase();
                if (symbol.split("/").length == 2) throw new Error(`${funcName} symbol must be like BTC`);

                const balance = json.find((item) => item.coin.unit == symbol);
                if (!balance) throw new Error(`${funcName} ${symbol} is not found`);

                return balance;
            }

            return json;
        } catch (error) {
            throw new Error(`Failed to balance: ${error.message}`);
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
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;

            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
            if (json == "") throw new Error(`${funcName} ${symbol} is not found`);

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async klines(symbol = null, interval = "1m", startTime = null, endTime = null) {
        const funcName = "[klines]:";
        
        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        if (!interval) throw new Error(`${funcName} interval is blank`);
        if (!startTime) throw new Error(`${funcName} startTime is blank`);
        if (!endTime) throw new Error(`${funcName} endTime is blank`);
    
        symbol = symbol.toUpperCase();
    
        // create form data
        const formData = new URLSearchParams();
        formData.append('symbol', symbol);
        formData.append('from', String(startTime));
        formData.append('to', String(endTime));
        formData.append('resolution', interval);
        
        try {   
            const response = await this.requestAPI("/api/v1/spot/market/kline/history", "get", formData);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;
    
            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
            
            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async orderHistory(symbol = null, orderStatus = null, size = 10, startTime = null, endTime = null){
        const funcName = "[orderHistory]:";

        if(!symbol) throw new Error(`${funcName} symbol is blank`);
        if(!orderStatus) throw new Error(`${funcName} orderStatus is blank`);
        if(!startTime && !endTime && !size) throw new Error(`${funcName} either timestamp or size must be specified`);
    
        symbol = symbol.toUpperCase();
        orderStatus = orderStatus.toUpperCase();

        var parameters = {
            symbol: symbol,
            startTime: startTime,
            endTime: endTime,
            status: orderStatus,
            size: size, 
        }

        try{
            const response = await this.requestAPI("/api/v1/spot/order/history", "get", parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;
    
            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
            
            return json;
        }catch(error){
            throw new Error(`${error.message}`);
        }

    }

    async tradeHistory(symbol = null, startTime = null, endTime = null, direction = "BUY", size = 10){
        const funcName = "[tradeHistory]:";

        if(!symbol) throw new Error(`${funcName} symbol is blank`);
        if(!startTime && !endTime && !size) throw new Error(`${funcName} either timestamp or size must be specified`);
        if(!direction || direction.toUpperCase() !== "BUY" && direction.toUpperCase() !== "SELL") throw new Error(`${funcName} direction must be either BUY or SELL`);

        symbol = symbol.toUpperCase();
        direction = direction.toUpperCase();

        var parameters = {
            symbol: symbol,
            startTime: startTime,
            endTime: endTime,
            direction: direction,
            size: size,
        }

        try{
            const response = await this.requestAPI("/api/v1/spot/trade/history", "get", parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data.data;
    
            if (json.code && json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
            
            return json;
        }catch(error){
            logger.error(error)
        }
    }

    async futuresOrder(symbol = null, side = null, quantity = null, price = null,
        params = { 
        marginMode: "ISOLATED", 
        closePosition: false, 
        reduceOnly: false, 
        postOnly: false,
        takeProfit: {},
        stopLoss: {},
        }){
            
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
        
            const triggerTypeMap = { "MARK": 1, "LAST": 2 };
            const orderTypeMap = { "MARKET": 0, "LIMIT": 1 };
        
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
            ...stopLossOptions

        };
        
        try {
            const response = await this.requestFuturesAPI("/api/v2/future/order", "post", options);
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI(`/api/v2/future/order/cancel/${order_id}`, "post");
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI(`/api/v2/future/order/cancel/all?ticker=${symbol}`, "post");
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI(`/api/v2/future/position/close/all?ticker=${symbol}`, "post");
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/market/trade", "get", parameters);
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/leverage", "post", options);
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/market/orderbook", "get", parameters);
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/order", "get", options);
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/position", "get", options);
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/wallet", "get", {});
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/market", "get", options);
            const json = response.data;

            if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
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
            const response = await this.requestFuturesAPI("/api/v2/future/market", "get", options);
            const json = response.data;

            if (json.data.ticker === symbol) {
                return json.data.last_price;
            } else if (json.code !== 0) {
                if (!json.message) throw new Error(`${funcName} ${response.status} ${response.statusText}`);
                throw new Error(`${funcName} ${json.message}[code:${json.code}]`);
            }

            throw new Error(`${funcName} ${symbol} is not found`);
        } catch (error) {
            throw new Error(`${funcName} An error occurred while fetching the future price:`, error.message);
        }
    }
}

// export the class
module.exports = Bitmusa;
