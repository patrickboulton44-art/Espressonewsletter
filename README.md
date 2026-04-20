# Espresso Newsletter

Landing site for **Espresso Newsletter** — your Friday shot of politics, finance and memes.

> "Sound smarter to your friends, and all you did was look at memes all week."

## Stack
- Static HTML/CSS/JS (no framework)
- Vercel serverless function (`/api/subscribe`) for Brevo integration

## Deploy
1. Push to GitHub → import into Vercel.
2. Set env vars in Vercel project settings:
   - `BREVO_API_KEY` — your Brevo v3 API key
   - `BREVO_LIST_ID` — numeric list ID
3. Done. Signups flow into Brevo automatically.

If env vars are missing, the form still works (captures to logs) so the site remains usable before Brevo is wired up.

## Local dev
```
npx vercel dev
```

## Files
- `index.html` — landing page
- `api/subscribe.js` — Brevo subscription handler
- `logo.png` — brand logo (transparent)
- `favicon.png` — profile/square logo
