# DeFi Yield Aggregator

A full-stack decentralized finance (DeFi) yield aggregator platform that enables users to search, compare, and deposit into top DeFi protocols to optimize yield. Built with Next.js, Spring Boot, Solidity, and Supabase.

---

## Features

- **Search & Compare Protocols:**  
  Find and compare DeFi protocols by APY, with real-time data from DeFiLlama.

- **Deposit via Smart Contract:**  
  Deposit ETH directly into selected protocols using a unified Aggregator smart contract.

- **Web3 Wallet Integration:**  
  Connect your wallet using Web3Modal and interact with Ethereum smart contracts.

- **Authentication:**  
  Secure user authentication and session management powered by Supabase.

- **Modern UI:**  
  Responsive, animated interface built with Next.js, Tailwind CSS, and Radix UI.

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Radix UI, Framer Motion, Recharts, Lucide React, Axios, Web3Modal, Ethers.js
- **Backend:** Spring Boot, Java, Gradle, Web3j
- **Smart Contracts:** Solidity, Hardhat, Hardhat Ignition
- **Authentication:** Supabase
- **APY Data:** DeFiLlama API

---

## Getting Started

### Prerequisites

- Node.js & npm
- Java 17+ (for backend)
- Hardhat (for smart contracts)
- Supabase project (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/yield-aggregator.git
cd yield-aggregator
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
./gradlew build
```

### 4. Deploy Smart Contracts (Local Hardhat Node)

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Configure Environment Variables

Create a `.env.local` file in `frontend/`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_AGG_ADDR=deployed-aggregator-contract-address
```

### 6. Start Backend

```bash
cd backend
./gradlew bootRun
```

### 7. Start Frontend

```bash
cd ../frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
contracts/         # Solidity smart contracts
scripts/           # Hardhat deployment scripts
test/              # Smart contract tests
frontend/          # Next.js frontend app
backend/           # Spring Boot backend API
ignition/          # Hardhat Ignition modules
```

---

## API Endpoints

- `GET /api/protocols`  
  - Returns top protocols by APY or search results.

- `GET /api/apy`  
  - Returns APY data for protocols.

---

## How Searching Works

- The frontend sends debounced requests to `/api/protocols?search=...` as the user types.
- The backend fetches and filters protocol data from DeFiLlama, returning matching results.

---

## Smart Contracts

- **Aggregator.sol:** Routes deposits to the highest APY protocol or to a selected protocol.
- **MockProtocol.sol:** Simulates DeFi protocols for local testing.

---

## Authentication

- Supabase is used for user authentication and session management.
- See `frontend/utils/supabase/` for client and server integration.

---

## License

MIT

---

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Supabase](https://supabase.com/)
- [DeFiLlama](https://defillama.com/)
- [Hardhat](https://hardhat.org/)
