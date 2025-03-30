/**
 * Test Server
 * Minimal Express server to test deployment
 */

import express from 'express';

const app = express();
const port = 3002;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:${port}`);
});