import cron  from 'node-cron';
import Portfolio from '../db/models/portfolio.js';
import {fetchAndSaveNAVHistory} from './importDatas/importNav.js';

const setupNavUpdateCronJob = () =>{
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

export default setupNavUpdateCronJob;
