import axios from 'axios';
import FundNavHistory from "../../db/models/fund_nav_history.js";
import FundNavLatest from "../../db/models/fund_latest_nav.js";

export const fetchAndSaveNAVHistory = async (schemeCode) =>  {
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

export const fetchAndSaveNAVLatest = async (schemeCode) =>  {
  try {
    const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}/latest`);
    const navLatest = response.data.data; 

    // Map and store in DB
    const records = navLatest.map(entry => ({
      schemeCode,
      nav: parseFloat(entry.nav),
      date: entry.date,
      createdAt: new Date()
    }));

    // Bulk insert (avoiding duplicates)
    await FundNavLatest.insertMany(records, { ordered: false }); 
    console.log(`NAV latest saved for schemeCode: ${schemeCode}`);
  } catch (error) {
    console.error(`Error fetching/saving NAV latest for schemeCode ${schemeCode}:`, error.message);
  }
}


