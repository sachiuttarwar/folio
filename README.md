# Folio

> AI-powered equity research from company filings.

Upload 10-Ks, earnings transcripts, and investor presentations. Get structured, institutional-quality equity research in minutes, powered by Claude.

## What it does

Folio analyzes SEC filings and financial documents to generate comprehensive investment research memos including executive summary, financial analysis, competitive positioning, key risks, and upside/base/downside scenarios.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: FastAPI (Python)
- **AI**: Anthropic Claude (claude-sonnet-4-6)
- **Financial Data**: Yahoo Finance (yfinance)
- **Storage**: SQLite

## Quick Start

### 1. Clone & Configure
```bash
git clone https://github.com/sachiuttarwar/folio.git
cd folio
cp .env.example backend/.env
# Add your ANTHROPIC_API_KEY to backend/.env
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Report Structure

Each report includes:

| Section | Content |
|---------|---------|
| A | Executive Summary |
| B | Company Overview |
| C | Financial Performance |
| D | Industry & Competitive Positioning |
| E | Key Risks |
| F–H | Upside / Base / Downside Case |
| I | Valuation Discussion |
| J | Investment Memo Conclusion |

## Environment Variables
