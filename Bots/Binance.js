import WebSocket from 'ws';
import chalk from 'chalk';
import Table from 'cli-table3';

// Binance WebSocket Endpoints
const fundingRateStream = 'wss://fstream.binance.com/ws/!markPrice@arr'; // Funding rates
const priceStream = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';  // BTC/USDT live ticker

// High funding rate threshold (0.01 = 1%)
const HIGH_FUNDING_THRESHOLD = 0.01;

// Function to create a WebSocket connection with auto-reconnect
const createWebSocket = (url, messageHandler) => {
    let ws = new WebSocket(url);

    ws.on('open', () => console.log(chalk.green(`✅ Connected to ${url}`)));
    ws.on('message', messageHandler);
    ws.on('close', () => {
        console.log(chalk.red(`❌ Disconnected from ${url}, reconnecting...`));
        setTimeout(() => createWebSocket(url, messageHandler), 3000); // Reconnect after 3s
    });
    ws.on('error', (err) => console.error(chalk.red(`🚨 WebSocket Error: ${err.message}`)));
};

// Handle funding rate updates
const handleFundingRates = (data) => {
    const fundingData = JSON.parse(data);

    console.clear();
    console.log(chalk.blue("📊 Live Binance Funding Rates\n"));

    // Create a table for better terminal formatting
    const table = new Table({
        head: ['Symbol', 'Mark Price', 'Funding Rate', 'Position', 'Next Funding', 'Alert'],
        colWidths: [12, 15, 15, 15, 18, 15]
    });

    fundingData.forEach(market => {
        const fundingRate = (parseFloat(market.r) * 100).toFixed(4);
        const isHighFunding = fundingRate > HIGH_FUNDING_THRESHOLD;
        const position = parseFloat(market.r) > 0 ? chalk.green("LONG") : chalk.red("SHORT");
        const alert = isHighFunding ? chalk.red("🚨 High Funding!") : "";

        table.push([
            market.s,
            `$${parseFloat(market.p).toFixed(2)}`,
            fundingRate > 0 ? chalk.yellow.bold(`${fundingRate}%`) : `${fundingRate}%`,
            position,
            new Date(market.T).toLocaleTimeString(),
            alert
        ]);
    });

    console.log(table.toString());
};

// Handle BTC price updates
const handleBTCPrice = (data) => {
    const { s, c } = JSON.parse(data);
    console.log(chalk.green(`💰 Live Price Update: ${s} → $${c}`));
};

// Initialize WebSockets with reconnect logic
createWebSocket(fundingRateStream, handleFundingRates);
createWebSocket(priceStream, handleBTCPrice);
