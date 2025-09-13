# Mutual Fund Portfolio Tracker API

## Overview

This project is a Mutual Fund Portfolio Tracker API built for BancWise Technologies LLP. It helps investors manage their mutual fund portfolios, track current values, view historical performance, and keep NAV data up-to-date automatically.

## 📚 Company Context

We are a mutual fund wealth and fintech company operating in the Indian financial market. This system enables real-time portfolio management and historical data tracking of mutual fund investments in India.

---

## 🚀 Features

- User Authentication (Signup / Login)
- Add and manage mutual fund investments in a portfolio
- Calculate current portfolio value with profit/loss
- View portfolio historical performance
- Auto-update NAV data via scheduled cron jobs
- Optional: Admin dashboard APIs
- Optional: Frontend implementation (React.js, Vue.js, Angular, etc.)

---

## ⚙️ Tech Stack

- **Backend:** Node.js + Express.js  
- **Database:** MongoDB Atlas (Free Tier)  
- **Authentication:** JWT  
- **Password Hashing:** bcrypt  
- **HTTP Client:** Axios / node-fetch  
- **Scheduling:** node-cron  

---

## 🌐 External APIs

- Fund List: `https://api.mfapi.in/mf`  
- NAV History: `https://api.mfapi.in/mf/{schemeCode}`  
- Latest NAV: `https://api.mfapi.in/mf/{schemeCode}/latest`

---

## 🗂️ Database Collections

1. **Users Collection**  
   - `_id`, `email`, `passwordHash`, `name`, `createdAt`, `role`

2. **Portfolio Collection**  
   - `_id`, `userId`, `schemeCode`, `units`, `purchaseDate`, `createdAt`

3. **Funds Collection**  
   - `schemeCode`, `schemeName`, `isinGrowth`, `isinDivReinvestment`, `fundHouse`, `schemeType`, `schemeCategory`

4. **fund_latest_nav Collection**  
   - `schemeCode`, `nav`, `date`, `updatedAt`

5. **fund_nav_history Collection**  
   - `schemeCode`, `nav`, `date`, `createdAt`

---

## 📋 API Endpoints

### Authentication

- `POST /api/auth/signup` — Register a new user  
- `POST /api/auth/login` — Login existing user

### Portfolio Management

- `POST /api/portfolio/add` — Add a mutual fund  
- `GET /api/portfolio/value` — Get current portfolio value with P&L  
- `GET /api/portfolio/history` — Get historical performance  
- `GET /api/portfolio/list` — List complete portfolio  
- `DELETE /api/portfolio/remove/:schemeCode` — Remove a fund

### Fund Information

- `GET /api/funds` — List of all mutual funds (with pagination)  
- `GET /api/funds/:schemeCode/nav` — NAV history for a specific fund

---

## ⏲️ Automated NAV Updates (Cron Job)

- Schedule: Every day at 12:00 AM IST  
- Purpose: Fetch latest NAVs, update `fund_latest_nav`, and add records to `fund_nav_history`

---

## 🔐 Security Measures

- Password strength validation  
- JWT-based authentication with 24-hour expiration  
- Rate limiting for login attempts, API calls, and portfolio updates  
- Input validation and sanitization  

---



## 🚀 Setup Instructions

1. Clone the repository:
   
   git clone https://github.com/sajeevsjv/MF_Portfolio_Tracker.git

   - cd server
   npm install

   npm run import-funds (additional script for frtching funds and updt in db)
   
   npm run dev (runs the project)
   

   backend deployed on vercel - https://mf-portfolio-tracker.vercel.app/
   
