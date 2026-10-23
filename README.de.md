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

**ZCtotoken-Konten in großen Mengen erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Konnektor.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenlose Stufe](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-9-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

ZCtotoken ist ein **New-API**-Fork hinter einem chinesischen CDN. Die Registrierung ist captcha-frei (`turnstile_check: false`) und die einzige Hürde ist ein 6-stelliger Code, der an die Adresse geschickt wird — das gesamte Konto ist also über reines HTTP automatisierbar, **außer** dem Lesen dieses Postfachs, weshalb das Tool mit Emailnator spricht und die punktfreie Form der Adresse registriert, die es erhält.

Die Falle in diesem Panel ist die **Gruppe**, nicht die Registrierung. `/api/pricing` liefert die günstigen deepseek-IDs nur innerhalb von `国内模型`; ein Token, das in `default` verbleibt, erhält die Antwort `503 No available channel for model deepseek-v4.1-flash under group default`. Die CLI liest die Gruppentabelle und erstellt das Token in der Gruppe, aus der das Zielmodell tatsächlich bedient wird, und beweist den Schlüssel dann mit einer echten Completion, bevor er in `keys.txt` geschrieben wird.

## 🎁 Kostenlose Stufe — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Registrierungsguthaben | **999.971 Quota** gemessen an einem frischen Konto (`quota_per_unit: 500000` → ≈ **$2.00**) |
| Täglicher Check-in | **deaktiviert** (`checkin_enabled: false`; die Route antwortet `Check-in feature is not enabled`) |
| Karte / Telefon | keines von beiden |
| Abrechnungseinheit | **pro Konto** — die Quota liegt auf dem Konto, weshalb dieses Tool ein Konto pro Schlüssel erstellt |
| E-Mail-Hürde | **erforderlich** — 6-stelliger Code, verifiziert, bevor das Konto existiert |

Mit N Schlüsseln hältst du N Konten, d. h. **N × das Registrierungsguthaben**. Kein Check-in bedeutet, dass sich das Guthaben nicht wieder auffüllt: Wenn ein Schlüssel leerläuft, wird er ersetzt, indem ein weiteres Konto erzeugt wird — genau das tut `--count`.

> 💡 Die kostenlose Stufe wird von ZCtotoken festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen unter [www.zctotoken.com](https://www.zctotoken.com) — und lass die eigene Prüfung des Tools entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 9

`GET /v1/models` (mit einem Schlüssel) listet **9 IDs** in diesem Panel auf:

| Modell-ID | Gruppe, in der bedient | Verifiziert |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` beantwortet |
| `deepseek-v4-flash` | `bonus`, `国内模型` | gelistet |
| `deepseek-v4-flash-vision-exp` | `国内模型` | gelistet |
| `deepseek-v4-pro` | gelistet | gelistet |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | gelistet | gelistet |
| `kimi-k3` | gelistet | gelistet |
| `MiniMax-M3` | gelistet | gelistet |

> ⚠️ `/v1/models` antwortet **nur auf GET** — ein POST wird mit `Invalid URL (POST /v1/models)` abgelehnt.

## 🧪 Die API verwenden

Basis-URL **`https://www.zctotoken.com/v1`** — OpenAI-kompatibel.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

Das Modell gibt seine Begründung in `reasoning_content` neben `content` zurück, sodass ein Client, der nur `content` liest, trotzdem Text sieht.

## 🛠 Schnellstart

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

Es ist weder ein Browser noch ein Captcha-Solver beteiligt: Die Registrierung des Panels ist reines HTTP plus ein Postfach. Ein Schlüssel wird **nur** dann in `keys.txt` geschrieben, wenn `/v1/chat/completions` mit 200 und echtem Inhalt antwortet; `accounts.jsonl` speichert die Adresse, die Gruppe, in der das Token gelandet ist, und das Prüfergebnis.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste (optional — ohne eine läuft die CLI direkt), nach der Anzahl der zu erstellenden Konten und nach dem für die Live-Prüfung verwendeten Modell, merkt sie sich in `launcher.config.json` und führt die CLI aus: **mint**, **verify**, **screen** (die Exits gegen das Panel testen), **settings**, **help** und **Connect to 9Router**.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`; die Code-Mail kommt innerhalb von Sekunden an |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200** mit `access_token` |
| `POST /api/token/` dann `POST /api/token/<id>/key` | die Liste antwortet mit dem Schlüssel **maskiert** (`hdHR**********YTC0`); die Reveal-Route liefert den Klartext |
| `PUT /api/token/` mit `group: 国内模型` | **200** — ohne dies antwortet das Relay `503 No available channel … under group default` |
| `POST /v1/chat/completions` | **200** mit echtem Inhalt (`deepseek-v4.1-flash`) |
| tools | **funktioniert** — eine `tools`-Anfrage liefert `tool_calls: [get_time]` |
| `POST /api/user/checkin` | **nicht aktiviert** in diesem Panel |

> **Qualitätsprüfungen.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt` geschrieben wurde
> (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben Regel auf Modellebene: Ein Eintrag wird
> **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung,
> ein toter Schlüssel oder ein toter Anbieter wird verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus;
> Fehler werden gemeldet, nie verborgen.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Postfach | Emailnator `POST /api/generate-email` (`ids: [3]`), mit Rückfall auf temp.tf `GET /api/account` | eine frische `@gmail.com` (oder ein Microsoft-Plus-Alias), registriert in ihrer punktfreien Form; das Postfach wird **vor** der Anforderung des Codes geschnappt — eine wiederverwendete Adresse ist voll mit der Post anderer Nutzer, daher zählen nur IDs *und* ein Zeitstempel, der neuer als dieser Schnappschuss ist, und die Nachricht muss das Panel in ihrem Absender/Betreff nennen |
| Status | `GET /api/status` | Prüfung der Hürde, bevor ein Postfach verbraucht wird |
| Code senden | `GET /api/verification?email=…` | das Panel mailt den 6-stelligen Code |
| Code | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | fragt alle 5 s innerhalb eines 240-s-Fensters ab; der Code wird nur aus der eigenen Mail des Panels gelesen (`验证码`/`code`-verankert) |
| Registrieren | `POST /api/user/register` | `{username, password, email, verification_code}` |
| Anmelden | `POST /api/user/login` | `access_token`, dann `New-Api-User: <id>` für die Token-Routen |
| Gruppe | `GET /api/pricing` | die Gruppe, in der das Zielmodell bedient wird, wird aus `enable_groups` gelesen, mit `国内模型` als statischem Rückfall |
| Schlüssel | `POST /api/token/` → `POST /api/token/<id>/key` | die Erstellung antwortet in diesem Fork mit einem **maskierten** Schlüssel; die Reveal-Route ist der einzige Weg zum Klartext |
| Prüfung | `POST /v1/chat/completions` | 200 mit echtem Inhalt = der Schlüssel wird behalten |

Jede Anfrage eines Kontos läuft über denselben **angehefteten Exit**: Ein Fork, der den ausstehenden Verifizierungscode serverseitig bindet, antwortet `Verification code is incorrect or has expired`, wenn die Adresse, die den Code angefordert hat, nicht die Adresse ist, die sich registriert.

## ⚙️ CLI-Optionen

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

| Env | Standard | Bedeutung |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | Exit-Pool, einer pro Zeile (wie `--pool`); nicht vorhanden = direkt |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | für die Live-Prüfung verwendetes Modell |

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen.** Jede Anfrage läuft über einen Exit aus deiner Liste, und ein Exit wird **pro Konto angeheftet**, sodass Code senden, Registrieren, Anmelden, Schlüssel-Reveal und die Prüfung alle von derselben Adresse ausgehen und das Panel nie eine gemischte Spur sieht.

- **Mit einem Pool:** `--pool proxies.txt` (oder `ZCTOTOKEN_PROXIES`). Ein toter Exit lässt diesen Versuch scheitern und der nächste Versuch nimmt den nächsten Exit.
- **Fail-closed:** Ein explizites `--pool`, das auf nichts zeigt, fällt mit einer ausgegebenen Warnung auf **direkt** zurück — niemals ein stiller gemischter Lauf.
- **Ohne einen Pool:** Die CLI gibt `running WITHOUT a proxy (direct)` aus und funktioniert genauso.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter Schlüssel pro Zeile — von Git ignoriert |
| `accounts.jsonl` | ein JSON-Datensatz pro Konto: Adresse, Benutzername, Gruppe, Quota, Mail-Rail, Exit, Prüfergebnis, Schlüssel — von Git ignoriert |
| `proxies.txt` | deine Exits, einer pro Zeile — von Git ignoriert |
| `out/` | Ausführungsprotokolle — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

Standardwerte: `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. Modelle werden als `zctotoken/<model id>` bereitgestellt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 Was der Anbieter gibt | ≈ **$2.00** Registrierungsguthaben pro Konto (`999.971` Quota), keine Karte |
| 🔑 Was ein Schlüssel dir bringt | ein 48-stelliger Schlüssel auf seinem eigenen Konto, erstellt in `国内模型` und chat-verifiziert auf `deepseek-v4.1-flash` |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://www.zctotoken.com/v1/chat/completions` (9 Modell-IDs) |
| 🔒 Deine Daten | nur `zctotoken.com`, das Mail-Backend (`Emailnator`, mit Rückfall auf `temp.tf`) und dein eigener Proxy werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Probleme

Wenn ZCtotoken seine Registrierungsform, seine Verifizierungsmail, die Token-Routen oder die Gruppentabelle ändert, stoppt das Tool an diesem Schritt und meldet die Ablehnung wörtlich (den genauen Status, die vom Panel zurückgegebene Nachricht, die Gruppe, die es versucht hat). **[Öffne ein Issue](../../issues)** mit dem Befehl und der genauen Ausgabe.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>