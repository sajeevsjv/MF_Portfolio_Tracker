const axios = require('axios');
const FundNavHistory = require('../../db/models/fund_nav_history.js'); // Mongoose model

export default fetchAndSaveNAVHistory = async (schemeCode) =>  {
  try {
    const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`);
    const navHistory = response.data.data; 

    // Map and store in DB
    const records = navHistory.map(entry => ({
      schemeCode,
      nav: parseFloat(entry.nav),
      date: entry.date,
      createdAt: new Date()
    }));

    // Bulk insert (avoiding duplicates)
    await FundNavHistory.insertMany(records, { ordered: false }); 
    console.log(`NAV history saved for schemeCode: ${schemeCode}`);
  } catch (error) {
    console.error(`Error fetching/saving NAV history for schemeCode ${schemeCode}:`, error.message);
  }
}
