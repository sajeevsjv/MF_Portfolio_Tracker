import express from 'express';
import { 
  addToPortfolio, 
  getPortfolioValue, 
  getPortfolioHistory,
  listPortfolio,
  removeFromPortfolio 
} from '../controllers/portfolioController.js';
import checkLogin from '../utils/checkLogin.js';

const router = express.Router();

router.post('/add', checkLogin, addToPortfolio);

router.get('/value', checkLogin, getPortfolioValue);

router.get('/history', checkLogin, getPortfolioHistory);

router.get('/list', checkLogin, listPortfolio);

router.delete('/remove/:schemeCode', checkLogin, removeFromPortfolio);

export default router;