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

**Otomatik oluşturulan API anahtarlarıyla toplu ZCtotoken hesabı oluşturun — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-9-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

ZCtotoken, bir Çin CDN'i arkasındaki bir **New API** çatalıdır. Kaydı captcha'sızdır (`turnstile_check: false`) ve tek kapı, adrese gönderilen 6 haneli koddur — yani tüm hesap düz HTTP üzerinden otomatikleştirilebilir, **ancak** o gelen kutusunu okumak hariç; bu yüzden araç Emailnator ile konuşur ve aldığı adresin noktasız biçimini kaydeder.

Bu paneldeki tuzak kayıt değil, **grup**tur. `/api/pricing`, ucuz deepseek kimliklerini yalnızca `国内模型` içinde sunar; `default` içinde bırakılan bir token'a `503 No available channel for model deepseek-v4.1-flash under group default` yanıtı verilir. CLI, grup tablosunu okur ve token'ı hedef modelin gerçekte sunulduğu grupta oluşturur, ardından anahtarı `keys.txt` dosyasına yazmadan önce gerçek bir tamamlama ile kanıtlar.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

| Ne | Değer |
| --- | --- |
| Kayıt kredisi | Yeni bir hesapta ölçülen **999.971 kota** (`quota_per_unit: 500000` → ≈ **$2.00**) |
| Günlük giriş | **devre dışı** (`checkin_enabled: false`; rota `Check-in feature is not enabled` yanıtını verir) |
| Kart / telefon | hiçbiri |
| Faturalama birimi | **hesap başına** — kota hesapta yaşar, bu yüzden bu araç anahtar başına bir hesap oluşturur |
| E-posta kapısı | **gerekli** — 6 haneli kod, hesap oluşmadan önce doğrulanır |

N anahtarla N hesabınız olur, yani **N × kayıt kredisi**. Giriş olmaması, bakiyenin yenilenmediği anlamına gelir: bir anahtar tükendiğinde yerine başka bir hesap basılarak değiştirilir, ki `--count` tam olarak bunu yapar.

> 💡 Ücretsiz katman ZCtotoken tarafından belirlenir ve değişebilir. Güncel sayıları [www.zctotoken.com](https://www.zctotoken.com) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 9'unun tamamı

`GET /v1/models` (bir anahtarla) bu panelde **9 kimlik** listeler:

| Model Kimliği | Sunulduğu grup | Doğrulandı |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` yanıtlandı |
| `deepseek-v4-flash` | `bonus`, `国内模型` | listelendi |
| `deepseek-v4-flash-vision-exp` | `国内模型` | listelendi |
| `deepseek-v4-pro` | listelendi | listelendi |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | listelendi | listelendi |
| `kimi-k3` | listelendi | listelendi |
| `MiniMax-M3` | listelendi | listelendi |

> ⚠️ `/v1/models` **yalnızca GET** isteğine yanıt verir — bir POST isteği `Invalid URL (POST /v1/models)` ile reddedilir.

## 🧪 API nasıl kullanılır

Temel URL **`https://www.zctotoken.com/v1`** — OpenAI uyumlu.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

Model, akıl yürütmesini `content` yanında `reasoning_content` içinde döndürür, böylece yalnızca `content` okuyan bir istemci yine de metin görür.

## 🛠 Hızlı başlangıç

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

Hiçbir tarayıcı ve captcha çözücü devrede değildir: panelin kaydı saf HTTP artı bir gelen kutusudur. Bir anahtar `keys.txt` dosyasına **yalnızca** `/v1/chat/completions` gerçek içerikle 200 yanıtı verdikten sonra yazılır; `accounts.jsonl` adresi, token'ın düştüğü grubu ve kapı sonucunu saklar.

### 🖱️ Başlatıcı

Başlatıcı, proxy listesini (isteğe bağlı — olmadan CLI doğrudan çalışır), kaç hesap basılacağını ve canlı kapı için kullanılan modeli sorar, bunları `launcher.config.json` içinde hatırlar ve CLI'yi çalıştırır: **mint**, **verify**, **screen** (çıkışları panele karşı test eder), **settings**, **help** ve **Connect to 9Router**.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`; kod postası saniyeler içinde gelir |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200**, `access_token` ile |
| `POST /api/token/` ardından `POST /api/token/<id>/key` | liste anahtarı **maskelenmiş** olarak yanıtlar (`hdHR**********YTC0`); açığa çıkarma rotası düz metni döndürür |
| `PUT /api/token/` ile `group: 国内模型` | **200** — bu olmadan aktarma `503 No available channel … under group default` yanıtını verir |
| `POST /v1/chat/completions` | **200**, gerçek içerikle (`deepseek-v4.1-flash`) |
| araçlar | **çalışır** — bir `tools` isteği `tool_calls: [get_time]` döndürür |
| `POST /api/user/checkin` | bu panelde **etkin değil** |

> **Kalite kapıları.** Buradaki her anahtar, `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` testini geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtı veriyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> başarısızlıklar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| posta kutusu | Emailnator `POST /api/generate-email` (`ids: [3]`), temp.tf `GET /api/account` ile yedeklenir | noktasız biçiminde kaydedilen yeni bir `@gmail.com` (veya bir Microsoft artı takma adı); kutu, kod istenmeden **önce** anlık görüntülenir — geri dönüştürülmüş bir adres diğer kiracıların postalarıyla doludur, bu yüzden yalnızca o anlık görüntüden daha yeni kimlikler *ve* bir zaman damgası sayılır ve mesaj gönderen/konu alanında paneli adlandırmalıdır |
| durum | `GET /api/status` | bir posta kutusu harcamadan önce kapı kontrolü |
| kod gönder | `GET /api/verification?email=…` | panel 6 haneli kodu postalar |
| kod | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | 240 saniyelik bir pencere içinde her 5 saniyede bir yoklar; kod yalnızca panelin kendi postasından okunur (`验证码`/`code` çapalı) |
| kayıt | `POST /api/user/register` | `{username, password, email, verification_code}` |
| giriş | `POST /api/user/login` | `access_token`, ardından token rotaları için `New-Api-User: <id>` |
| grup | `GET /api/pricing` | hedef modelin sunulduğu grup `enable_groups` içinden okunur, statik yedek olarak `国内模型` ile |
| anahtar | `POST /api/token/` → `POST /api/token/<id>/key` | oluşturma bu çatalda **maskelenmiş** bir anahtar yanıtlar; açığa çıkarma rotası düz metne giden tek yoldur |
| kapı | `POST /v1/chat/completions` | gerçek içerikle 200 = anahtar tutulur |

Bir hesabın her isteği **aynı sabitlenmiş çıkıştan** geçer: bekleyen doğrulama kodunu sunucu tarafında bağlayan bir çatal, kodu isteyen adres ile kaydolan adres aynı olmadığında `Verification code is incorrect or has expired` yanıtını verir.

## ⚙️ CLI seçenekleri

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

| Ortam değişkeni | Varsayılan | Anlamı |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | çıkış havuzu, her satırda bir tane (`--pool` ile aynı); yoksa = doğrudan |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | canlı kapı için kullanılan model |

## 🛰️ Proxy arkasında

**İsteğe bağlı — ölçekte önerilir.** Her istek listenizden bir çıkıştan geçer ve bir çıkış **hesap başına sabitlenir**, böylece kod gönderme, kayıt, giriş, anahtar açığa çıkarma ve kapı hepsi aynı adresten çıkar ve panel hiçbir zaman karışık bir iz görmez.

- **Bir havuzla:** `--pool proxies.txt` (veya `ZCTOTOKEN_PROXIES`). Ölü bir çıkış o denemeyi başarısız kılar ve sonraki deneme bir sonraki çıkışı alır.
- **Fail-closed:** hiçbir şeyi işaret etmeyen açık bir `--pool`, yazdırılan bir uyarıyla **doğrudan** moda geri döner — asla sessizce karışık bir çalıştırma olmaz.
- **Havuz olmadan:** CLI `running WITHOUT a proxy (direct)` yazdırır ve aynı şekilde çalışır.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir canlı doğrulanmış anahtar — git tarafından yok sayılır |
| `accounts.jsonl` | hesap başına bir JSON kaydı: adres, kullanıcı adı, grup, kota, posta rayı, çıkış, kapı sonucu, anahtar — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız, her satırda bir tane — git tarafından yok sayılır |
| `out/` | çalıştırma günlükleri — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 OmniRoute'a bağlan

[OmniRoute](https://omniroute.online) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

Varsayılanlar: `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. Modeller `zctotoken/<model id>` olarak sunulur.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 Sağlayıcının verdikleri | hesap başına ≈ **$2.00** kayıt kredisi (`999,971` kota), kart yok |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabında 48 karakterlik bir anahtar, `国内模型` içinde oluşturulmuş ve `deepseek-v4.1-flash` üzerinde sohbetle doğrulanmış |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://www.zctotoken.com/v1/chat/completions` (9 model kimliği) |
| 🔒 Verileriniz | yalnızca `zctotoken.com`, posta arka ucu (`Emailnator`, yedek olarak `temp.tf`) ve kendi proxy'nizle iletişim kurulur; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

ZCtotoken kayıt biçimini, doğrulama postasını, token rotalarını veya grup tablosunu değiştirirse, araç o adımda durur ve reddi kelimesi kelimesine bildirir (tam durum, panelin döndürdüğü mesaj, denediği grup). Komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey katkıda bulunanlar

</div>