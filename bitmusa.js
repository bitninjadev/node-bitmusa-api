const axios = require('axios');
const request = require('request');
const querystring = require('querystring');

class Bitmusa {
    constructor(options = {}) {
        if (typeof options === 'string') {
            this.options = {
                ...this.getDefaultOptions(),
                ...{ authKey: options }
            };
        } else if (typeof options == 'object') {
            this.options = {
                ...this.getDefaultOptions(),
                ...options
            };
        } else {
            this.options = this.getDefaultOptions();;
        }
    }

    getDefaultOptions() {
        return {
            baseURL: 'https://www.bitmusa.com/api',
            timeout: 1000
        }
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

    setTimeout(timeout) {
        this.options.timeout = timeout;
    }

    getTimeout() {
        return this.options.timeout;
    }

    async requestAPI(path, method, parameters = null) {
        method = method.toUpperCase();
        var options = {
            method: method,
            url: `${this.options.baseURL}${path}`,
            headers: {
                'x-auth-token': this.options.authKey,
                'Content-Type': 'application/json'
            },
            data: parameters,
            responseType: 'json',
            timeout: this.options.timeout
        };
        if (method === 'GET') options = Object.assign(options, { params: parameters });
        try {
            const response = await axios.request(options);
            return response;
        } catch (error) {
            throw new Error(`Failed to requestAPI(${path}): ${error.message}`);
        }

    }

    async requestFutureAPI(path, method, parameters = null) {
        method = method.toUpperCase();
        var options = {
            method: method,
            url: `${this.options.baseURL}${path}`,
            headers: {
                'x-auth-token': this.options.authKey,
                'Content-Type': 'application/json'
            },
            data: parameters,
            responseType: 'json',
            timeout: this.options.timeout
        };
        if (method === 'GET') options = Object.assign(options, { params: parameters });
        try {
            const response = await axios.request(options);
            return response;
        } catch (error) {
            return error.response;
        }
        
    }

    async signIn(email, password) {
        const funcName = '[signIn]:';

        if (!email) throw new Error(`${funcName} email is blank`);
        if (!password) throw new Error(`${funcName} password is blank`);

        try {
            const parameters = {
                email: email,
                password: password
            }
            const response = await this.requestAPI('/users/v1/signin', 'post', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {            
            throw new Error(`${error.message}`);
        }
    }

    async createOrder(direction, targetSymbol, baseSymbol = 'USDT', amount, type = "MARKET", price = null) {
        const funcName = '[createOrder]:';

        if (!direction) throw new Error(`${funcName} direction is blank`);
        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        if (!amount) throw new Error(`${funcName} amount is blank`);

        direction = direction.toUpperCase();
        const pair = `${targetSymbol}/${baseSymbol}`;

        var parameters = {
            symbol: pair,
            amount: `${amount}`,
            direction: direction,
            type: type,
            price: `${price}`,
        };
        if (type.toUpperCase().indexOf('LIMIT') >= 0) {
            parameters = Object.assign(parameters, { type: 'LIMIT_PRICE'});
        } else {
            parameters = Object.assign(parameters, { type: 'MARKET_PRICE', price: "0" });
        }
        //console.log(parameters);
        try {
            const response = await this.requestAPI('/exchange/order/add', 'get', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }


    async cancelOrder(orderId) {
        const funcName = '[cancelOrder]:';

        if (!orderId) throw new Error(`${funcName} orderId is blank`);

        try {
            const response = await this.requestAPI(`/exchange/order/cancel/${orderId}`, 'post');
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async cancelAllOrders(targetSymbol = null, baseSymbol = 'USDT', direction = null) {
        const funcName = '[cancelAllOrders]:';
        // direction is not working from API server
        // targetSymbol is not working from API server
        // baseSymbol is not working from API server
        // only cancel all orders
        
        var options = {
        };

        var pair = "";

        if (targetSymbol)
        {
            targetSymbol = targetSymbol.toUpperCase();
            baseSymbol = baseSymbol.toUpperCase();
            pair = `${targetSymbol}/${baseSymbol}`;
            options = Object.assign(options, { symbol: pair });
        }

        if (direction==null)
        {
            // cancel all direction
        } else {
            direction = direction.toUpperCase();
            if (direction !== 'BUY' && direction !== 'SELL') {
                throw new Error('[cancelAll] direction is not BUY or SELL or null');
            } else {
                if (direction=="BUY") direction = 0;
                if (direction=="SELL") direction = 1;
                options = Object.assign(options, { direction: direction });
            }
        } 

        console.log(options);

        try {
            const response = await this.requestAPI(`/exchange/order/cancelall`, 'post', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            console.log(json);
            if (json.code !== 0) {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchOpenOrders(pageNo = 1, pageSize = 10) {
        const funcName = '[fetchOpenOrders]:';
        if (pageNo < 1) throw new Error(`${funcName} pageNo start from 1`);

        var parameters = {
            pageNo : pageNo, // 1 is start, not 0
            pageSize : pageSize,
            //symbol : "BTC/USDT" // not supported

        }
        try {
            const response = await this.requestAPI('/exchange/order/personal/current', 'get', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchOrders(pageNo = 1, pageSize = 10, targetSymbol = null, baseSymbol = "USDT") {
        const funcName = '[fetchOrders]:';
        if (pageNo < 1) throw new Error(`${funcName} pageNo start from 1`);
        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const symbol = `${targetSymbol}/${baseSymbol}`;


        var parameters = {
            pageNo : pageNo, // 1 is start, not 0
            pageSize : pageSize,
        }
        if (symbol) parameters = Object.assign(parameters, { symbol: symbol });
        try {
            const response = await this.requestAPI('/exchange/order/personal/history', 'get', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }


    async fetchTrades(pageNo = 1, pageSize = 10, targetSymbol = null, baseSymbol = "USDT") {
        const funcName = '[fetchOrders]:';
        if (pageNo < 1) throw new Error(`${funcName} pageNo start from 1`);
        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const symbol = `${targetSymbol}/${baseSymbol}`;

        var parameters = {
            pageNo : pageNo, // 1 is start, not 0
            pageSize : pageSize,
        }
        if (symbol) parameters = Object.assign(parameters, { symbol: symbol });
        try {
            const response = await this.requestAPI('/exchange/trade/personal/history', 'get', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchRecentTrades(targetSymbol = null, baseSymbol = "USDT", pageSize = 20) {
        const funcName = '[getRecentTrades]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}/${baseSymbol}`;

        var parameters = {
            symbol : pair,
            size : pageSize
        }

        try {
            const response = await this.requestAPI('/market/latest-trade', 'get', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    

    async fetchTickers() {
        const funcName = '[fetchTitkcers]:';

        try {
            const response = await this.requestAPI('/market/symbol-thumb', 'get');
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async getTicker(targetSymbol = null, baseSymbol = "USDT") {
        const funcName = '[getTicker]:';

        if (targetSymbol === null) throw new Error(`${funcName} targetSymbol is blank`);
        const pair = targetSymbol + "/" + baseSymbol;

        try {
            const response = await this.requestAPI('/market/symbol-thumb', 'get');
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            const ticker = json.find((item) => item.symbol == pair);
            if (!ticker) throw new Error(`${funcName} ${pair} is not found`);

            return ticker;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async getPrice(targetSymbol = null, baseSymbol = "USDT") {
        const funcName = '[getPrice]:';

        if (targetSymbol === null) throw new Error(`${funcName} targetSymbol is blank`);
        const pair = targetSymbol + "/" + baseSymbol;

        try {
            const response = await this.requestAPI('/market/symbol-thumb', 'get');
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            const ticker = json.find((item) => item.symbol == pair);
            if (!ticker) throw new Error(`${funcName} ${pair} is not found`);
            if (!ticker.close) throw new Error(`${funcName} ${pair} close price is not found`);
            return ticker.close;

        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
    


    async fetchBalance() {
        const funcName = '[fetchBalance]:';

        try {
            const response = await this.requestAPI('/users/asset/wallet', 'get');
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            return json;
        } catch (error) {
            throw new Error(`Failed to balance: ${error.message}`);
        }
    }

    async getBalance(symbol = null) {
        const funcName = '[getBalance]:';

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        try {
            const response = await this.requestAPI('/users/asset/wallet', 'get');
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json.data);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 
            if (!json.data) throw new Error(`${funcName} data node is not found`);
            const balance = json.data.find((item) => item.coin.unit == symbol);
            if (!balance) throw new Error(`${funcName} ${symbol} is not found`);

            return balance;
        } catch (error) {
            throw new Error(`Failed to balance: ${error.message}`);
        }
    }



    async fetchOrderBook(targetSymbol = null, baseSymbol = "USDT") {
        const funcName = '[fetchOrderBook]:';
        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);

        const pair = targetSymbol + "/" + baseSymbol;

        var parameters = {
            symbol : pair
        }
    
        try {
            const response = await this.requestAPI('/market/exchange-plate-mini', 'get', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 
            if (json=="") throw new Error(`${funcName} ${pair} is not found`);

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }


    async fetchFutureRecentTrades(targetSymbol = null, baseSymbol = "USDT", pageSize = 50) {
        const funcName = '[getRecentTrades]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        if (pageSize == 0) throw new Error(`${funcName} pageSize is 0`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;

        var parameters = {
            ticker : pair,
            size : pageSize
        }

        try {
            const response = await this.requestFutureAPI('/future-market-trade/', 'get', parameters);
            if (response.status === 200) {
                const json = response.data;
                
                return json;
            } else if (response.status === 400) {
                throw new Error(`${funcName} ${response.data.detail.msg} [code:${response.data.detail.code}]`);
            } else {
                throw new Error(`${funcName} ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchFutureOrderbook(targetSymbol = "", baseSymbol = "TUSDT", size = 50) {
        const funcName = '[futureOrderbook]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;

        var parameters = {
            ticker : pair,
            size : size
        }

        try {
            const response = await this.requestAPI('/future-orderbook/', 'get', parameters);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            } 

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async openFuturePosition(targetSymbol = null, baseSymbol = "TUSDT", margin_mode = 0, position = "buy", order_type = 1, leverage = 10, order_price = 1, order_qty = 0) {
        const funcName = '[openFuturePosition]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;

        position = position.toUpperCase();
        if (position != "BUY" && position != "SELL") throw new Error("Position must be BUY or SELL");
        if (position == "BUY") position = 0; // long
        if (position == "SELL") position = 1; // short

        var options = {
            direction: 0, // 0: Open, 1: Close
            ticker: `${pair}`,
            margin_mode: margin_mode,
            position: position,
            order_type: order_type,
            leverage: leverage,
            order_price: order_price,
            order_qty: order_qty
        };

        try {
            const response = await this.requestAPI('/future-order/', 'post', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }

        
    }

    async closeFuturePosition(targetSymbol = null, baseSymbol = "TUSDT", margin_mode = 0, position = "buy", order_type = 1, leverage = 10, order_price = 1, order_qty = 0) {
        const funcName = '[closeFuturePosition]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;

        position = position.toUpperCase();
        if (position != "BUY" && position != "SELL") throw new Error("Position must be BUY or SELL");
        if (position == "BUY") position = 0; // long
        if (position == "SELL") position = 1; // short

        var options = {
            direction: 0, // 0: Open, 1: Close
            ticker: `${pair}`,
            margin_mode: margin_mode,
            position: position,
            order_type: order_type,
            leverage: leverage,
            order_price: order_price,
            order_qty: order_qty
        };

        try {
            const response = await this.requestAPI('/future-order/', 'post', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }

        
    }

    async cancelFutureOrder(order_id) {
        const funcName = '[cancelFutureOrder]:';

        if (!order_id) throw new Error(`${funcName} order_id is blank`);

        var options = {
        };

        try {
            const response = await this.requestAPI(`/future-order/cancel/${order_id}`, 'put', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }
            
            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async cancelAllFutureOrders(targetSymbol = null, baseSymbol = "TUSDT") {
        const funcName = '[cancelAllFutureOrders]:';
        var pair = null;

        if (!targetSymbol)
        {
            pair = "all";
        } else {
            targetSymbol = targetSymbol.toUpperCase();
            baseSymbol = baseSymbol.toUpperCase();
    
            pair = `${targetSymbol}${baseSymbol}`;    
        }
        
        var options = {
            ticker: `${pair}`
        };

        try {
            const response = await this.requestAPI('/future-order/cancel_all', 'put', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async closeAllFutureOrders(targetSymbol = null, baseSymbol = "TUSDT") {
        const funcName = '[closeAllFutureOrders]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;
        
        var options = {
            ticker: `${pair}`
        };

        try {
            const response = await this.requestAPI('/future-position/close_all', 'put', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async getFutureOrder(order_id) {
        throw new Error('Not implemented yet');
    }

    async fetchFutureOpenOrders(targetSymbol = null, baseSymbol = "TUSDT", size=50, start_time=null) {
        const funcName = '[fetchFutureOrders]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;

        var options = {
            ticker: `${pair}`,
            size: size
        };

        if (start_time) options = { ...options, start_time: start_time };

        try {
            const response = await this.requestAPI('/future-order/', 'get', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchFutureOrders(targetSymbol = null, baseSymbol = "TUSDT", size = 50, direction = null, position = null, order_type = null, order_status = null, start_time = null, end_time = null) {
        const funcName = '[fetchFutureOrders]:';

        var pair = null;
        var options = {
            size: size
        };

        if (!targetSymbol)
        {
            targetSymbol = targetSymbol.toUpperCase();
            baseSymbol = baseSymbol.toUpperCase();
            pair = `${targetSymbol}${baseSymbol}`;
            options = { ...options, ticker: `${pair}` };
        }
        if (direction!==null) options = { ...options, direction: direction }; // 0:open, 1:close
        if (position!==null) options = { ...options, position: position }; // 0:long, 1:short
        if (order_type!==null) options = { ...options, order_type: order_type }; //0: market, 1: limit, 2: take profit, 3: stop loss, 4: liquidation
        if (order_status!==null) options = { ...options, status: order_status }; //2: cancelled, 3: filled
        if (start_time!==null) options = { ...options, start_time: start_time }; // timestamp millisecond
        if (end_time!==null) options = { ...options, end_time: end_time }; // timestamp millisecond


        try {
            const response = await this.requestAPI('/future-order/history', 'get', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
    
    async fetchFutureTrades(targetSymbol = null, baseSymbol = "TUSDT", size=50, start_time = null, end_time = null) {
        const funcName = '[fetchFutureTrades]:';

        var pair = null;
        var options = {
            size: size
        };
        if (!targetSymbol)
        {
            
        } else {
            targetSymbol = targetSymbol.toUpperCase();
            baseSymbol = baseSymbol.toUpperCase();
            pair = `${targetSymbol}${baseSymbol}`;
            options = { ...options, ticker: `${pair}` };
        }

        if (start_time!==null) options = { ...options, start_time: start_time };
        if (end_time!==null) options = { ...options, end_time: end_time };

        try {
            const response = await this.requestAPI('/future-trade/history', 'get', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchFuturePositions(targetSymbol = null, baseSymbol = "TUSDT") {
        const funcName = '[fetchFuturePositions]:';

        var pair = null;
        var options = {
        };

        if (!targetSymbol) 
        {
            options = {};
        } else {
            targetSymbol = targetSymbol.toUpperCase();
            baseSymbol = baseSymbol.toUpperCase();
            const pair = `${targetSymbol}${baseSymbol}`;

            options = {...options, ticker: `${pair}` };
        }
        

        try {
            const response = await this.requestAPI('/future-position/', 'get', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchFutureBalance() {
        const funcName = '[fetchFutureBalance]:';

        try {
            const response = await this.requestAPI('/future-wallet/', 'get', {});
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async getFutureBalance(symbol = null) {
        const funcName = '[getFutureBalance]:';

        if (!symbol) throw new Error(`${funcName} symbol is blank`);
        symbol = symbol.toUpperCase();

        try {
            const response = await this.requestAPI('/future-wallet/', 'get', {});
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            const balance = json.find((item) => item.symbol === symbol);

            return balance;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async fetchFutureTickers() {
        const funcName = '[fetchFutureTickers]:';


        var options = {
            ticker : "TBTCTUSDT" // required, not supported all tickers
        };

        try {
            const response = await this.requestAPI('/future-board/', 'get', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async getFutureTicker(targetSymbol = null, baseSymbol = "TUSDT") {
        const funcName = '[getFutureTicker]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;

        var options = {
            ticker: `${pair}`
        };

        try {
            const response = await this.requestAPI('/future-board/', 'get', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            return json;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    async getFuturePrice(targetSymbol = null, baseSymbol = "TUSDT") {
        const funcName = '[getFuturePrice]:';

        if (!targetSymbol) throw new Error(`${funcName} targetSymbol is blank`);
        targetSymbol = targetSymbol.toUpperCase();
        baseSymbol = baseSymbol.toUpperCase();
        const pair = `${targetSymbol}${baseSymbol}`;

        var options = {
            ticker: `${pair}`
        };

        try {
            const response = await this.requestAPI('/future-board/', 'get', options);
            if (response.status !== 200) throw new Error(`${funcName} ${response.status}`);
            const json = response.data;
            //console.log(json);
            if ((json.code) && (json.code !== 0))
            {
                throw new Error(`${funcName} ${response.data.message}[code:${json.code}]`);
            }

            if (json.ticker===pair)
            {
                return json.last_price;
            }

            throw new Error(`${funcName} ${pair} is not found`);
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }





}

// export the class
module.exports = Bitmusa;