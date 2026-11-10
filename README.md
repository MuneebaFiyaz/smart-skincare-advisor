# smart-skincare-advisor

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set a private `JWT_SECRET`. Add optional Stripe and Gemini API keys if you use those integrations.
3. Start MongoDB, then run `npm start` (or `npm run dev` while developing).
4. Open `http://localhost:5000`.

## Stripe checkout

Configure a Stripe **test** secret key in `.env` and use the test card `4242 4242 4242 4242`, any future expiry date, and any 3-digit CVC. The cart page confirms success only after the server verifies the completed session with Stripe. Never use real card details for testing.

Paid checkouts are saved to the signed-in user's order history. Open **Your Orders** from the navigation to review previous purchases.
