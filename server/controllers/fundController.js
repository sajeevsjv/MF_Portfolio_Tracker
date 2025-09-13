import funds from "../db/models/funds.js";
import FundLatestNav from "../db/models/fund_latest_nav.js";
import FundNavHistory from "../db/models/fund_nav_history.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

export const getFunds = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;

        const skip = (page - 1) * limit;
        const query = search
            ? { schemeName: { $regex: search, $options: "i" } }
            : {};
        const fundList = await funds.find(query).skip(skip).limit(Number(limit));

        let response = successResponse({
            statusCode: 200,
            message: "Funds fetched successfully",
            data: fundList
        });
        return res.status(200).send(response);
    } catch (error) {
        console.error("Error fetching funds:", error);
        let response = errorResponse({
            statusCode: 500,
            message: "Internal Server Error"
        });
        return res.status(500).send(response);
    }
};

export const getNavHistory = async (req, res) => {
    try {
        const schemeCode = parseInt(req.params.schemeCode)

        // 1) Find fund info
        const fund = await funds.findOne({ schemeCode })
        if (!fund) {
            return res.status(404).json({ success: false, message: 'Fund not found' })
        }

        // 2) Get latest NA
        const latest = await FundLatestNav.findOne({ schemeCode })
        if (!latest) {
            return res.status(404).json({ success: false, message: 'NAV not available yet' })
        }

        // 3) Get history (last 30 days)
        const history = await FundNavHistory.find({ schemeCode })
            .sort({ date: -1 })   // latest first
            .limit(30)            // last 30 records

        // 4) Format response

        let response = successResponse({
            statusCode: 200,
            message: "NAV history fetched successfully",
            data: {
                schemeCode,
                schemeName: fund.schemeName,
                currentNav: latest.nav,
                asOn: latest.date,
                history: history.map(h => ({
                    date: h.date,
                    nav: h.nav
                }))
            }
        });
        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.error('Error in /funds/:schemeCode/nav', err)
        let response = errorResponse({
            statusCode: 500,
            message: "Internal Server Error"
        });
        return res.status(response.statusCode).json(response);
    }
}

