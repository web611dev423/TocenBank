// https://bybit-exchange.github.io/docs/v5/websocket/public/ticker#response-example
// https://www.bybit.com/en/announcement-info/fund-rate/

import WebSocket from "ws";
import chalk from "chalk";
import Table from "cli-table3";

// Bybit Unified Testnet WebSocket (linear)
const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear");

ws.on("open", () => {
  console.log("WebSocket connected ✅");

  // Subscribe to ticker stream for BTCUSDT
  const msg = {
    op: "subscribe",
    args: ["tickers.BTCUSDT"],
  };

  ws.send(JSON.stringify(msg));
});

ws.on("message", (data) => {
  try {
    const parsed = JSON.parse(data);
    // console.log(parsed)
    // Filter only ticker updates
    if (parsed.topic?.startsWith("tickers.")) {
      const symbol = parsed.topic.split(".")[1];
      const ticker = parsed.data;

      // console.clear();
      console.log(chalk.blue("📊 Live BYBIT Funding Rates\n"));

      // Create a table for better terminal formatting
      const table = new Table({
        head: [
          "Symbol",
          "Mark Price",
          "Funding Rate",
          "Position",
          "Next Funding",
          "Alert",
        ],
        colWidths: [12, 15, 15, 15, 18, 15],
      });

      const position =
        parseFloat(ticker.fundingRate) > 0
          ? chalk.green("LONG")
          : chalk.red("SHORT");
      const fundingRate = (parseFloat(ticker.fundingRate) * 100).toFixed(4);
      const alert =  ticker.highPrice24h ? chalk.red("🚨 High Funding!") : "";

      table.push([
        ticker.symbol,
        `$${parseFloat(ticker.markPrice).toFixed(2)}`,
        fundingRate > 0
          ? chalk.yellow.bold(`${fundingRate}%`)
          : `${fundingRate}%`,
        position,
        new Date(ticker.nextFundingTime).toLocaleTimeString(),
        alert,
      ]);

      // console.log(ticker.nextFundingTime);
      // console.log(ticker);
      console.log(table.toString());
    }
  } catch (e) {
    console.error("Error parsing message:", e.message);
  }
});

ws.on("close", () => {
  console.log("WebSocket closed ❌");
  setTimeout(() => createWebSocket(url, messageHandler), 3000); // Reconnect after 3s
});
ws.on("error", (err) => console.error("WebSocket error:", err.message));
