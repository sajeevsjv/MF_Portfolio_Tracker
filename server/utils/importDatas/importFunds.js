import Funds from "../../db/models/funds.js"
import axios from "axios";
import mongoConnect from "../../db/mongoConnect.js";

async function importAllFunds() {

  mongoConnect()

  // 1) Fetch from API
  const resp = await axios.get('https://api.mfapi.in/mf')
  const funds = resp.data

  // 2) Save into DB
  let count = 0
  for (const f of funds) {
    await Funds.updateOne(
      { schemeCode: f.schemeCode },      // find by schemeCode
      { $set: {                          // update fields
          schemeCode: f.schemeCode,
          schemeName: f.schemeName,
          fundHouse: f.fundHouse || ''
      }},
      { upsert: true }                   // insert if not found
    )
    count++
    if (count % 500 === 0) console.log(`Inserted ${count}`)
  }

  console.log(`✅ Imported ${count} funds`)
  process.exit(0)
}

importAllFunds().catch(err => {
  console.error('❌ Import failed:', err.message)
  process.exit(1)
})
