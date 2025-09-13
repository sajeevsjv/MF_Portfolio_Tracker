import express from 'express';
import { addToPortfolio, getPortfolioValue } from '../controllers/portfolioController.js';
import checkLogin from '../utils/checkLogin.js';

const router = express.Router();
router.post('/add', checkLogin, addToPortfolio);
router.get('/value', checkLogin, getPortfolioValue);

export default router;