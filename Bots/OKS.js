import WebSocket from 'ws';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// === Config ===
const SYMBOL = 'BTC-USDT'; // Trading pair for Futures
const FUNDING_THRESHOLD = 0.0005; // Funding rate threshold (e.g., 0.05%)
const ORDER_SIZE = '0.01'; // In BTC

// === API Credentials ===
const API_KEY = process.env.OKEX_API_KEY;
const API_SECRET = process.env.OKEX_API_SECRET;
const API_PASSPHRASE = process.env.OKEX_API_PASSPHRASE;
const BASE_URL = process.env.OKEX_BASE_URL;

// === Signature Function ===
function signRequest(method, path, params = '', timestamp) {
  const preSign = `${timestamp}${method}${path}${params}`;
  return crypto.createHmac('sha256', API_SECRET).update(preSign).digest('hex');
}

// === Place Market Order ===
async function placeOrder(side) {
  const timestamp = Date.now().toString();
  const path = '/api/v5/trade/order';

  const bodyObj = {
    instId: SYMBOL,
    tdMode: 'cross', // Cross-margin
    side: side, // 'buy' for long, 'sell' for short
    ordType: 'market',
    sz: ORDER_SIZE,
  };

  const params = `instId=${SYMBOL}&side=${side}&ordType=market&sz=${ORDER_SIZE}`;
  const signature = signRequest('POST', path, params, timestamp);

  try {
    const res = await axios.post(`${BASE_URL}${path}`, bodyObj, {
      headers: {
        'OK-API-KEY': API_KEY,
        'OK-API-SIGN': signature,
        'OK-API-TIMESTAMP': timestamp,
        'OK-API-PASSPHRASE': API_PASSPHRASE,
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ Order Result:', res.data);
  } catch (err) {
    console.error('❌ Order Failed:', err.response?.data || err.message);
  }
}

// === WebSocket for Market Data ===
const ws = new WebSocket('wss://real.okex.com:8443/ws/v5/public');

ws.on('open', () => {
  console.log('🟢 WebSocket connected');
  const msg = {
    op: 'subscribe',
    args: [`markPrice:${SYMBOL}`, `fundingRate:${SYMBOL}`], // Subscribe to mark price and funding rate
  };
  ws.send(JSON.stringify(msg));
});

// Listen for price updates (mark price) and funding rates
ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data);
    if (msg.event === 'subscribe' && msg.arg.channel) {
      if (msg.arg.channel.includes('markPrice')) {
        const price = parseFloat(msg.data[0].markPrice); // Mark price
        console.log(`📊 Mark Price: ${price}`);

        // Check funding rate logic and place orders
        if (price > FUNDING_THRESHOLD) {
          console.log('🚨 High price → SHORT');
          placeOrder('sell');  // Short if price is high
        } else if (price < -FUNDING_THRESHOLD) {
          console.log('🚨 Low price → LONG');
          placeOrder('buy');   // Long if price is low
        }
      }
    }
  } catch (err) {
    console.error('WebSocket error:', err.message);
  }
});

ws.on('error', err => console.error('WebSocket Error:', err.message));
ws.on('close', () => console.log('🔴 WebSocket closed'));
