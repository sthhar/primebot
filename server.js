const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const state = {
  bot: {
    running: false,
    strategy: "Fast",
    asset: "Z-CRY/IDX",
    intervalSeconds: 60,
    bidAmount: 1000000,
    wallet: "DEMO",
    stopLoss: 0,
    takeProfit: 9999999999
  },
  wallet: {
    balance: 10000000,
    profitToday: 0
  },
  currentTrade: null,
  trades: []
};

let timer = null;
let tradeId = 1;

function now() {
  return new Date().toISOString();
}

function createDemoTrade() {
  if (!state.bot.running || state.currentTrade) return;

  const amount = Math.min(state.bot.bidAmount, state.wallet.balance);
  if (amount <= 0) return;

  state.wallet.balance -= amount;

  state.currentTrade = {
    id: tradeId++,
    asset: state.bot.asset,
    strategy: state.bot.strategy,
    direction: Math.random() > 0.5 ? "CALL" : "PUT",
    amount,
    openedAt: now(),
    status: "OPEN"
  };

  setTimeout(() => closeDemoTrade(state.currentTrade.id), 8000);
}

function closeDemoTrade(id) {
  const t = state.currentTrade;
  if (!t || t.id !== id) return;

  // Demo-only deterministic-ish result: win 55%, payout 80% of stake.
  const win = Math.random() < 0.55;
  const profit = win ? Math.round(t.amount * 0.8) : -t.amount;

  t.closedAt = now();
  t.status = win ? "WIN" : "LOSS";
  t.profit = profit;

  state.wallet.balance += win ? t.amount + profit : 0;
  state.wallet.profitToday += profit;
  state.trades.unshift(t);
  state.currentTrade = null;

  if (state.bot.takeProfit > 0 && state.wallet.profitToday >= state.bot.takeProfit) {
    stopBot();
  }
  if (state.bot.stopLoss > 0 && state.wallet.profitToday <= -state.bot.stopLoss) {
    stopBot();
  }
}

function startBot() {
  if (state.bot.running) return;
  state.bot.running = true;
  createDemoTrade();
  timer = setInterval(createDemoTrade, state.bot.intervalSeconds * 1000);
}

function stopBot() {
  state.bot.running = false;
  if (timer) clearInterval(timer);
  timer = null;
}

app.get("/api/state", (req, res) => {
  res.json(state);
});

app.post("/api/bot/start", (req, res) => {
  startBot();
  res.json({ ok: true, state });
});

app.post("/api/bot/stop", (req, res) => {
  stopBot();
  res.json({ ok: true, state });
});

app.post("/api/config", (req, res) => {
  const allowed = ["strategy","asset","intervalSeconds","bidAmount","wallet","stopLoss","takeProfit"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) state.bot[key] = req.body[key];
  }
  res.json({ ok: true, bot: state.bot });
});

app.get("/api/trades", (req, res) => {
  res.json({ trades: state.trades, currentTrade: state.currentTrade });
});

app.post("/api/reset-demo", (req, res) => {
  stopBot();
  state.wallet.balance = 10000000;
  state.wallet.profitToday = 0;
  state.currentTrade = null;
  state.trades = [];
  res.json({ ok: true, state });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`PrimeBot Demo running at http://localhost:${PORT}`);
});
