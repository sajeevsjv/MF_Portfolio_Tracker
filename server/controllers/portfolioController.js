import Portfolio from "../db/models/portfolio.js";
import Fund from "../db/models/funds.js";
import FundNavHistory from "../db/models/fund_nav_history.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

export const addToPortfolio = async (req, res) => {
  const userId = req.user;  // Set by checkLogin middleware
  const { schemeCode, units } = req.body;

  try {
    const existingEntry = await Portfolio.findOne({ userId, schemeCode });

    if (existingEntry) {
        let response = errorResponse({
            statusCode: 400,
            message: "Scheme already in portfolio"
        });
      return res.status(response.statusCode).json(response);
    }

    const newEntry = new Portfolio({
      userId,
      schemeCode,
      units,
      purchaseDate: new Date(),
    });

    await newEntry.save();

     let response = successResponse({
        statusCode: 201,
        message: "Fund added to portfolio successfully",
        data: newEntry
    });
     return res.status(response.statusCode).json(response);
    
  } catch (error) {
    console.error("Error adding to portfolio:", error);
     let response = errorResponse({
        statusCode: 500,
        message: "Internal Server Error"
    });
     return res.status(response.statusCode).json(response);
  }
}

// Get current portfolio value with P&L calculation
export const getPortfolioValue = async (req, res) => {
  const userId = req.user;

  try {
    const holdings = await Portfolio.find({ userId });

    let totalInvestment = 0;
    let currentValue = 0;
    const detailedHoldings = [];

    for (let holding of holdings) {
      const fund = await Fund.findOne({ schemeCode: holding.schemeCode });
      const latestNav = await FundNavHistory.findOne({ schemeCode: holding.schemeCode }).sort({ date: -1 });

      if (fund && latestNav) {
        const investedValue = holding.units * latestNav.nav;  // Simplified assumption
        const currentNav = latestNav.nav;
        const currentFundValue = holding.units * currentNav;

        totalInvestment += investedValue;
        currentValue += currentFundValue;

        detailedHoldings.push({
          schemeCode: holding.schemeCode,
          schemeName: fund.schemeName,
          units: holding.units,
          currentNav,
          currentValue: currentFundValue
        });
      }
    }

    const profitLoss = currentValue - totalInvestment;
    const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;


    let response = successResponse({
        statusCode: 200,
        message: "Portfolio value fetched successfully",
        data: {
          totalInvestment,
          currentValue,
            profitLoss,
            profitLossPercent,
            asOn: new Date().toISOString().split('T')[0],
            holdings: detailedHoldings
        }
    });
     return res.status(response.statusCode).json(response);
   
  } catch (error) {
    console.error("Error fetching portfolio value:", error);
    let response = errorResponse({
        statusCode: 500,
        message: "Internal Server Error"
    });
    return res.status(response.statusCode).json(response);
  }
}
