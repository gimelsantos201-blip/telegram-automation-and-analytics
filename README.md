# Telegram automation and channel analytics

Two projects from my work in CRM, community and campaign operations in the Philippines. Company and people names are withheld; numbers in the dashboard are scaled.

## 1. Weekly IM channel dashboard → [`dashboard/`](dashboard/index.html)
A one-page weekly report I built to track how links perform across Viber, Telegram, WhatsApp and Facebook.
- **Week-over-week channel table**: total views, views per link, and change per channel.
- **Daily chart** (hand-built SVG, no libraries): this week vs the same weekday last week.
- **Placement test**: which spot works best in the first 48 hours (bio, broadcast, button, post…).
- **Data quality first**: it separates a real drop from missing data ("most of the fall is capture loss: 13 of 73 links have no usable screenshot") and restates last week when screenshots are corrected.
- **Action table**: each finding becomes one rule for next week (hold a bio link two days; reject mis-dated screenshots; build links from one UTM template).

What it shows: turning messy screenshot data into a clean weekly read, explaining *why* a number moved, and closing with actions.

## 2. Telegram community automation → [`telegram/`](telegram/README.md)
Three bots on Cloudflare Workers plus an n8n moderation and growth layer:
- Rewards bot with a 7-day check-in, Welcome bot, scheduled Reminder bot.
- Community Guard: rules first, local AI check second, delete-only policy. Test set: 41/41 scams deleted, 0/37 normal messages deleted.
- Growth Tracker: hourly member count into Google Sheets.
- A small [reference bot](telegram/reference-bot/) with the same patterns (webhook secret, KV state, inline buttons).

## Tools
Cloudflare Workers · KV · Telegram Bot API · n8n · LM Studio (local LLM) · Google Sheets · HTML/SVG · AI coding agents (I set rules, review and approve)
