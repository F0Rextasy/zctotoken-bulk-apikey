<div align="center">

```
███████╗ ██████╗████████╗ ██████╗ ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗
╚══███╔╝██╔════╝╚══██╔══╝██╔═══██╗╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║
  ███╔╝ ██║        ██║   ██║   ██║   ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║
 ███╔╝  ██║        ██║   ██║   ██║   ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║
███████╗╚██████╗   ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║
╚══════╝ ╚═════╝   ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
```

# zctotoken-bulk-apikey

**Bulk-create ZCtotoken accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-9-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

ZCtotoken is a **New API** fork behind a Chinese CDN. Its signup is captcha-free (`turnstile_check: false`) and the only gate is a 6-digit code mailed to the address — so the whole account is automatable over plain HTTP **except** for reading that inbox, which is why the tool talks to Emailnator and registers the dot-free form of the address it gets.

The trap on this panel is the **group**, not the signup. `/api/pricing` serves the cheap deepseek ids only inside `国内模型`; a token left in `default` is answered `503 No available channel for model deepseek-v4.1-flash under group default`. The CLI reads the group table and creates the token in the group the target model is actually served from, then proves the key with a real completion before writing it to `keys.txt`.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Signup credit | **999,971 quota** measured on a fresh account (`quota_per_unit: 500000` → ≈ **$2.00**) |
| Daily check-in | **disabled** (`checkin_enabled: false`; the route answers `Check-in feature is not enabled`) |
| Card / phone | neither |
| Billing unit | **per account** — the quota lives on the account, which is why this tool creates one account per key |
| E-mail gate | **required** — 6-digit code, verified before the account exists |

With N keys you hold N accounts, i.e. **N × the signup credit**. No check-in means the balance does not refill: when a key runs dry it is replaced by minting another account, which is exactly what `--count` does.

> 💡 The free tier is set by ZCtotoken and can change. Check the live numbers at [www.zctotoken.com](https://www.zctotoken.com) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 9 of them

`GET /v1/models` (with a key) lists **9 ids** on this panel:

| Model ID | Group served in | Verified |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` answered |
| `deepseek-v4-flash` | `bonus`, `国内模型` | listed |
| `deepseek-v4-flash-vision-exp` | `国内模型` | listed |
| `deepseek-v4-pro` | listed | listed |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | listed | listed |
| `kimi-k3` | listed | listed |
| `MiniMax-M3` | listed | listed |

> ⚠️ `/v1/models` answers **only to GET** — a POST is refused with `Invalid URL (POST /v1/models)`.

## 🧪 How to use the API

Base URL **`https://www.zctotoken.com/v1`** — OpenAI-compatible.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

The model returns its reasoning in `reasoning_content` next to `content`, so a client that only reads `content` still sees text.

## 🛠 Quick start

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings
# or: node src/cli.js --count 10 --pool proxies.txt
```

No browser and no captcha solver is involved: the panel's signup is pure HTTP plus an inbox. A key is written to `keys.txt` **only** after `/v1/chat/completions` answers 200 with real content; `accounts.jsonl` keeps the address, the group the token landed in and the gate result.

### 🖱️ The launcher

The launcher asks for the proxy list (optional — without one the CLI runs direct), how many accounts to mint and the model used for the live gate, remembers them in `launcher.config.json`, and runs the CLI: **mint**, **verify**, **screen** (test the exits against the panel), **settings**, **help** and **Connect to 9Router**.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`; the code mail arrives within seconds |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200** with `access_token` |
| `POST /api/token/` then `POST /api/token/<id>/key` | the list answers the key **masked** (`hdHR**********YTC0`); the reveal route returns the plaintext |
| `PUT /api/token/` with `group: 国内模型` | **200** — without it the relay answers `503 No available channel … under group default` |
| `POST /v1/chat/completions` | **200** with real content (`deepseek-v4.1-flash`) |
| tools | **works** — a `tools` request returns `tool_calls: [get_time]` |
| `POST /api/user/checkin` | **not enabled** on this panel |

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| mailbox | Emailnator `POST /api/generate-email` (`ids: [3]`), falling back to temp.tf `GET /api/account` | a fresh `@gmail.com` (or a Microsoft plus-alias) registered in its dot-free form; the box is snapshotted **before** the code is requested — a recycled address is full of other tenants' mail, so only ids *and* a timestamp newer than that snapshot count, and the message must name the panel in its sender/subject |
| status | `GET /api/status` | gate check before spending a mailbox |
| send code | `GET /api/verification?email=…` | panel mails the 6-digit code |
| code | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | polls every 5 s inside a 240 s window; the code is read only from the panel's own mail (`验证码`/`code`-anchored) |
| register | `POST /api/user/register` | `{username, password, email, verification_code}` |
| login | `POST /api/user/login` | `access_token`, then `New-Api-User: <id>` for the token routes |
| group | `GET /api/pricing` | the group the target model is served in is read from `enable_groups`, with `国内模型` as the static fallback |
| key | `POST /api/token/` → `POST /api/token/<id>/key` | the create answers a **masked** key on this fork; the reveal route is the only way to the plaintext |
| gate | `POST /v1/chat/completions` | 200 with real content = the key is kept |

Every request of one account goes through the **same pinned exit**: a fork that binds the pending verification code server-side answers `Verification code is incorrect or has expired` when the address that asked for the code is not the address that registers.

## ⚙️ CLI options

```bash
node src/cli.js --count 10                       # mint 10 keys (one account each)
node src/cli.js --count 5 --conc 3               # three accounts in flight
node src/cli.js --count 10 --model deepseek-v4-flash
node src/cli.js --group 国内模型                    # force a group instead of reading /api/pricing
node src/cli.js --verify-only                    # re-check every key in keys.txt
node src/cli.js --mail-rail emailnator,temptf     # mail rails tried in order
node src/cli.js --screen                         # test the exits against the panel
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456
node src/cli.js --help
```

| Env | Default | Meaning |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | exit pool, one per line (same as `--pool`); absent = direct |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | model used for the live gate |

## 🛰️ Behind a proxy

**Optional — recommended at scale.** Every request goes through one exit from your list, and one exit is **pinned per account**, so send-code, register, login, key reveal and the gate all leave from the same address and the panel never sees a mixed trail.

- **With a pool:** `--pool proxies.txt` (or `ZCTOTOKEN_PROXIES`). A dead exit fails that attempt and the next try takes the next exit.
- **Fail-closed:** an explicit `--pool` pointing at nothing falls back to **direct** with a printed warning — never a silent mixed run.
- **Without a pool:** the CLI prints `running WITHOUT a proxy (direct)` and works the same.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified key per line — git-ignored |
| `accounts.jsonl` | one JSON record per account: address, username, group, quota, mail rail, exit, gate result, key — git-ignored |
| `proxies.txt` | your exits, one per line — git-ignored |
| `out/` | run logs — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

Defaults: `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. Models are served as `zctotoken/<model id>`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 What the provider gives | ≈ **$2.00** of signup credit per account (`999,971` quota), no card |
| 🔑 What one key gets you | one 48-character key on its own account, created in `国内模型` and chat-verified on `deepseek-v4.1-flash` |
| 🌐 API shape | OpenAI-compatible: `POST https://www.zctotoken.com/v1/chat/completions` (9 model ids) |
| 🔒 Your data | only `zctotoken.com`, the mail backend (`Emailnator`, falling back to `temp.tf`) and your own proxy are contacted; keys stay on your machine |

## 🐞 Issues

If ZCtotoken changes its signup shape, its verification mail, the token routes or the group table, the tool stops at that step and reports the refusal verbatim (the exact status, the message the panel returned, the group it tried). **[Open an issue](../../issues)** with the command and the exact output.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>
