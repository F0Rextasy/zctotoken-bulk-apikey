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

**批量创建 ZCtotoken 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-9-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么有这个项目

ZCtotoken 是位于中国 CDN 之后的 **New API** 分支。它的注册无需验证码（`turnstile_check: false`），唯一的门槛是发送到邮箱的 6 位验证码——因此整个账户流程都可以通过纯 HTTP 自动化，**唯独**读取收件箱这一步例外，这就是为什么该工具与 Emailnator 通信，并以无点形式注册它获得的地址。

这个面板上的陷阱是**分组**，而不是注册。`/api/pricing` 只在 `国内模型` 中提供便宜的 deepseek id；留在 `default` 中的令牌会收到 `503 No available channel for model deepseek-v4.1-flash under group default`。CLI 会读取分组表，并在目标模型实际所在的分组中创建令牌，然后在写入 `keys.txt` 之前用一次真实的补全请求来验证密钥。

## 🎁 免费额度 — 你能获得多少

| 项目 | 值 |
| --- | --- |
| 注册赠送 | 在全新账户上测得 **999,971 配额**（`quota_per_unit: 500000` → 约 **$2.00**） |
| 每日签到 | **已禁用**（`checkin_enabled: false`；该路由返回 `Check-in feature is not enabled`） |
| 银行卡 / 手机 | 均不需要 |
| 计费单位 | **按账户** — 配额存在于账户上，这就是为什么该工具为每个密钥创建一个账户 |
| 邮箱门槛 | **必需** — 6 位验证码，在账户创建前验证 |

拥有 N 个密钥就意味着拥有 N 个账户，即 **N × 注册赠送额度**。没有签到意味着余额不会补充：当某个密钥耗尽时，就通过创建另一个账户来替换它，这正是 `--count` 所做的事。

> 💡 免费额度由 ZCtotoken 设定，可能会变化。请在 [www.zctotoken.com](https://www.zctotoken.com) 查看实时数字——并让工具自身的关卡来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 9 个

`GET /v1/models`（带密钥）在此面板上列出 **9 个 id**：

| 模型 ID | 所在分组 | 已验证 |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**，`tool_calls` 有响应 |
| `deepseek-v4-flash` | `bonus`、`国内模型` | 已列出 |
| `deepseek-v4-flash-vision-exp` | `国内模型` | 已列出 |
| `deepseek-v4-pro` | 已列出 | 已列出 |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | 已列出 | 已列出 |
| `kimi-k3` | 已列出 | 已列出 |
| `MiniMax-M3` | 已列出 | 已列出 |

> ⚠️ `/v1/models` **只响应 GET** — POST 会被拒绝并返回 `Invalid URL (POST /v1/models)`。

## 🧪 如何使用 API

基础 URL **`https://www.zctotoken.com/v1`** — 兼容 OpenAI。

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

模型会在 `content` 旁边的 `reasoning_content` 中返回其推理过程，因此只读取 `content` 的客户端仍然能看到文本。

## 🛠 快速开始

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

不涉及浏览器，也不需要验证码破解器：该面板的注册是纯 HTTP 加一个收件箱。只有当 `/v1/chat/completions` 返回 200 且带有真实内容时，密钥才会被写入 `keys.txt`；`accounts.jsonl` 会保留地址、令牌所在的分组以及关卡结果。

### 🖱️ 启动器

启动器会询问代理列表（可选——没有代理时 CLI 直接运行）、要创建多少个账户以及用于实时关卡验证的模型，将它们记住在 `launcher.config.json` 中，并运行 CLI：**mint**、**verify**、**screen**（针对面板测试出口）、**settings**、**help** 和 **Connect to 9Router**。

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查 | 结果 |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`、`email_verification: true`、`turnstile_check: false`、`checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`；验证码邮件在几秒内到达 |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200**，带有 `access_token` |
| `POST /api/token/` 然后 `POST /api/token/<id>/key` | 列表返回的密钥是**掩码**的（`hdHR**********YTC0`）；揭示路由返回明文 |
| `PUT /api/token/` 带 `group: 国内模型` | **200** — 没有它，中继会返回 `503 No available channel … under group default` |
| `POST /v1/chat/completions` | **200**，带有真实内容（`deepseek-v4.1-flash`） |
| 工具 | **可用** — 一个 `tools` 请求返回 `tool_calls: [get_time]` |
| `POST /api/user/checkin` | 在此面板上**未启用** |

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （绝不提供失效的密钥）。路由器组合在模型层面遵循同样的规则：只有当模型响应 `chat-200`
> 且能调用工具时，才会添加条目——不支持工具的模型、失效的密钥或失效的提供商都会被丢弃
> 而不是添加。随时重新运行验证步骤；失败会被报告，绝不隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 说明 |
| --- | --- | --- |
| 邮箱 | Emailnator `POST /api/generate-email`（`ids: [3]`），回退到 temp.tf `GET /api/account` | 一个全新的 `@gmail.com`（或 Microsoft 加号别名）以其无点形式注册；在请求验证码**之前**对收件箱做快照——被回收的地址充满了其他租户的邮件，因此只有 id *和* 比该快照更新的时间戳才算数，并且邮件的发件人/主题中必须提到该面板 |
| 状态 | `GET /api/status` | 在消耗邮箱之前进行关卡检查 |
| 发送验证码 | `GET /api/verification?email=…` | 面板发送 6 位验证码 |
| 验证码 | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | 在 240 秒窗口内每 5 秒轮询一次；验证码只从面板自己的邮件中读取（以 `验证码`/`code` 为锚点） |
| 注册 | `POST /api/user/register` | `{username, password, email, verification_code}` |
| 登录 | `POST /api/user/login` | `access_token`，然后为令牌路由使用 `New-Api-User: <id>` |
| 分组 | `GET /api/pricing` | 目标模型所在的分组从 `enable_groups` 中读取，以 `国内模型` 作为静态回退 |
| 密钥 | `POST /api/token/` → `POST /api/token/<id>/key` | 在此分支上，创建操作返回的是**掩码**密钥；揭示路由是获得明文的唯一途径 |
| 关卡 | `POST /v1/chat/completions` | 200 且带有真实内容 = 保留该密钥 |

一个账户的每个请求都通过**同一个固定出口**：如果某个分支在服务端绑定了待验证的验证码，那么当请求验证码的地址与注册的地址不一致时，会返回 `Verification code is incorrect or has expired`。

## ⚙️ CLI 选项

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

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | 出口池，每行一个（与 `--pool` 相同）；不存在 = 直连 |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | 用于实时关卡的模型 |

## 🛰️ 在代理之后

**可选——在规模化时推荐。** 每个请求都通过你列表中的一个出口，并且每个账户**固定**一个出口，因此发送验证码、注册、登录、密钥揭示和关卡都从同一地址发出，面板永远不会看到混杂的轨迹。

- **使用代理池：** `--pool proxies.txt`（或 `ZCTOTOKEN_PROXIES`）。失效的出口会使该次尝试失败，下一次尝试会使用下一个出口。
- **故障关闭：** 显式的 `--pool` 指向空内容时会回退到**直连**并打印警告——绝不会静默地混杂运行。
- **不使用代理池：** CLI 会打印 `running WITHOUT a proxy (direct)`，运行方式相同。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个经过实时验证的密钥 — 已被 git 忽略 |
| `accounts.jsonl` | 每个账户一条 JSON 记录：地址、用户名、分组、配额、邮件通道、出口、关卡结果、密钥 — 已被 git 忽略 |
| `proxies.txt` | 你的出口，每行一个 — 已被 git 忽略 |
| `out/` | 运行日志 — 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

默认值：`--9router-prefix zctotoken`、`--9router-name ZCtotoken`、`--base-url https://www.zctotoken.com/v1`、`--model deepseek-v4.1-flash`。模型以 `zctotoken/<model id>` 的形式提供。

## 🔑 一个密钥能给你带来什么

| | |
| --- | --- |
| 🏢 提供商 | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 提供商赠送 | 每个账户约 **$2.00** 的注册赠送额度（`999,971` 配额），无需银行卡 |
| 🔑 一个密钥能给你带来什么 | 在其自己账户上的一个 48 字符密钥，在 `国内模型` 中创建，并在 `deepseek-v4.1-flash` 上通过聊天验证 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://www.zctotoken.com/v1/chat/completions`（9 个模型 id） |
| 🔒 你的数据 | 只联系 `zctotoken.com`、邮件后端（`Emailnator`，回退到 `temp.tf`）和你自己的代理；密钥保留在你的机器上 |

## 🐞 问题反馈

如果 ZCtotoken 更改其注册形态、验证邮件、令牌路由或分组表，该工具会在该步骤停止，并原样报告拒绝信息（确切的状态码、面板返回的消息、它尝试的分组）。请**[提交 issue](../../issues)**，附上命令和确切的输出。

## 📄 许可证

MIT © 2026 — 参见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>