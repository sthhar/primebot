# PrimeBot Demo

Ini adalah tahap backend **Demo/Paper Trading**. Tidak ada koneksi ke exchange, broker, rekening bank, atau uang nyata.

## Menjalankan

1. Install Node.js 18+.
2. Di folder project:
   npm install
3. Jalankan:
   npm start
4. Buka:
   http://localhost:3000

## API demo

- GET  /api/state
- GET  /api/trades
- POST /api/bot/start
- POST /api/bot/stop
- POST /api/config
- POST /api/reset-demo

## Catatan

Engine demo membuka trade virtual dan menutupnya setelah beberapa detik untuk memudahkan pengujian UI. Hasil menang/kalah dibuat simulatif.

Sebelum tahap live, engine harus diganti dengan market-data provider dan execution adapter resmi untuk exchange/broker yang dipilih, plus autentikasi, audit log, risk controls, encrypted secrets, dan pengujian menyeluruh.
