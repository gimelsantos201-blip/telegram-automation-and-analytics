// Reference Telegram bot on Cloudflare Workers: 7-day daily check-in.
// Patterns from my production bots: webhook secret header, KV state, Philippine date, inline buttons.
// Secrets (set with `wrangler secret put`): BOT_TOKEN, WEBHOOK_SECRET. KV binding: STATE.

const DAYS = 7;

function phDate(offsetDays = 0) {
  // Philippine time is UTC+8 all year (no daylight saving)
  const ms = Date.now() + 8 * 3600e3 + offsetDays * 86400e3;
  return new Date(ms).toISOString().slice(0, 10);
}

async function tg(env, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function card(state, today) {
  const done = state.last === today;
  const rows = [];
  for (let d = 1; d <= DAYS; d++) {
    const mark = d < state.day || (d === state.day && done) ? "✅" : d === state.day ? "🔵" : "🔒";
    rows.push(`${mark} Day ${d}`);
  }
  const text = `📅 Daily check-in\n\n${rows.join("\n")}\n\n${done ? "Done for today. Come back tomorrow!" : "Tap below to check in today."}`;
  const keyboard = done ? [] : [[{ text: "Check in today", callback_data: "checkin" }]];
  return { text, reply_markup: { inline_keyboard: keyboard } };
}

async function load(env, userId) {
  const raw = await env.STATE.get(`k:${userId}`);
  return raw ? JSON.parse(raw) : { day: 1, last: null };
}

function nextState(state, today, yesterday) {
  if (state.last === today) return state;                       // already checked in
  if (state.last === yesterday) {
    const day = state.day >= DAYS ? 1 : state.day + 1;            // new round after day 7
    return { day, last: today };
  }
  return { day: 1, last: today };                                // first time or missed a day
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Check-in bot: ok");
    if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) {
      return new Response("forbidden", { status: 403 });
    }
    const update = await request.json();
    const today = phDate(0);
    const yesterday = phDate(-1);

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = (update.message.text || "").toLowerCase();
      if (text.startsWith("/start") || text.includes("check")) {
        const state = await load(env, update.message.from.id);
        // show the card for the current day without changing state
        const view = state.last === today ? state
          : state.last === yesterday ? { day: state.day >= DAYS ? 1 : state.day + 1, last: state.last }
          : { day: 1, last: null };
        await tg(env, "sendMessage", { chat_id: chatId, ...card(view, today) });
      }
      return new Response("ok");
    }

    if (update.callback_query && update.callback_query.data === "checkin") {
      const q = update.callback_query;
      const before = await load(env, q.from.id);
      const after = nextState(before, today, yesterday);
      if (after !== before) await env.STATE.put(`k:${q.from.id}`, JSON.stringify(after)); // one KV write per action
      await tg(env, "answerCallbackQuery", { callback_query_id: q.id, text: after === before ? "Already done today" : `Day ${after.day} done!` });
      await tg(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id, ...card(after, today) });
    }
    return new Response("ok");
  },
};
