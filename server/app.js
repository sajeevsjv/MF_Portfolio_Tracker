import express from 'express';
const app = express();
import dotenv from "dotenv";
import mongoConnect from './db/mongoConnect.js';
import authRoutes from './routes/authRoutes.js';
import fundRoutes from './routes/fundRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import setupNavUpdateCronJob from './utils/cronJob.js';
import errorHandler from './utils/errorHandler.js';

dotenv.config();


mongoConnect();
setupNavUpdateCronJob();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/portfolio', portfolioRoutes);



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

