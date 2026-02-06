# CreditLeliya: AI-Powered Financial Operating System

**CreditLeliya** is a premium, high-fidelity financial platform designed to bridge the gap between individual taxpayers, businesses, and professional financial advisors. It leverages advanced AI for document analysis, strategic planning, and automated tax compliance.

---

## 🚀 Core Functionalities

### 1. Unified Authentication System
- **Social Integration**: Secure login via Google and Apple.
- **Role-Based Access**: Specialized interfaces for **Regular Users**, **Chartered Accountants (CAs)**, and **Financial Analysts**.
- **Security**: JWT-based session management with encrypted password hashing and rate-limited API access.

### 2. AI Financial Planning Wizard
- **Strategic Roadmap**: A multi-step intelligent wizard that captures financial goals, liabilities, and income.
- **AI Snapshot**: Real-time analysis of user profiles using Groq/OpenAI to identify risks and growth opportunities.
- **Deep Insights (Paid)**: Comprehensive, 10+ page PDF reports and roadmaps unlocked via Razorpay.
- **Document OCR**: Automatically extracts key data from uploaded bank statements, ITRs, and balance sheets.

### 3. GST & Tax Compliance (CA Workspace)
- **GST Dashboard**: End-to-end management for businesses (GSTR-1, GSTR-3B).
- **Invoice Management**: Digital invoice creation and HSN-based tax calculation.
- **ITC Reconciliation**: Automated matching of GSTR-2A/2B to maximize Input Tax Credit.
- **Review & Sign**: Workflow for CAs to verify and digitally approve client filings.

### 4. Expert Consultation & Booking
- **CA Selection**: Browse and filter verified CAs based on expertise and ratings.
- **Automated Scheduling**: Real-time booking with integrated **Razorpay** payment gateway.
- **Zoom Integration**: Automated generation of virtual meeting links (Host link for CAs, Join link for Clients).
- **AI Briefing**: Before the call, CAs receive a 1-page "AI Intelligence Brief" summarizing the client's entire financial history.

### 5. Wealth & Asset Monitor
- **Net Worth Tracking**: Real-time monitoring of assets vs. liabilities.
- **Portfolio Health**: Visual breakdown of investment allocations.
- **Wealth Alerts**: Proactive notifications for significant shifts in financial health.

### 6. Credit Card & Loan Management
- **Smart Recommendations**: AI-driven card matching based on financial health scores.
- **Application Tracking**: Seamless flow for applying and monitoring financial products.

---

## 🛠 Technology Stack

### Frontend
- **React.js**: Standardized UI with 18.x.
- **Ant Design (v5)**: Premium component library for high-end aesthetics.
- **Styled-Components**: Glassmorphic and modern CSS-in-JS design system.
- **Redux Toolkit**: Centralized state management for user sessions and data.

### Backend
- **Node.js & Express**: High-performance RESTful API.
- **Sequelize ORM**: robust PostgreSQL management.
- **PostgreSQL**: Primary relational database for financial records.
- **Redis**: High-speed caching for AI insights and session management.

### Integrations
- **AI**: Groq SDK & OpenAI (Document Analysis & Strategic Briefings).
- **Payments**: Razorpay Gateway (Subscriptions & Booking).
- **Meetings**: Zoom Server-to-Server OAuth (Virtual Consultations).
- **Logging**: Sentry (Error Tracking) & Winston (Production Logging).

---

## 📂 Project Structure

```text
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI & Dashboards
│   │   ├── pages/          # Main application views
│   │   └── services/       # API integration (Axios)
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Sequelize DB Schemas
│   │   ├── routes/         # API endpoints
│   │   └── services/       # External API integrations (Zip, Razorpay)
└── DEPLOYMENT.md           # Deployment & Custom Domain instructions
```

---

## 🛠 Setup & Installation

1. **Clone the repository**
2. **Install Dependencies**:
   ```bash
   npm run install-all
   ```
3. **Configure Environment**:
   Create a `.env` file in the `server` directory (see `server/.env` for placeholders).
4. **Run Locally**:
   ```bash
   npm start
   ```

---

## 📜 Documentation Links
- [Deployment & Domain Guide](./DEPLOYMENT.md)
- [Project Walkthrough & Roadmap](./walkthrough.md)