#!/usr/bin/env node
'use strict';

/**
 * zctotoken-bulk-apikey CLI — mint ZCtotoken accounts, one API key per account,
 * and keep only the keys that survived a live chat call.
 *
 * The panel is a New API fork: signup is captcha-free (`turnstile_check: false`)
 * and the only gate is the 6-digit e-mail code — there is no shortcut around
 * reading the inbox. The key is created inside the group `/api/pricing` lists
 * for the target model (`国内模型`), because the relay answers `503 No available
 * channel … under group default` for the cheap deepseek ids on `default`.
 *
 * Flow, per account, every panel request through one pinned exit from your pool:
 *   1. mailbox    Emailnator `POST /api/generate-email` → a fresh @gmail.com
 *                 (registered in the dot-free plain form)
 *   2. status     `GET /api/status` → gates (register on, e-mail verification on)
 *   3. send code  `GET /api/verification?email=…` → panel mails the 6-digit code
 *   4. code       poll Emailnator (`/api/message-list` → `/api/message/<id>`),
 *                 ignoring anything already in the box before step 3 — the
 *                 address may be recycled and a previous tenant's code is
 *                 answered "Verification code is incorrect or has expired"
 *   5. register   `POST /api/user/register` {username,password,email,code}
 *   6. login      `POST /api/user/login` → access_token (+ `New-Api-User`)
 *   7. key        `POST /api/token/` (group from /api/pricing) → reveal
 *                 `POST /api/token/<id>/key` when the fork masks it
 *   8. gate       `POST /v1/chat/completions` → 200 with real content = keep
 *
 * A key is appended to `keys.txt` only after step 8 answers 200 — a key that
 * never passes is recorded in `accounts.jsonl` and retried on the next run.
 *
 * Options:
 *   --count N        accounts (= keys) to mint                             [5]
 *   --conc N         accounts in flight at once, max 8                     [1]
 *   --gap MS         pause between batches                              [1200]
 *   --model <id>     model used for the live gate          [deepseek-v4.1-flash]
 *   --group <name>   token group the key is created in             [from pricing]
 *   --alt-groups G   fallback groups, comma separated              [国内模型,bonus]
 *   --mail-rail R    mail rails to try in order      [emailnator,temptf]
 *   --code-wait MS   wait per mailbox for the code                  [240000]
 *   --no-checkin     skip the daily check-in when the panel has one
 *   --pool <file>    proxy list, one exit per line (env ZCTOTOKEN_PROXIES) [optional]
 *   --exits N        exits tried per account before giving up                 [6]
 *   --timeout MS     per-request timeout                                  [60000]
 *   --auto           headless-friendly alias (launcher passes it; no prompts ever)   
 *   --verify-only    re-run every key in keys.txt through the chat gate
 *   --screen         only test the proxy list against ZCtotoken
 *   --help
 *
 * Zero dependencies. Node.js >= 18. Your proxy list is OPTIONAL: pass --pool
 * (or the ZCTOTOKEN_PROXIES env) and every request goes through an exit from it;
 * without a pool the tool connects directly.
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const tls = require('tls');
const http = require('http');
const crypto = require('crypto');

const ROOT = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const DEAD_FILE = path.join(ROOT, 'keys-dead.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.jsonl');
const OUT_DIR = path.join(ROOT, 'out');

// ------------------------------------------------------------------ provider
const BASE = 'https://www.zctotoken.com';
const TITLE = 'ZCtotoken';
const ENV = 'ZCTOTOKEN';
const DEF_MODEL = 'deepseek-v4.1-flash';
// The group is read from `/api/pricing` for the model being minted; these are
// the fallbacks for the day that table moves or the model id is renamed.
const DEF_GROUPS = ['国内模型', 'bonus'];
const PANEL_HINTS = ['zctotoken'];
const EMAILNATOR = 'https://www.emailnator.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function arg(name, dflt) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  return dflt;
}
const has = (name) => argv.includes(`--${name}`) || argv.includes(`-${name}`);

if (has('help') || has('h')) {
  console.log(`${TITLE} bulk-apikey — mint ${TITLE} accounts, one key each, verified by a live chat call.

  node src/cli.js --count 5          mint (a key is kept only after a chat 200)
  node src/cli.js --verify-only      re-check every key in keys.txt (a key the gate refuses
                                     is written to keys-dead.txt)
  node src/cli.js --screen           test your proxy list against ${TITLE}
  node src/cli.js --help

  --count N      accounts to mint                                        [5]
  --conc N       accounts in flight (max 8)                              [1]
  --model <id>   model used for the live gate         [${DEF_MODEL}]
  --group <name> token group the key is created in             [from pricing]
  --code-wait MS wait per mailbox for the code                  [240000]
  --pool <file>  proxy list, one exit per line (env ${ENV}_PROXIES) [optional]

Requests go through the exits in your proxy list when one is provided (--pool
or the ${ENV}_PROXIES env). Without a pool the tool connects DIRECTLY.`);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '5'), 10) || 5);
const CONC = Math.min(8, Math.max(1, parseInt(arg('conc', '1'), 10) || 1));
const GAP_MS = Math.max(0, parseInt(arg('gap', '1200'), 10) || 0);
const EXITS = Math.max(1, parseInt(arg('exits', '6'), 10) || 6);
const TIMEOUT_MS = Math.max(5000, parseInt(arg('timeout', '60000'), 10) || 60000);
// A dead exit must fail fast: the tunnel connect gets its own (much shorter)
// budget, otherwise one dead proxy costs a whole request timeout per attempt.
const CONNECT_TIMEOUT_MS = Math.max(4000, Math.min(12000, Math.round(TIMEOUT_MS / 5)));
const MODEL = arg('model', DEF_MODEL);
const GROUP = arg('group', '');
const ALT_GROUPS = arg('alt-groups', DEF_GROUPS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
// Rails are tried in order; the first that yields a code for this account wins.
const MAIL_RAILS = arg('mail-rail', 'emailnator,temptf').split(',').map((s) => s.trim()).filter(Boolean);
// How long one mailbox gets to receive the code before the account rolls to the
// next address. A recycled Emailnator address that never receives is the common
// failure, so a long window mostly buys idle time: 11 accounts were minted with
// 90 s windows, while 240 s windows produced minutes of nothing.
const CODE_WAIT_MS = Math.max(30000, parseInt(arg('code-wait', '240000'), 10) || 240000);
const CHECKIN = !has('no-checkin');
const AUTO = has('auto');
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT_DIR, { recursive: true });
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const randUser = () => `zt${crypto.randomBytes(5).toString('hex')}`;
const randPass = () => `Kw${crypto.randomBytes(6).toString('base64url')}7z`;

// ------------------------------------------------------------------- proxy
function parseProxy(line) {
  const s = String(line || '').trim();
  if (!s || s.startsWith('#')) return null;
  let m = s.match(/^(https?|socks5h?|socks4):\/\/(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)/i);
  if (!m) m = s.match(/^(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)$/);
  if (!m) return null;
  if (m.length === 6) {
    const raw = m[1].toLowerCase();
    if (raw === 'socks4') return null; // socks4 is not supported by this client
    const protocol = raw.startsWith('socks') ? 'socks5' : 'http';
    return { protocol, host: m[4], port: Number(m[5]), auth: m[2] ? `${m[2]}:${m[3]}` : null, line: s };
  }
  return { protocol: 'http', host: m[3], port: Number(m[4]), auth: m[1] ? `${m[1]}:${m[2]}` : null, line: s };
}

/** A raw socket straight to host:port (no proxy) — the direct-mode twin of connectThrough. */
function directConnect(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`connect timeout (${host}:${port})`)); }, timeoutMs);
    sock.once('error', (e) => { clearTimeout(t); try { sock.destroy(); } catch {} reject(new Error(`connect failed: ${e.message}`)); });
    sock.once('connect', () => { clearTimeout(t); resolve(sock); });
  });
}

function connectThrough(proxy, host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host: proxy.host, port: proxy.port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`proxy timeout (${proxy.host}:${proxy.port})`)); }, timeoutMs);
    const done = (err, s) => { clearTimeout(t); if (err) { try { sock.destroy(); } catch {} reject(err); } else resolve(s); };
    sock.once('error', (e) => done(new Error(`proxy connect failed: ${e.message}`)));
    sock.once('connect', () => {
      if (proxy.protocol === 'socks5') {
        sock.write(proxy.auth ? Buffer.from([5, 2, 0, 2]) : Buffer.from([5, 1, 0]));
        let stage = 0;
        let buf = Buffer.alloc(0);
        const sendConnect = () => {
          const hb = Buffer.from(host);
          sock.write(Buffer.concat([Buffer.from([5, 1, 0, 3, hb.length]), hb, Buffer.from([port >> 8, port & 0xff])]));
        };
        const onData = (d) => {
          try {
            buf = Buffer.concat([buf, d]);
            for (;;) {
              if (stage === 0) {
                if (buf.length < 2) return;
                const v = buf; buf = buf.slice(2);
                if (v[0] !== 5) return done(new Error('SOCKS5 bad version'));
                if (v[1] === 2) {
                  if (!proxy.auth) return done(new Error('SOCKS5 auth required'));
                  const [u, p] = proxy.auth.split(':');
                  sock.write(Buffer.concat([Buffer.from([1, u.length]), Buffer.from(u), Buffer.from([p.length]), Buffer.from(p)]));
                  stage = 1;
                  continue;
                }
                if (v[1] !== 0) return done(new Error('SOCKS5 no acceptable method'));
                stage = 2; sendConnect(); continue;
              }
              if (stage === 1) {
                if (buf.length < 2) return;
                const v = buf; buf = buf.slice(2);
                if (v[1] !== 0) return done(new Error('SOCKS5 auth failed'));
                stage = 2; sendConnect(); continue;
              }
              if (stage === 2) {
                if (buf.length < 5) return;
                const atyp = buf[3];
                const need = 4 + (atyp === 1 ? 4 : atyp === 3 ? 1 + buf[4] : 16) + 2;
                if (buf.length < need) return;
                const rep = buf[1]; buf = buf.slice(need);
                if (rep !== 0) return done(new Error(`SOCKS5 connect failed (code ${rep})`));
                sock.off('data', onData);
                if (buf.length) sock.unshift(buf); // bytes the exit sent past its reply
                return done(null, sock);
              }
            }
          } catch (e) { done(e); }
        };
        sock.on('data', onData);
        return;
      }
      const auth = proxy.auth ? `Proxy-Authorization: Basic ${Buffer.from(proxy.auth).toString('base64')}\r\n` : '';
      sock.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n${auth}\r\n`);
      let buf = Buffer.alloc(0);
      const onData = (d) => {
        buf = Buffer.concat([buf, d]);
        const end = buf.indexOf('\r\n\r\n');
        if (end < 0) return;
        sock.off('data', onData);
        const head = buf.slice(0, end + 4).toString('latin1');
        const rest = buf.slice(end + 4);
        if (!/^HTTP\/\d(\.\d)? 200/.test(head)) return done(new Error(`proxy CONNECT refused: ${head.split('\r\n')[0]}`));
        // The exit may pipeline the first TLS bytes into the same packet as its
        // CONNECT reply. A socket handed to tls.connect() without those bytes
        // hangs or resets, which reads as "this exit is dead" — so put them back.
        if (rest.length) sock.unshift(rest);
        done(null, sock);
      };
      sock.on('data', onData);
    });
  });
}

/** One HTTPS request through one exit. Returns { status, headers, body }. */
async function exitFetch(proxy, url, { method = 'GET', headers = {}, body = null, timeoutMs = TIMEOUT_MS } = {}) {
  const u = new URL(url);
  const raw = proxy
    ? await connectThrough(proxy, u.hostname, u.port || 443, CONNECT_TIMEOUT_MS)
    : await directConnect(u.hostname, u.port || 443, CONNECT_TIMEOUT_MS);
  const sock = tls.connect({ socket: raw, servername: u.hostname });
  await new Promise((res, rej) => { sock.once('secureConnect', res); sock.once('error', rej); });
  const chunks = [];
  let resolve, reject;
  const p = new Promise((res, rej) => { resolve = res; reject = rej; });
  const req = http.request({
    method,
    path: u.pathname + u.search,
    createConnection: () => sock,
    headers: { host: u.host, 'user-agent': UA, accept: '*/*', origin: u.origin, referer: `${u.origin}/`, ...headers },
  });
  const t = setTimeout(() => { try { req.destroy(); } catch {} reject(new Error('request timeout')); }, timeoutMs);
  req.on('response', (res) => {
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => {
      clearTimeout(t);
      resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') });
    });
  });
  req.on('error', (e) => { clearTimeout(t); reject(e); });
  if (body != null) req.write(Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
  req.end();
  return p;
}

async function exitJson(proxy, url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  const body = opts.body;
  if (body != null && !Buffer.isBuffer(body)) headers['content-type'] = 'application/json';
  const r = await exitFetch(proxy, url, { ...opts, headers });
  let json = null;
  try { json = JSON.parse(r.body); } catch { /* not json */ }
  return { status: r.status, json, text: r.body };
}

// ------------------------------------------------------------------- pool
function loadExits() {
  // Fail-closed on an EXPLICIT pool: naming a pool is a promise that the traffic
  // leaves from it, so an empty/missing file is an error, never a silent direct
  // run — a provider that sees this machine's own address rejects the work.
  // Only when no pool is named at all (no --pool, no env) is direct the mode,
  // and it says so out loud.
  const explicit = argv.some((a) => a === '--pool' || a.startsWith('--pool='));
  const envPool = process.env[`${ENV}_PROXIES`];
  const poolArg = arg('pool', envPool || 'proxies.txt');
  const poolFile = fs.existsSync(path.resolve(poolArg)) ? path.resolve(poolArg) : path.resolve(ROOT, poolArg);
  const exits = fs.existsSync(poolFile)
    ? fs.readFileSync(poolFile, 'utf8').split(/\r?\n/).map(parseProxy).filter(Boolean)
    : [];
  if (!exits.length) {
    if (explicit || envPool) {
      throw new Error(`no usable exit in ${poolFile} — refusing to run direct (--pool/${ENV}_PROXIES was set)`);
    }
    console.log(`no proxy list at ${poolFile} — running WITHOUT a proxy (direct). Put exits there (or pass --pool) to route through them.`);
    return [null];
  }
  return exits;
}
/** A dead exit, not a panel verdict — the flow rotates to the next candidate. */
const isExitError = (e) =>
  /proxy connect failed|proxy CONNECT refused|proxy timeout|connect timeout|connect failed|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|ENETUNREACH|EHOSTUNREACH|EAI_AGAIN|socket hang up|secureConnect|TLS|handshake/i.test(
    String((e && e.message) || e),
  );

/** `host:port` of the exit in play, or `direct` when the pool is empty. */
const exitLabel = (e) => (e ? `${e.host}:${e.port}` : 'direct');


async function screen(exits) {
  let ok = 0;
  for (const e of exits.slice(0, 64)) {
    try {
      const t0 = Date.now();
      const r = await exitFetch(e, `${BASE}/api/status`, { timeoutMs: 20000 });
      const good = r.status === 200 && /"success"/.test(r.body);
      if (good) ok++;
      console.log(`  ${good ? '✔' : '✘'} ${e ? `${e.host}:${e.port}` : 'direct'} status=${r.status} ${Date.now() - t0}ms`);
    } catch (err) {
      console.log(`  ✘ ${e ? `${e.host}:${e.port}` : 'direct'} ${String(err.message).slice(0, 80)}`);
    }
  }
  console.log(`screened ${Math.min(exits.length, 64)} exit(s): ${ok} reach ${BASE}`);
  return ok;
}

// ------------------------------------------------------------------- mail
async function newMailbox(exit) {
  const r = await exitJson(exit, `${EMAILNATOR}/api/generate-email`, {
    method: 'POST',
    body: { ids: [3] },
    headers: { origin: EMAILNATOR, referer: `${EMAILNATOR}/` },
  });
  const dotted = r.json && r.json.email;
  if (!dotted || !/@gmail\.com$/i.test(dotted)) throw new Error(`emailnator generate ${r.status}: ${String(r.text).slice(0, 120)}`);
  const [local, domain] = dotted.split('@');
  return { rail: 'emailnator', dotted, plain: `${local.replace(/\./g, '')}@${domain}` };
}

/**
 * Mail already in the box, read BEFORE the panel is told to send a code.
 *
 * Emailnator hands out recycled gmail addresses and a public inbox carries other
 * people's mail; the first page is only the newest slice, so tracking ids alone
 * lets an *older* message (a login code for some unrelated service) pass as the
 * panel's. The newest timestamp in the box is the reliable cut.
 */
async function baseline(exit, box) {
  try {
    const r = await exitJson(exit, `${EMAILNATOR}/api/message-list`, { method: 'POST', body: { email: box.plain, limit: 20 } });
    const msgs = (r.json && r.json.messages) || [];
    return { ids: new Set(msgs.map((m) => m.id)), ts: msgs.reduce((a, m) => Math.max(a, Number(m.timestamp) || 0), 0) };
  } catch {
    return { ids: new Set(), ts: 0 };
  }
}

/** The panel's own mail, by sender/subject — so another tenant's code never wins. */
function isPanelMail(m) {
  const blob = `${m.from || ''} ${m.sender || ''} ${m.to || ''} ${m.subject || ''}`.toLowerCase();
  return PANEL_HINTS.some((h) => blob.includes(h));
}

/** The code, `验证码`/`code`-anchored. zctotoken mails "Your verification code is: 51962b"
 *  — the connector word `is` sits between the keyword and the code, so a gap of pure
 *  non-alphanumerics alone never matches (measured 2026-10-23: every account was lost
 *  to "no verification code inside the window" with the code plainly in the mail). */
function extractCode(text) {
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const m = clean.match(/(?:验证码|verification code|your code|code)[^A-Za-z0-9]{0,8}(?:is[^A-Za-z0-9]{0,4})?([A-Za-z0-9]{4,8})\b/i);
  return m ? m[1] : null;
}

async function pollCode(exit, box, before, { timeoutMs = 240000, pollMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let weak = null;
  while (Date.now() < deadline) {
    let msgs = [];
    try {
      const r = await exitJson(exit, `${EMAILNATOR}/api/message-list`, { method: 'POST', body: { email: box.plain, limit: 20 } });
      msgs = (r.json && r.json.messages) || [];
    } catch (e) { /* retry */ }
    for (const m of msgs) {
      if (before.ids.has(m.id)) continue;
      before.ids.add(m.id);
      const ts = Number(m.timestamp) || 0;
      if (ts && before.ts && ts <= before.ts) continue; // arrived before we asked
      const r = await exitJson(exit, `${EMAILNATOR}/api/message/${encodeURIComponent(m.id)}`).catch(() => null);
      // exitJson names the raw payload `text` (it already parsed `json`); reading
      // `.body` here threw inside the poll loop and cost the whole account.
      const text = r && typeof r.text === 'string' ? r.text : '';
      const code = extractCode(text);
      if (!code) continue;
      if (isPanelMail(m)) return { code, subject: m.subject || '', hinted: true, ts };
      // Mail that is not the panel's but did arrive after the request: keep it as
      // a last resort, but give the panel's own mail a few polls to land first.
      if (!weak) weak = { code, subject: m.subject || '', at: Date.now(), hinted: false, ts };
    }
    if (weak && Date.now() - weak.at > 20000) return weak;
    await sleep(pollMs);
  }
  if (weak) return weak;
  throw new Error('no verification code inside the window');
}

// ------------------------------------------------------------------- group
/**
 * Which group does this fork serve the model in? `/api/pricing` is the live
 * answer (`enable_groups`); a 404/unauth panel falls back to the static list.
 */
async function pickGroups(exit, model) {
  const groups = [];
  try {
    const r = await exitJson(exit, `${BASE}/api/pricing`);
    const rows = r.json ? (Array.isArray(r.json.data) ? r.json.data : (r.json.data && r.json.data.data) || []) : [];
    for (const row of rows) {
      if (model && !String(row.model_name || '').includes(model)) continue;
      for (const g of row.enable_groups || []) if (!groups.includes(g)) groups.push(g);
      if (groups.length) break;
    }
  } catch { /* panel without a pricing route */ }
  for (const g of [GROUP, ...groups, ...ALT_GROUPS]) if (g && !groups.includes(g)) groups.push(g);
  return groups.filter(Boolean);
}

// ------------------------------------------------- mail rail: temp.tf (fallback)
// Measured 2026-10-22: the panels differ per alias domain — zctotoken rejects
// @hotmail.com *and* @outlook.com (EMAIL_ADDRESS_REJECTED), 7Code accepts
// @hotmail.com but rejects @outlook.com, hence 7Code's hotmail-only request.
// Real Microsoft mailboxes surfaced as plus-aliases (@outlook.com / @hotmail.com).
// Second rail: used when Emailnator rate-limits (`429 Too many requests`) or the
// panel refuses the gmail address.
const TF = 'https://temp.tf';

async function tfMailbox(exit) {
  const r = await exitJson(exit, `${TF}/api/account?providers=outlook,hotmail&dot=0&plus=1`, { method: 'GET' });
  const email = r.json && r.json.email;
  if (!email || !/@/.test(String(email))) throw new Error(`temp.tf account ${r.status}: ${String(r.text).slice(0, 120)}`);
  return { rail: 'temptf', dotted: String(email), plain: String(email) };
}

async function tfMessages(exit, email) {
  const r = await exitJson(exit, `${TF}/api/check`, { method: 'POST', body: { email, wait: false } });
  const d = r.json;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  if (d && Array.isArray(d.messages)) return d.messages;
  return [];
}

async function tfBaseline(exit, box) {
  try {
    const msgs = await tfMessages(exit, box.plain);
    return { ids: new Set(msgs.map((m) => String(m.id || m.uid || m.messageId || ''))), ts: 0 };
  } catch {
    return { ids: new Set(), ts: 0 };
  }
}

async function tfPollCode(exit, box, before, { timeoutMs = 240000, pollMs = 6000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    let msgs = [];
    try { msgs = await tfMessages(exit, box.plain); } catch { /* retry */ }
    for (const m of msgs) {
      const id = String(m.id || m.uid || m.messageId || '');
      if (!id || before.ids.has(id)) continue;
      before.ids.add(id);
      const blob = `${m.subject || ''} ${m.from || ''} ${m.sender || ''} ${m.text || ''} ${m.body || ''} ${m.html || ''} ${m.content || ''}`;
      const code = extractCode(blob);
      if (code && isPanelMail(m)) return { code, subject: m.subject || '', hinted: true };
    }
    await sleep(pollMs);
  }
  throw new Error('temp.tf: no verification code inside the window');
}

/** One mailbox and one code, from the first rail that delivers. */
async function acquireMail(exit) {
  let lastErr = null;
  for (const rail of MAIL_RAILS) {
    try {
      const box = rail === 'temptf' ? await tfMailbox(exit) : await newMailbox(exit);
      const before = rail === 'temptf' ? await tfBaseline(exit, box) : await baseline(exit, box);
      const sc = await exitJson(exit, `${BASE}/api/verification?email=${encodeURIComponent(box.plain)}`);
      if (!(sc.json && sc.json.success)) { lastErr = new Error(`sendCode HTTP ${sc.status}: ${String(sc.text).slice(0, 140)}`); continue; }
      const hit = rail === 'temptf'
        ? await tfPollCode(exit, box, before, { timeoutMs: CODE_WAIT_MS })
        : await pollCode(exit, box, before, { timeoutMs: CODE_WAIT_MS });
      return { box, code: hit.code, subject: hit.subject, rail, ts: hit.ts };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('no mail rail delivered a code');
}

// ------------------------------------------------------------------- flows
function readKeys() {
  try { return fs.readFileSync(KEYS_FILE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean); } catch { return []; }
}
function appendKey(key) { fs.appendFileSync(KEYS_FILE, key + '\n'); }
/** A key the chat gate definitively refuses (401/403/quota/ban) — transport
 *  failures never land here. Line format: `key<TAB>sebep<TAB>ISO`. */
function appendDead(key, reason) { fs.appendFileSync(DEAD_FILE, `${key}\t${reason}\t${new Date().toISOString()}\n`); }

/** Text of a completion whether the fork answered JSON or an SSE `data:` stream. */
function readCompletion(text) {
  const s = String(text || '');
  if (/^data:/m.test(s)) {
    const acc = [];
    for (const line of s.split('\n')) {
      const l = line.trim();
      if (!l.startsWith('data:')) continue;
      const payload = l.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        for (const ch of (JSON.parse(payload).choices || [])) {
          const d = ch.delta || ch.message || {};
          acc.push((d.content || '') + (d.reasoning_content || ''));
        }
      } catch { /* partial frame */ }
    }
    return acc.join('').trim() || null;
  }
  try {
    const m = (JSON.parse(s).choices || [])[0].message || {};
    const c = m.content || m.reasoning_content || m.reasoning || null;
    return c ? String(c).trim() : null;
  } catch { return null; }
}

async function signUp(exit) {
  const username = randUser();
  const password = randPass();
  const st = await exitJson(exit, `${BASE}/api/status`);
  const gates = (st.json && st.json.data) || {};
  if (gates.register_enabled === false) throw new Error('register is disabled on the panel right now');
  // Mail rail rotation: Emailnator first (gmail, no domain wall seen on this
  // panel), temp.tf as the fallback when Emailnator rate-limits or the panel
  // refuses the address. Both rails are pinned to this account's exit.
  const mail = await acquireMail(exit);
  const { box, rail } = mail;
  let code = mail.code;
  const tryRegister = () => exitJson(exit, `${BASE}/api/user/register`, {
    method: 'POST',
    body: { username, password, email: box.plain, verification_code: code },
  });
  let reg = await tryRegister();
  // A recycled mailbox can hand us a code that a later request for the same address
  // has already superseded — the panel answers "Verification code is incorrect or
  // expired" while the code is plainly in the mail (measured 2026-10-23: the proven
  // 7zs rail reads the newest code and retries, and that is the account it saves).
  for (let a = 0; a < 3 && !(reg.json && reg.json.success); a++) {
    if (!/code|验证码/i.test(String(reg.text || ''))) break;
    const newer = rail === 'temptf'
      ? await tfPollCode(exit, box, { ids: new Set(), ts: 0 }, { timeoutMs: 45000 }).catch(() => null)
      : await pollCode(exit, box, { ids: new Set(), ts: mail.ts || 0 }, { timeoutMs: 45000 }).catch(() => null);
    if (!newer || !newer.code || newer.code === code) break;
    code = newer.code;
    reg = await tryRegister();
  }
  if (!(reg.json && reg.json.success)) throw new Error(`register HTTP ${reg.status}: ${String(reg.text).slice(0, 140)}`);
  const lg = await exitJson(exit, `${BASE}/api/user/login`, { method: 'POST', body: { username, password } });
  const token = lg.json && lg.json.data && lg.json.data.access_token;
  if (!token) throw new Error(`login HTTP ${lg.status}: ${String(lg.text).slice(0, 140)}`);
  const me = await exitJson(exit, `${BASE}/api/user/self`, { headers: { authorization: `Bearer ${token}` } });
  const data = (me.json && me.json.data) || {};
  const auth = { authorization: `Bearer ${token}` };
  if (data.id) auth['New-Api-User'] = String(data.id);

  // Daily check-in: on a check-in panel this is where the balance comes from
  // (registration credit alone carries a key only until the first call).
  let checkin = null;
  if (CHECKIN) {
    const ck = await exitJson(exit, `${BASE}/api/user/checkin`, { method: 'POST', headers: auth }).catch(() => null);
    if (ck) {
      checkin = ck.status;
      if (ck.status === 200) {
        const me2 = await exitJson(exit, `${BASE}/api/user/self`, { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
        const q2 = me2 && me2.json && me2.json.data && me2.json.data.quota;
        if (typeof q2 === 'number') data.quotaAfterCheckin = q2;
      }
    }
  }

  let key = null;
  let usedGroup = null;
  for (const g of await pickGroups(exit, MODEL)) {
    const created = await exitJson(exit, `${BASE}/api/token/`, {
      method: 'POST',
      headers: auth,
      body: {
        name: `k1${crypto.randomBytes(3).toString('hex')}`,
        remain_quota: 500000,
        expired_time: -1,
        unlimited_quota: false,
        model_limits_enabled: false,
        model_limits: '',
        allow_ips: '',
        group: g,
      },
    });
    const dd = created.json && created.json.data;
    if (dd && dd.key && !String(dd.key).includes('*')) key = dd.key;
    if (!key && dd && dd.id) key = await reveal(exit, auth, dd.id);
    if (!key) {
      // A bare `{success:true}` create leaves no id in the response: re-list and
      // reveal every token whose key came back masked.
      const tl = await exitJson(exit, `${BASE}/api/token/?p=0&size=10`, { headers: auth });
      for (const t of (tl.json && tl.json.data && tl.json.data.items) || []) {
        if (t.key && !String(t.key).includes('*')) { key = t.key; break; }
        if (t.id) { key = await reveal(exit, auth, t.id); if (key) break; }
      }
    }
    if (key) { usedGroup = g; break; }
  }
  return { username, password, box, quota: data.quota, quotaAfterCheckin: data.quotaAfterCheckin, uid: data.id, code, subject: mail.subject, mailRail: rail, key, usedGroup, checkin };
}

async function reveal(exit, auth, id) {
  const kr = await exitJson(exit, `${BASE}/api/token/${id}/key`, { method: 'POST', headers: auth, body: {} });
  const kd = kr.json && kr.json.data;
  const kk = typeof kd === 'string' ? kd : kd && kd.key;
  return kk && !String(kk).includes('*') ? kk : null;
}

async function chatGate(exit, key, model = MODEL) {
  const r = await exitJson(exit, `${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: { model, messages: [{ role: 'user', content: 'Reply with the single word: ok' }], max_tokens: 64 },
    timeoutMs: 90000,
  });
  let content = readCompletion(r.text);
  // Some forks stream the answer even when `stream: false` was asked for
  // (measured 2026-10-22 on sivan's deepseek-v4.1-flash): the JSON reader sees
  // nothing and a live key is thrown away, so re-ask in stream mode once.
  let status = r.status;
  if (r.status === 200 && !content) {
    const s = await exitJson(exit, `${BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, accept: 'text/event-stream' },
      body: { model, messages: [{ role: 'user', content: 'Reply with the single word: ok' }], max_tokens: 64, stream: true },
      timeoutMs: 90000,
    }).catch(() => null);
    if (s) { content = readCompletion(s.text); status = s.status; }
  }
  return { ok: status === 200 && !!content, status, content: content ? String(content).trim().slice(0, 80) : null, sample: String(r.text).slice(0, 160) };
}

async function mint() {
  const exits = loadExits();
  // A pool entry that answers the screen dies minutes later, so pinning attempts to the
  // same head of the list burns every account of a round on the same corpses. Pick at
  // random instead — the pool is the whole point (measured 2026-10-23).
  const pickExit = () => exits[Math.floor(Math.random() * exits.length)];
  if (SCREEN) return void (await screen(exits));
  log(`${TITLE} · ${COUNT} key(s) · conc ${CONC} · model ${MODEL} · exits ${exits.filter(Boolean).length || 'direct'} · keys land in keys.txt`);
  let made = 0;
  const routes = exits[0] === null ? 1 : EXITS;
  let transportDead = 0;
  for (let round = 0; round < COUNT; round += CONC) {
    const jobs = [];
    for (let k = 0; k < CONC && round + k < COUNT; k++) {
      const i = round + k;
      jobs.push((async () => {
        let lastErr = null;
        let lastWasExit = false;
        for (let a = 0; a < routes; a++) {
          const exit = exits.length > 1 ? pickExit() : exits[0];
          lastWasExit = false;
          try {
            const rec = await signUp(exit);
            if (!rec.key) { lastErr = new Error('no key material in the token response'); continue; }
            const g = await chatGate(exit, rec.key);
            if (!g.ok) {
              lastErr = new Error(`chat gate ${g.status}: ${g.sample}`);
              appendAccount({ at: new Date().toISOString(), username: rec.username, email: rec.box.plain, exit: exit ? `${exit.host}:${exit.port}` : 'direct', group: rec.usedGroup || null, gate: g.status, gate_sample: g.sample });
              continue;
            }
            appendKey(rec.key);
            appendAccount({ at: new Date().toISOString(), username: rec.username, email: rec.box.plain, uid: rec.uid, quota: rec.quota, quotaAfterCheckin: rec.quotaAfterCheckin ?? null, checkin: rec.checkin ?? null, mail_rail: rec.mailRail ?? null, group: rec.usedGroup ?? null, exit: exit ? `${exit.host}:${exit.port}` : 'direct', key: rec.key, gate: 200, gate_sample: g.content, model: MODEL });
            made++;
            log(`account ${i + 1} ✔ chat-200 ${MODEL} · group ${rec.usedGroup || '?'} · quota ${rec.quota}${rec.quotaAfterCheckin ? ` → ${rec.quotaAfterCheckin} (checkin ${rec.checkin})` : ''} · ${rec.key.slice(0, 8)}…`);
            return;
          } catch (e) {
            lastErr = e;
            lastWasExit = isExitError(e);
            if (lastWasExit) {
              const where = exit ? `exit ${a + 1}/${routes} ${exitLabel(exit)}` : `direct attempt ${a + 1}/${routes}`;
              log(`account ${i + 1}: ${where} dead (${String(e.message).slice(0, 70)})${exit ? ' → next exit' : ''}`);
            }
          }
        }
        if (lastWasExit) transportDead++;
        log(`account ${i + 1}: ${lastErr ? String(lastErr.message).slice(0, 140) : 'failed'}`);
      })());
    }
    await Promise.all(jobs);
    if (GAP_MS) await sleep(GAP_MS);
  }
  log(`done — ${made}/${COUNT} key(s) written to ${KEYS_FILE}`);
  if (!made && transportDead === COUNT) {
    const route = exits[0] === null ? 'direct mode (no proxy list)' : `${exits.length}-exit pool`;
    console.error(`[fatal] no usable route — ${COUNT} account(s) × ${routes} candidate(s) over ${route}: every attempt died at the transport layer.`);
    process.exit(1);
  }
}

async function verifyOnly() {
  const exits = loadExits();
  const keys = readKeys();
  if (!keys.length) { console.log(`no keys in ${KEYS_FILE}`); process.exit(0); }
  let live = 0;
  let dead = 0;
  for (let i = 0; i < keys.length; i++) {
    const exit = exits[i % exits.length];
    try {
      const g = await chatGate(exit, keys[i]);
      if (g.ok) live++;
      // Only a definitive answer counts as dead: 429/5xx/transport are the exit's problem.
      else if (g.status && g.status !== 429 && g.status < 500) {
        dead++;
        appendDead(keys[i], `chat ${g.status}: ${String(g.content || g.sample).slice(0, 80)}`);
      }
      console.log(`  ${g.ok ? '✔' : '✘'} ${keys[i].slice(0, 8)}… chat=${g.status} ${g.content || g.sample.slice(0, 60)}`);
    } catch (e) {
      console.log(`  ✘ ${keys[i].slice(0, 8)}… ${String(e.message).slice(0, 90)}`);
    }
  }
  console.log(`verify: ${live}/${keys.length} keys live (${MODEL} on ${BASE})`);
  if (dead) console.log(`${dead} key(s) written to ${DEAD_FILE}`);
  process.exit(live === keys.length ? 0 : 1);
}

(VERIFY_ONLY ? verifyOnly() : mint()).catch((e) => { console.error('[fatal]', e.message); process.exit(1); });
