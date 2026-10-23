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

**自動生成された API キーで ZCtotoken アカウントを一括作成 — OpenAI 互換の推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-9-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

ZCtotoken は中国の CDN の背後にある **New API** のフォークです。サインアップはキャプチャ不要（`turnstile_check: false`）で、唯一の関門はアドレスに送信される 6 桁のコードです。つまり、その受信トレイを読むこと**以外**は、アカウント全体をプレーンな HTTP で自動化できます。だからこそ、このツールは Emailnator と通信し、取得したアドレスのドットなし形式を登録します。

このパネルの罠はサインアップではなく**グループ**です。`/api/pricing` は安価な deepseek の id を `国内模型` 内でのみ提供します。`default` に残されたトークンには `503 No available channel for model deepseek-v4.1-flash under group default` と応答されます。CLI はグループテーブルを読み取り、対象モデルが実際に提供されているグループでトークンを作成し、`keys.txt` に書き込む前に実際の補完でキーを証明します。

## 🎁 無料枠 — どれだけ得られるか

| 項目 | 値 |
| --- | --- |
| サインアップクレジット | 新規アカウントで計測された **999,971 クォータ**（`quota_per_unit: 500000` → 約 **$2.00**） |
| デイリーチェックイン | **無効**（`checkin_enabled: false`、ルートは `Check-in feature is not enabled` と応答） |
| カード / 電話 | どちらも不要 |
| 課金単位 | **アカウント単位** — クォータはアカウントに紐づくため、このツールはキーごとに 1 アカウントを作成します |
| メールの関門 | **必須** — 6 桁のコード、アカウントが存在する前に検証されます |

N 個のキーがあれば N 個のアカウントを保持することになり、つまり **N × サインアップクレジット**です。チェックインがないということは残高が補充されないということで、キーが枯渇したら別のアカウントを作成して置き換えます。これがまさに `--count` の動作です。

> 💡 無料枠は ZCtotoken によって設定され、変更される可能性があります。最新の数値は [www.zctotoken.com](https://www.zctotoken.com) で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全 9 種類

`GET /v1/models`（キー付き）はこのパネルで **9 個の id** を一覧表示します:

| モデル ID | 提供グループ | 検証済み |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**、`tool_calls` 応答あり |
| `deepseek-v4-flash` | `bonus`、`国内模型` | 一覧表示 |
| `deepseek-v4-flash-vision-exp` | `国内模型` | 一覧表示 |
| `deepseek-v4-pro` | 一覧表示 | 一覧表示 |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | 一覧表示 | 一覧表示 |
| `kimi-k3` | 一覧表示 | 一覧表示 |
| `MiniMax-M3` | 一覧表示 | 一覧表示 |

> ⚠️ `/v1/models` は **GET のみ**に応答します — POST は `Invalid URL (POST /v1/models)` で拒否されます。

## 🧪 API の使い方

ベース URL **`https://www.zctotoken.com/v1`** — OpenAI 互換。

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

モデルは `content` の隣の `reasoning_content` に推論を返すため、`content` のみを読むクライアントでもテキストを確認できます。

## 🛠 クイックスタート

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

ブラウザもキャプチャソルバーも関与しません: パネルのサインアップは純粋な HTTP と受信トレイだけです。キーは `/v1/chat/completions` が実際のコンテンツとともに 200 を返した**後にのみ** `keys.txt` に書き込まれます。`accounts.jsonl` はアドレス、トークンが入ったグループ、ゲート結果を保持します。

### 🖱️ ランチャー

ランチャーはプロキシリスト（オプション — なしの場合は CLI は直接実行）、作成するアカウント数、ライブゲートに使用するモデルを尋ね、それらを `launcher.config.json` に記憶し、CLI を実行します: **mint**、**verify**、**screen**（パネルに対して出口をテスト）、**settings**、**help**、**Connect to 9Router**。

## ✅ 検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`、`email_verification: true`、`turnstile_check: false`、`checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`、コードメールは数秒以内に到着 |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200**、`access_token` 付き |
| `POST /api/token/` その後 `POST /api/token/<id>/key` | リストはキーを**マスク**して応答（`hdHR**********YTC0`）、reveal ルートは平文を返す |
| `PUT /api/token/` に `group: 国内模型` | **200** — これがないとリレーは `503 No available channel … under group default` と応答 |
| `POST /v1/chat/completions` | **200**、実際のコンテンツ付き（`deepseek-v4.1-flash`） |
| tools | **動作** — `tools` リクエストは `tool_calls: [get_time]` を返す |
| `POST /api/user/checkin` | このパネルでは**有効化されていない** |

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前にライブの `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダは追加されずに除外されます。検証ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| メールボックス | Emailnator `POST /api/generate-email`（`ids: [3]`）、temp.tf `GET /api/account` にフォールバック | 新しい `@gmail.com`（または Microsoft のプラスエイリアス）をドットなし形式で登録。ボックスはコードを要求する**前に**スナップショットされます — リサイクルされたアドレスは他のテナントのメールで溢れているため、そのスナップショットより新しい id *と* タイムスタンプのみがカウントされ、メッセージは送信者/件名にパネル名を含む必要があります |
| ステータス | `GET /api/status` | メールボックスを使う前のゲートチェック |
| コード送信 | `GET /api/verification?email=…` | パネルが 6 桁のコードをメール送信 |
| コード | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | 240 秒のウィンドウ内で 5 秒ごとにポーリング。コードはパネル自身のメールからのみ読み取られます（`验证码`/`code` をアンカー） |
| 登録 | `POST /api/user/register` | `{username, password, email, verification_code}` |
| ログイン | `POST /api/user/login` | `access_token`、その後トークンルート用に `New-Api-User: <id>` |
| グループ | `GET /api/pricing` | 対象モデルが提供されるグループは `enable_groups` から読み取られ、`国内模型` が静的フォールバック |
| キー | `POST /api/token/` → `POST /api/token/<id>/key` | このフォークでは作成が**マスク**されたキーを返します。reveal ルートが平文への唯一の方法 |
| ゲート | `POST /v1/chat/completions` | 実際のコンテンツとともに 200 = キーが保持される |

1 つのアカウントのすべてのリクエストは**同じ固定された出口**を通過します: 保留中の検証コードをサーバー側でバインドするフォークは、コードを要求したアドレスが登録するアドレスでない場合、`Verification code is incorrect or has expired` と応答します。

## ⚙️ CLI オプション

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

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | 出口プール、1 行に 1 つ（`--pool` と同じ）。存在しない場合は直接接続 |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | ライブゲートに使用するモデル |

## 🛰️ プロキシの背後で

**オプション — 大規模な場合は推奨。** すべてのリクエストはリストの 1 つの出口を通過し、1 つの出口が**アカウントごとに固定**されるため、コード送信、登録、ログイン、キー reveal、ゲートはすべて同じアドレスから出て行き、パネルが混在した痕跡を見ることはありません。

- **プールあり:** `--pool proxies.txt`（または `ZCTOTOKEN_PROXIES`）。死んだ出口はその試行を失敗させ、次の試行が次の出口を使用します。
- **フェイルクローズ:** 何も指していない明示的な `--pool` は、警告を出力して**直接接続**にフォールバックします — 決してサイレントな混在実行にはなりません。
- **プールなし:** CLI は `running WITHOUT a proxy (direct)` と出力し、同じように動作します。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | ライブ検証済みのキーが 1 行に 1 つ — git で無視 |
| `accounts.jsonl` | アカウントごとに 1 つの JSON レコード: アドレス、ユーザー名、グループ、クォータ、メールレール、出口、ゲート結果、キー — git で無視 |
| `proxies.txt` | 出口、1 行に 1 つ — git で無視 |
| `out/` | 実行ログ — git で無視 |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 OmniRoute に接続

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

デフォルト: `--9router-prefix zctotoken`、`--9router-name ZCtotoken`、`--base-url https://www.zctotoken.com/v1`、`--model deepseek-v4.1-flash`。モデルは `zctotoken/<model id>` として提供されます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダ | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 プロバイダが提供するもの | アカウントあたり約 **$2.00** のサインアップクレジット（`999,971` クォータ）、カード不要 |
| 🔑 1 つのキーで得られるもの | 独自のアカウント上の 48 文字のキー 1 つ、`国内模型` で作成され `deepseek-v4.1-flash` でチャット検証済み |
| 🌐 API 形式 | OpenAI 互換: `POST https://www.zctotoken.com/v1/chat/completions`（9 個のモデル id） |
| 🔒 あなたのデータ | 通信先は `zctotoken.com`、メールバックエンド（`Emailnator`、`temp.tf` にフォールバック）、およびあなた自身のプロキシのみ。キーはあなたのマシンに留まります |

## 🐞 問題報告

ZCtotoken がサインアップの形式、検証メール、トークンルート、またはグループテーブルを変更した場合、ツールはそのステップで停止し、拒否をそのまま報告します（正確なステータス、パネルが返したメッセージ、試行したグループ）。コマンドと正確な出力を添えて **[issue を作成してください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>