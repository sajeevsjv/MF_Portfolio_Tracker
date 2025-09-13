const cron = require('node-cron');
const Portfolio = require('../db/models/portfolio.js');
const { fetchAndSaveNAVHistory } = require('../services/navService');

export default setupNavUpdateCronJob = () =>{
  cron.schedule('0 0 * * *', async () => {  // Daily at midnight IST
    console.log('Running scheduled NAV update...');

    try {
      const schemeCodes = await Portfolio.distinct('schemeCode');

      for (const schemeCode of schemeCodes) {
        await fetchAndSaveNAVHistory(schemeCode);
      }

      console.log('NAV update completed successfully.');
    } catch (error) {
      console.error('Error during NAV update cron job:', error.message);
    }
  });
}
