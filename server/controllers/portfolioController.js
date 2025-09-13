import Portfolio from "../db/models/portfolio.js";
import Fund from "../db/models/funds.js";
import FundNavHistory from "../db/models/fund_nav_history.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

export const addToPortfolio = async (req, res) => {
  const userId = req.user;  // Set by checkLogin middleware
  const { schemeCode, units } = req.body;

  try {
    // Validate required fields
    if (!schemeCode || !units) {
      const response = errorResponse({
        statusCode: 400,
        message: "SchemeCode and units are required"
      });
      return res.status(response.statusCode).json(response);
    }

    // Validate units is a positive number
    if (units <= 0) {
      const response = errorResponse({
        statusCode: 400,
        message: "Units must be a positive number"
      });
      return res.status(response.statusCode).json(response);
    }

    const existingEntry = await Portfolio.findOne({ userId, schemeCode });

    if (existingEntry) {
      const response = errorResponse({
        statusCode: 409, // Conflict - more appropriate than 400
        message: "Scheme already exists in portfolio"
      });
      return res.status(response.statusCode).json(response);
    }

    // Verify the fund exists
    const fund = await Fund.findOne({ schemeCode });
    if (!fund) {
      const response = errorResponse({
        statusCode: 404,
        message: "Fund with given scheme code not found"
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

    const response = successResponse({
      statusCode: 201,
      message: "Fund added to portfolio successfully",
      data: newEntry
    });
    return res.status(response.statusCode).json(response);
    
  } catch (error) {
    console.error("Error adding to portfolio:", error);
    const response = errorResponse({
      statusCode: 500,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    return res.status(response.statusCode).json(response);
  }
};

// Get current portfolio value with P&L calculation
export const getPortfolioValue = async (req, res) => {
  const userId = req.user;

  try {
    const holdings = await Portfolio.find({ userId });

    if (holdings.length === 0) {
      const response = successResponse({
        statusCode: 200,
        message: "No holdings in portfolio",
        data: {
          totalInvestment: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercent: 0,
          asOn: new Date().toISOString().split('T')[0],
          holdings: []
        }
      });
      return res.status(response.statusCode).json(response);
    }

    let totalInvestment = 0;
    let currentValue = 0;
    const detailedHoldings = [];

    for (let holding of holdings) {
      const fund = await Fund.findOne({ schemeCode: holding.schemeCode });
      const latestNav = await FundNavHistory.findOne({ 
        schemeCode: holding.schemeCode 
      }).sort({ date: -1 });

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
          currentValue: currentFundValue,
          purchaseDate: holding.purchaseDate
        });
      }
    }

    const profitLoss = currentValue - totalInvestment;
    const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    const response = successResponse({
      statusCode: 200,
      message: "Portfolio value fetched successfully",
      data: {
        totalInvestment,
        currentValue,
        profitLoss,
        profitLossPercent: Number(profitLossPercent.toFixed(2)),
        asOn: new Date().toISOString().split('T')[0],
        holdings: detailedHoldings
      }
    });
    return res.status(response.statusCode).json(response);
   
  } catch (error) {
    console.error("Error fetching portfolio value:", error);
    const response = errorResponse({
      statusCode: 500,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    return res.status(response.statusCode).json(response);
  }
};

// Get historical portfolio value (last 30 days or custom range)
export const getPortfolioHistory = async (req, res) => {
  const userId = req.user;
  const { startDate, endDate } = req.query;

  try {
    // Validate date parameters
    if (!startDate || !endDate) {
      const response = errorResponse({
        statusCode: 400,
        message: "Start date and end date are required"
      });
      return res.status(response.statusCode).json(response);
    }

    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const response = errorResponse({
        statusCode: 400,
        message: "Invalid date format. Please use YYYY-MM-DD format"
      });
      return res.status(response.statusCode).json(response);
    }

    if (start > end) {
      const response = errorResponse({
        statusCode: 400,
        message: "Start date cannot be later than end date"
      });
      return res.status(response.statusCode).json(response);
    }

    const holdings = await Portfolio.find({ userId });

    if (holdings.length === 0) {
      const response = successResponse({
        statusCode: 200,
        message: "No holdings in portfolio",
        data: []
      });
      return res.status(response.statusCode).json(response);
    }

    // Get history for all schemes, not just the first one
    const portfolioHistory = [];
    
    for (const holding of holdings) {
      const history = await FundNavHistory.find({
        schemeCode: holding.schemeCode,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const fund = await Fund.findOne({ schemeCode: holding.schemeCode });
      
      portfolioHistory.push({
        schemeCode: holding.schemeCode,
        schemeName: fund?.schemeName || 'Unknown',
        units: holding.units,
        history: history.map(entry => ({
          date: entry.date,
          nav: entry.nav,
          value: holding.units * entry.nav
        }))
      });
    }

    const response = successResponse({
      statusCode: 200,
      message: "Portfolio history fetched successfully",
      data: portfolioHistory
    });
    return res.status(response.statusCode).json(response);
    
  } catch (error) {
    console.error("Error fetching portfolio history:", error);
    const response = errorResponse({
      statusCode: 500,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    return res.status(response.statusCode).json(response);
  }
};

// List all holdings in portfolio
export const listPortfolio = async (req, res) => {
  const userId = req.user;

  try {
    const holdings = await Portfolio.find({ userId });

    if (holdings.length === 0) {
      const response = successResponse({
        statusCode: 200,
        message: "No holdings in portfolio",
        data: {
          totalHoldings: 0,
          holdings: []
        }
      });
      return res.status(response.statusCode).json(response);
    }

    const detailedHoldings = await Promise.all(holdings.map(async (holding) => {
      const fund = await Fund.findOne({ schemeCode: holding.schemeCode });
      const latestNav = await FundNavHistory.findOne({ 
        schemeCode: holding.schemeCode 
      }).sort({ date: -1 });

      return {
        schemeCode: holding.schemeCode,
        schemeName: fund?.schemeName || 'Unknown',
        units: holding.units,
        purchaseDate: holding.purchaseDate,
        currentNav: latestNav?.nav || 0,
        currentValue: holding.units * (latestNav?.nav || 0)
      };
    }));

    const response = successResponse({
      statusCode: 200,
      message: "Portfolio holdings fetched successfully",
      data: {
        totalHoldings: detailedHoldings.length,
        holdings: detailedHoldings
      }
    });
    return res.status(response.statusCode).json(response);
    
  } catch (error) {
    console.error("Error fetching portfolio holdings:", error);
    const response = errorResponse({
      statusCode: 500,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    return res.status(response.statusCode).json(response);
  }
};

// Remove a mutual fund from portfolio
export const removeFromPortfolio = async (req, res) => {
  const userId = req.user;
  const { schemeCode } = req.params;

  try {
    // Validate schemeCode parameter
    if (!schemeCode) {
      const response = errorResponse({
        statusCode: 400,
        message: "Scheme code is required"
      });
      return res.status(response.statusCode).json(response);
    }

    const deletedHolding = await Portfolio.findOneAndDelete({ userId, schemeCode });

    if (!deletedHolding) {
      const response = errorResponse({
        statusCode: 404,
        message: "Holding not found in portfolio"
      });
      return res.status(response.statusCode).json(response);
    }

    const response = successResponse({
      statusCode: 200,
      message: "Fund removed from portfolio successfully",
      data: {
        removedSchemeCode: schemeCode,
        removedUnits: deletedHolding.units
      }
    });
    return res.status(response.statusCode).json(response);
    
  } catch (error) {
    console.error("Error removing from portfolio:", error);
    const response = errorResponse({
      statusCode: 500,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    return res.status(response.statusCode).json(response);
  }
};