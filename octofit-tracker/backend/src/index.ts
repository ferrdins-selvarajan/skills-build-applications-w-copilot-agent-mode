import express from 'express';
import './config/database.js';

const app = express();
const port = Number(process.env.PORT ?? 8000);

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'octofit-tracker-api' });
});

app.listen(port, () => {
  console.log(`OctoFit Tracker API listening on port ${port}`);
});
