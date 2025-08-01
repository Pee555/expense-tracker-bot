const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  console.log('📩 ได้รับ Webhook:', JSON.stringify(req.body, null, 2));
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('🚀 Webhook Server is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
