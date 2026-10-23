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

**Массовое создание аккаунтов ZCtotoken с автоматически сгенерированными API-ключами — инференс, совместимый с OpenAI, + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-9-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

ZCtotoken — это форк **New API** за китайским CDN. Регистрация проходит без капчи (`turnstile_check: false`), и единственное препятствие — 6-значный код, отправляемый на адрес, — поэтому весь аккаунт автоматизируется через обычный HTTP, **за исключением** чтения этого почтового ящика, из-за чего инструмент обращается к Emailnator и регистрирует адрес в форме без точек.

Ловушка на этой панели — это **группа**, а не регистрация. `/api/pricing` отдаёт дешёвые идентификаторы deepseek только внутри `国内模型`; токен, оставленный в `default`, получает ответ `503 No available channel for model deepseek-v4.1-flash under group default`. CLI читает таблицу групп и создаёт токен в той группе, из которой целевая модель действительно обслуживается, а затем подтверждает ключ реальным запросом на генерацию, прежде чем записать его в `keys.txt`.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Кредит при регистрации | **999,971 квота**, измеренная на новом аккаунте (`quota_per_unit: 500000` → ≈ **$2.00**) |
| Ежедневная отметка | **отключена** (`checkin_enabled: false`; маршрут отвечает `Check-in feature is not enabled`) |
| Карта / телефон | ни то, ни другое |
| Единица биллинга | **на аккаунт** — квота привязана к аккаунту, поэтому инструмент создаёт один аккаунт на ключ |
| Почтовый шлюз | **обязателен** — 6-значный код, проверяется до создания аккаунта |

С N ключами у вас N аккаунтов, то есть **N × кредит при регистрации**. Отсутствие отметки означает, что баланс не пополняется: когда ключ исчерпывается, он заменяется созданием нового аккаунта — именно это делает `--count`.

> 💡 Бесплатный тариф устанавливается ZCtotoken и может измениться. Проверяйте актуальные цифры на [www.zctotoken.com](https://www.zctotoken.com) — и пусть решение принимает собственный шлюз инструмента:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 9

`GET /v1/models` (с ключом) перечисляет **9 идентификаторов** на этой панели:

| ID модели | Группа обслуживания | Проверено |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` отвечает |
| `deepseek-v4-flash` | `bonus`, `国内模型` | в списке |
| `deepseek-v4-flash-vision-exp` | `国内模型` | в списке |
| `deepseek-v4-pro` | в списке | в списке |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | в списке | в списке |
| `kimi-k3` | в списке | в списке |
| `MiniMax-M3` | в списке | в списке |

> ⚠️ `/v1/models` отвечает **только на GET** — POST отклоняется с `Invalid URL (POST /v1/models)`.

## 🧪 Как использовать API

Базовый URL **`https://www.zctotoken.com/v1`** — совместим с OpenAI.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

Модель возвращает свои рассуждения в `reasoning_content` рядом с `content`, поэтому клиент, читающий только `content`, всё равно видит текст.

## 🛠 Быстрый старт

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

Браузер и решатель капчи не задействованы: регистрация на панели — это чистый HTTP плюс почтовый ящик. Ключ записывается в `keys.txt` **только** после того, как `/v1/chat/completions` ответит 200 с реальным содержимым; `accounts.jsonl` хранит адрес, группу, в которую попал токен, и результат шлюза.

### 🖱️ Лаунчер

Лаунчер запрашивает список прокси (необязательно — без него CLI работает напрямую), сколько аккаунтов создать и модель, используемую для живого шлюза, запоминает их в `launcher.config.json` и запускает CLI: **mint**, **verify**, **screen** (проверить выходы против панели), **settings**, **help** и **Connect to 9Router**.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`; письмо с кодом приходит в течение секунд |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200** с `access_token` |
| `POST /api/token/` затем `POST /api/token/<id>/key` | список отдаёт ключ **замаскированным** (`hdHR**********YTC0`); маршрут раскрытия возвращает открытый текст |
| `PUT /api/token/` с `group: 国内模型` | **200** — без этого ретранслятор отвечает `503 No available channel … under group default` |
| `POST /v1/chat/completions` | **200** с реальным содержимым (`deepseek-v4.1-flash`) |
| инструменты | **работает** — запрос с `tools` возвращает `tool_calls: [get_time]` |
| `POST /api/user/checkin` | **не включено** на этой панели |

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` до того, как был записан в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Повторяйте шаг проверки в любое время;
> сбои сообщаются, никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| почтовый ящик | Emailnator `POST /api/generate-email` (`ids: [3]`), с откатом на temp.tf `GET /api/account` | свежий `@gmail.com` (или плюс-алиас Microsoft), регистрируемый в форме без точек; ящик снимается как снимок **до** запроса кода — переиспользованный адрес полон писем других арендаторов, поэтому учитываются только ids *и* метка времени новее этого снимка, а сообщение должно называть панель в отправителе/теме |
| статус | `GET /api/status` | проверка шлюза перед расходованием почтового ящика |
| отправка кода | `GET /api/verification?email=…` | панель отправляет 6-значный код |
| код | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | опрос каждые 5 с в течение 240 с; код читается только из собственного письма панели (с привязкой к `验证码`/`code`) |
| регистрация | `POST /api/user/register` | `{username, password, email, verification_code}` |
| вход | `POST /api/user/login` | `access_token`, затем `New-Api-User: <id>` для маршрутов токенов |
| группа | `GET /api/pricing` | группа, в которой обслуживается целевая модель, читается из `enable_groups`, со статическим откатом на `国内模型` |
| ключ | `POST /api/token/` → `POST /api/token/<id>/key` | создание отдаёт **замаскированный** ключ в этом форке; маршрут раскрытия — единственный путь к открытому тексту |
| шлюз | `POST /v1/chat/completions` | 200 с реальным содержимым = ключ сохраняется |

Каждый запрос одного аккаунта проходит через **один закреплённый выход**: форк, привязывающий ожидающий код подтверждения на стороне сервера, отвечает `Verification code is incorrect or has expired`, когда адрес, запросивший код, не совпадает с адресом, который регистрируется.

## ⚙️ Опции CLI

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

| Переменная | По умолчанию | Значение |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | пул выходов, по одному в строке (то же, что `--pool`); отсутствует = напрямую |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | модель, используемая для живого шлюза |

## 🛰️ За прокси

**Необязательно — рекомендуется при масштабе.** Каждый запрос проходит через один выход из вашего списка, и один выход **закреплён за аккаунтом**, поэтому отправка кода, регистрация, вход, раскрытие ключа и шлюз — всё исходит с одного адреса, и панель никогда не видит смешанный след.

- **С пулом:** `--pool proxies.txt` (или `ZCTOTOKEN_PROXIES`). Мёртвый выход проваливает эту попытку, и следующая попытка берёт следующий выход.
- **Отказ с закрытием:** явный `--pool`, указывающий в никуда, откатывается на **напрямую** с напечатанным предупреждением — никогда не молчаливый смешанный запуск.
- **Без пула:** CLI печатает `running WITHOUT a proxy (direct)` и работает так же.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один проверенный вживую ключ на строку — игнорируется git |
| `accounts.jsonl` | одна JSON-запись на аккаунт: адрес, имя пользователя, группа, квота, почтовый рельс, выход, результат шлюза, ключ — игнорируется git |
| `proxies.txt` | ваши выходы, по одному в строке — игнорируется git |
| `out/` | журналы запусков — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

Значения по умолчанию: `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. Модели обслуживаются как `zctotoken/<model id>`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 Что даёт провайдер | ≈ **$2.00** кредита при регистрации на аккаунт (`999,971` квота), без карты |
| 🔑 Что даёт один ключ | один 48-символьный ключ на собственном аккаунте, созданный в `国内模型` и проверенный чатом на `deepseek-v4.1-flash` |
| 🌐 Форма API | совместим с OpenAI: `POST https://www.zctotoken.com/v1/chat/completions` (9 идентификаторов моделей) |
| 🔒 Ваши данные | связь только с `zctotoken.com`, почтовым бэкендом (`Emailnator`, с откатом на `temp.tf`) и вашим собственным прокси; ключи остаются на вашей машине |

## 🐞 Проблемы

Если ZCtotoken изменит форму регистрации, письмо с подтверждением, маршруты токенов или таблицу групп, инструмент остановится на этом шаге и сообщит отказ дословно (точный статус, сообщение, возвращённое панелью, группу, которую он попробовал). **[Откройте issue](../../issues)** с командой и точным выводом.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>