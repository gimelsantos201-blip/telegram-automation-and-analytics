# Reference check-in bot (Cloudflare Workers)

A small bot that shows a 7-day check-in card. One check-in per Philippine day; missing a day starts again at Day 1.

## Deploy
1. Create a bot with @BotFather and keep the token private.
2. `npm create cloudflare@latest` (or use the dashboard), then copy `worker.js` and `wrangler.toml` from this folder.
3. Create a KV namespace and put its id in `wrangler.toml`.
4. Set the secrets (you type the values; they are never stored in files):
   ```
   npx wrangler secret put BOT_TOKEN
   npx wrangler secret put WEBHOOK_SECRET
   ```
5. `npx wrangler deploy`
6. Point Telegram at the Worker, sending the same secret word:
   `https://api.telegram.org/bot<token>/setWebhook?url=<worker-url>&secret_token=<secret>`

## How it works
- Every Telegram call must carry the secret header, or the Worker answers `403`.
- State per user is one KV key: `{ day, last }`. Each tap writes at most once.
- The card uses inline buttons and is edited in place after a check-in.
