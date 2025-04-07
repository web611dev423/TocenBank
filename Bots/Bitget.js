import WebSocket from 'ws';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// === Config ===
const SYMBOL = 'BTCUSDT_UMCBL'; // BTCUSDT Perp on Bitget
const FUNDING_THRESHOLD = 0.0005; // 0.05%
const ORDER_SIZE = '0.01'; // In BTC

// === API Credentials ===
const API_KEY = process.env.BITGET_API_KEY;
const API_SECRET = process.env.BITGET_API_SECRET;
const API_PASSPHRASE = process.env.BITGET_API_PASSPHRASE;
const BASE_URL = process.env.BITGET_BASE_URL;

// === Signature Function ===
function signRequest(method, path, body = '', timestamp) {
  const preSign = `${timestamp}${method}${path}${body}`;
  return crypto.createHmac('sha256', API_SECRET).update(preSign).digest('hex');
}

// === Place Market Order ===
async function placeOrder(side) {
  const timestamp = Date.now().toString();
  const path = '/api/mix/v1/order/placeOrder';

  const bodyObj = {
    symbol: SYMBOL,
    marginCoin: 'USDT',
    side: side, // 'open_long' or 'open_short'
    orderType: 'market',
    size: ORDER_SIZE,
  };

  const body = JSON.stringify(bodyObj);
  const signature = signRequest('POST', path, body, timestamp);

  try {
    const res = await axios.post(`${BASE_URL}${path}`, bodyObj, {
      headers: {
        'ACCESS-KEY': API_KEY,
        'ACCESS-SIGN': signature,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-PASSPHRASE': API_PASSPHRASE,
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ Order Result:', res.data);
  } catch (err) {
    console.error('❌ Order Failed:', err.response?.data || err.message);
  }
}

// === WebSocket for Funding Rate ===
const ws = new WebSocket('wss://ws.bitget.com/mix/v1/stream');

ws.on('open', () => {
  console.log('🟢 WebSocket connected');
  const msg = {
    op: 'subscribe',
    args: [
      {
        instType: 'mc',
        channel: 'funding_rate',
        instId: SYMBOL
      }
    ]
  };
  ws.send(JSON.stringify(msg));
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data);
    if (msg.arg?.channel === 'funding_rate') {
      const rate = parseFloat(msg.data[0].fundingRate);
      console.log(`📊 Funding Rate: ${rate}`);

      if (rate > FUNDING_THRESHOLD) {
        console.log('🚨 HIGH funding → SHORT');
        placeOrder('open_short');
      } else if (rate < -FUNDING_THRESHOLD) {
        console.log('🚨 NEGATIVE funding → LONG');
        placeOrder('open_long');
      }
    }
  } catch (err) {
    console.error('WebSocket error:', err.message);
  }
});

ws.on('error', err => console.error('WebSocket Error:', err.message));
ws.on('close', () => console.log('🔴 WebSocket closed'));
