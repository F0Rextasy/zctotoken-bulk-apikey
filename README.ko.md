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

**자동 생성된 API 키로 ZCtotoken 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-9-of-them) · [🧪 API 사용법](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 존재하는 이유

ZCtotoken은 중국 CDN 뒤에 있는 **New API** 포크입니다. 가입에는 캡차가 없고(`turnstile_check: false`), 유일한 관문은 해당 주소로 발송되는 6자리 코드입니다. 따라서 받은편지함을 읽는 것 **외에는** 계정 전체를 순수 HTTP로 자동화할 수 있습니다. 그래서 이 도구는 Emailnator와 통신하고, 받은 주소의 점 없는(dot-free) 형태로 등록합니다.

이 패널의 함정은 가입이 아니라 **그룹**입니다. `/api/pricing`은 저렴한 deepseek id를 `国内模型` 안에서만 제공합니다. `default`에 남겨진 토큰은 `503 No available channel for model deepseek-v4.1-flash under group default`라는 응답을 받습니다. CLI는 그룹 테이블을 읽고 대상 모델이 실제로 제공되는 그룹에 토큰을 생성한 뒤, `keys.txt`에 기록하기 전에 실제 완성 요청으로 키를 검증합니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

| 항목 | 값 |
| --- | --- |
| 가입 크레딧 | 새 계정에서 측정된 **999,971 쿼터** (`quota_per_unit: 500000` → 약 **$2.00**) |
| 일일 출석 체크 | **비활성화** (`checkin_enabled: false`; 라우트는 `Check-in feature is not enabled` 응답) |
| 카드 / 전화번호 | 둘 다 불필요 |
| 과금 단위 | **계정당** — 쿼터는 계정에 귀속되므로 이 도구는 키 하나당 계정 하나를 생성합니다 |
| 이메일 관문 | **필수** — 6자리 코드, 계정 생성 전에 검증됨 |

키가 N개면 계정도 N개, 즉 **N × 가입 크레딧**을 보유합니다. 출석 체크가 없다는 것은 잔액이 다시 채워지지 않는다는 뜻입니다. 키가 소진되면 새 계정을 생성해 대체하며, 바로 이것이 `--count`가 하는 일입니다.

> 💡 무료 티어는 ZCtotoken이 정하며 변경될 수 있습니다. 실시간 수치는 [www.zctotoken.com](https://www.zctotoken.com)에서 확인하세요 — 그리고 도구 자체의 관문이 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 9개 전부

`GET /v1/models` (키 필요)는 이 패널에서 **9개의 id**를 나열합니다:

| 모델 ID | 제공 그룹 | 검증됨 |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` 응답함 |
| `deepseek-v4-flash` | `bonus`, `国内模型` | 나열됨 |
| `deepseek-v4-flash-vision-exp` | `国内模型` | 나열됨 |
| `deepseek-v4-pro` | 나열됨 | 나열됨 |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | 나열됨 | 나열됨 |
| `kimi-k3` | 나열됨 | 나열됨 |
| `MiniMax-M3` | 나열됨 | 나열됨 |

> ⚠️ `/v1/models`는 **GET에만** 응답합니다 — POST는 `Invalid URL (POST /v1/models)`로 거부됩니다.

## 🧪 API 사용법

Base URL **`https://www.zctotoken.com/v1`** — OpenAI 호환.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

모델은 추론 내용을 `content` 옆의 `reasoning_content`에 반환하므로, `content`만 읽는 클라이언트도 텍스트를 볼 수 있습니다.

## 🛠 빠른 시작

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

브라우저도 캡차 솔버도 필요하지 않습니다: 이 패널의 가입은 순수 HTTP와 받은편지함뿐입니다. 키는 `/v1/chat/completions`가 실제 콘텐츠와 함께 200을 응답한 **뒤에만** `keys.txt`에 기록됩니다. `accounts.jsonl`은 주소, 토큰이 들어간 그룹, 관문 결과를 보관합니다.

### 🖱️ 런처

런처는 프록시 목록(선택 사항 — 없으면 CLI는 직접 연결로 실행됨), 생성할 계정 수, 실시간 관문에 사용할 모델을 묻고, 이를 `launcher.config.json`에 기억한 뒤 CLI를 실행합니다: **mint**, **verify**, **screen**(패널에 대해 출구 테스트), **settings**, **help**, **Connect to 9Router**.

## ✅ 검증됨 — 모든 키가 테스트됩니다

| 확인 | 결과 |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`; 코드 메일이 몇 초 내 도착 |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200**, `access_token` 포함 |
| `POST /api/token/` 후 `POST /api/token/<id>/key` | 목록은 키를 **마스킹**하여 응답(`hdHR**********YTC0`); 공개 라우트가 평문을 반환 |
| `PUT /api/token/`에 `group: 国内模型` | **200** — 없으면 릴레이가 `503 No available channel … under group default` 응답 |
| `POST /v1/chat/completions` | **200**, 실제 콘텐츠 포함 (`deepseek-v4.1-flash`) |
| tools | **작동함** — `tools` 요청이 `tool_calls: [get_time]` 반환 |
| `POST /api/user/checkin` | 이 패널에서 **활성화되지 않음** |

> **품질 관문.** 여기 있는 모든 키는 `keys.txt`에 기록되기 전에 실시간 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 콤보도 모델 수준에서 같은 규칙을 따릅니다: 항목은
> **모델이 `chat-200`을 응답하고 도구를 호출할 수 있을 때만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키, 죽은 제공자는 추가되지 않고 제외됩니다. 언제든지 검증 단계를 다시 실행하세요;
> 실패는 보고되며, 절대 숨겨지지 않습니다.

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| mailbox | Emailnator `POST /api/generate-email` (`ids: [3]`), temp.tf `GET /api/account`로 폴백 | 새 `@gmail.com`(또는 Microsoft 플러스 별칭)을 점 없는 형태로 등록; 코드 요청 **전에** 받은편지함을 스냅샷 — 재활용된 주소는 다른 사용자의 메일로 가득하므로, 해당 스냅샷보다 새로운 id *와* 타임스탬프만 인정되며, 메시지는 발신자/제목에 패널 이름을 명시해야 함 |
| status | `GET /api/status` | 받은편지함을 소비하기 전 관문 확인 |
| send code | `GET /api/verification?email=…` | 패널이 6자리 코드를 메일로 발송 |
| code | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | 240초 창 안에서 5초마다 폴링; 코드는 패널 자체 메일에서만 읽음 (`验证码`/`code` 앵커) |
| register | `POST /api/user/register` | `{username, password, email, verification_code}` |
| login | `POST /api/user/login` | `access_token`, 이후 토큰 라우트에 `New-Api-User: <id>` |
| group | `GET /api/pricing` | 대상 모델이 제공되는 그룹을 `enable_groups`에서 읽음, `国内模型`을 정적 폴백으로 사용 |
| key | `POST /api/token/` → `POST /api/token/<id>/key` | 이 포크에서는 생성이 **마스킹된** 키를 응답; 공개 라우트가 평문을 얻는 유일한 방법 |
| gate | `POST /v1/chat/completions` | 실제 콘텐츠와 함께 200 = 키 유지 |

한 계정의 모든 요청은 **동일하게 고정된 출구**를 통과합니다: 대기 중인 검증 코드를 서버 측에 바인딩하는 포크는 코드를 요청한 주소와 등록하는 주소가 다르면 `Verification code is incorrect or has expired`를 응답합니다.

## ⚙️ CLI 옵션

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

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | 출구 풀, 한 줄에 하나 (`--pool`과 동일); 없으면 직접 연결 |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | 실시간 관문에 사용할 모델 |

## 🛰️ 프록시 뒤에서

**선택 사항 — 대규모에서는 권장.** 모든 요청은 목록의 출구 하나를 통과하며, 출구 하나가 **계정당 고정**되므로 코드 발송, 등록, 로그인, 키 공개, 관문이 모두 같은 주소에서 나가고 패널은 뒤섞인 흔적을 절대 보지 못합니다.

- **풀 사용 시:** `--pool proxies.txt` (또는 `ZCTOTOKEN_PROXIES`). 죽은 출구는 해당 시도를 실패시키고 다음 시도가 다음 출구를 사용합니다.
- **Fail-closed:** 아무것도 가리키지 않는 명시적 `--pool`은 경고를 출력하고 **직접 연결**로 폴백합니다 — 조용히 뒤섞여 실행되는 일은 없습니다.
- **풀 없이:** CLI는 `running WITHOUT a proxy (direct)`를 출력하고 동일하게 작동합니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 실시간 검증된 키 — git 무시됨 |
| `accounts.jsonl` | 계정당 하나의 JSON 레코드: 주소, 사용자 이름, 그룹, 쿼터, 메일 레일, 출구, 관문 결과, 키 — git 무시됨 |
| `proxies.txt` | 출구 목록, 한 줄에 하나 — git 무시됨 |
| `out/` | 실행 로그 — git 무시됨 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

기본값: `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. 모델은 `zctotoken/<model id>`로 제공됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 제공자가 주는 것 | 계정당 약 **$2.00**의 가입 크레딧 (`999,971` 쿼터), 카드 불필요 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 있는 48자 키 하나, `国内模型`에서 생성되고 `deepseek-v4.1-flash`에서 채팅 검증됨 |
| 🌐 API 형태 | OpenAI 호환: `POST https://www.zctotoken.com/v1/chat/completions` (9개 모델 id) |
| 🔒 데이터 | `zctotoken.com`, 메일 백엔드(`Emailnator`, `temp.tf`로 폴백), 자체 프록시만 접속됨; 키는 사용자 컴퓨터에 남음 |

## 🐞 이슈

ZCtotoken이 가입 형태, 검증 메일, 토큰 라우트 또는 그룹 테이블을 변경하면, 도구는 해당 단계에서 멈추고 거부 내용을 그대로 보고합니다(정확한 상태, 패널이 반환한 메시지, 시도한 그룹). 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>