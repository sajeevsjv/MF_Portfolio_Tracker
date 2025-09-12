import express from 'express';
const app = express();
import dotenv from "dotenv";
import mongoConnect from './db/mongoConnect.js';
import authRoutes from './routes/authRoutes.js';
dotenv.config();


mongoConnect();

app.use(express.json());

app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

