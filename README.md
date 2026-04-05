# Wallet App (React + TypeScript)

Mobile-first wallet app built with React, TypeScript, Vite, React Router, and styled-components.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- styled-components
- Font Awesome (`@fortawesome/fontawesome-free`)

## Project Structure

```text
.
├── components/
│   ├── TransactionDetail.tsx
│   └── TransactionsList.tsx
├── public/
│   └── transactions.json
├── src/
│   ├── App.tsx
│   └── main.tsx
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Type-check

```bash
npm run typecheck
```

## Screens

- `TransactionsList` (`/`)
- `TransactionDetail` (`/transaction/:id`)

## Data Source

Transactions are loaded from:

- `public/transactions.json`

The app fetches this JSON at runtime and renders the latest transactions on the list screen.

## Feature Summary

### Transactions List

- Card balance block (random balance per app session)
- Available amount display
- No payment due block
- Daily points display with seasonal logic
- Latest 10 transactions rendered from JSON
- Payment transactions shown with `+` amount
- Pending transactions prefixed with `Pending`
- Authorized user displayed in metadata when present
- Font Awesome icon per transaction with dark icon background

### Transaction Detail

- Opens when selecting a transaction from the list
- Shows transaction amount, status, merchant/name, description, date/time
- Includes authorized user (if present), card label, transaction reference, and total
- Back navigation to list screen

## Test Submission Screenshots

Store screenshots for delivery under:

```text
submission/screenshots/transactions-list.png
submission/screenshots/transaction-detail.png
```

Suggested capture size for consistency: mobile viewport around `390 x 844`.

## Notes

- App is intentionally optimized for mobile layout.
- JSON test data can be replaced by editing `public/transactions.json`.
