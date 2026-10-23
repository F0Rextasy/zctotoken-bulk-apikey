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

**Crea cuentas de ZCtotoken en masa con claves API generadas automáticamente — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-9-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

ZCtotoken es un fork de **New API** detrás de un CDN chino. Su registro no tiene captcha (`turnstile_check: false`) y la única barrera es un código de 6 dígitos enviado a la dirección — por lo que toda la cuenta es automatizable mediante HTTP simple **excepto** por la lectura de esa bandeja de entrada, que es la razón por la que la herramienta se comunica con Emailnator y registra la forma sin puntos de la dirección que obtiene.

La trampa en este panel es el **grupo**, no el registro. `/api/pricing` sirve los ids baratos de deepseek solo dentro de `国内模型`; un token que queda en `default` recibe como respuesta `503 No available channel for model deepseek-v4.1-flash under group default`. La CLI lee la tabla de grupos y crea el token en el grupo desde el que realmente se sirve el modelo objetivo, luego comprueba la clave con una completion real antes de escribirla en `keys.txt`.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Crédito de registro | **999,971 de cuota** medidos en una cuenta nueva (`quota_per_unit: 500000` → ≈ **$2.00**) |
| Check-in diario | **deshabilitado** (`checkin_enabled: false`; la ruta responde `Check-in feature is not enabled`) |
| Tarjeta / teléfono | ninguno |
| Unidad de facturación | **por cuenta** — la cuota vive en la cuenta, por eso esta herramienta crea una cuenta por clave |
| Barrera de correo | **obligatoria** — código de 6 dígitos, verificado antes de que exista la cuenta |

Con N claves tienes N cuentas, es decir, **N × el crédito de registro**. Sin check-in significa que el saldo no se recarga: cuando una clave se agota, se reemplaza creando otra cuenta, que es exactamente lo que hace `--count`.

> 💡 El nivel gratuito lo define ZCtotoken y puede cambiar. Consulta los números en vivo en [www.zctotoken.com](https://www.zctotoken.com) — y deja que la propia comprobación de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 9 en total

`GET /v1/models` (con una clave) lista **9 ids** en este panel:

| ID del modelo | Grupo en el que se sirve | Verificado |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` respondido |
| `deepseek-v4-flash` | `bonus`, `国内模型` | listado |
| `deepseek-v4-flash-vision-exp` | `国内模型` | listado |
| `deepseek-v4-pro` | listado | listado |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | listado | listado |
| `kimi-k3` | listado | listado |
| `MiniMax-M3` | listado | listado |

> ⚠️ `/v1/models` responde **solo a GET** — un POST se rechaza con `Invalid URL (POST /v1/models)`.

## 🧪 Cómo usar la API

URL base **`https://www.zctotoken.com/v1`** — compatible con OpenAI.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

El modelo devuelve su razonamiento en `reasoning_content` junto a `content`, por lo que un cliente que solo lee `content` igualmente ve texto.

## 🛠 Inicio rápido

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

No se involucra ningún navegador ni solucionador de captcha: el registro del panel es HTTP puro más una bandeja de entrada. Una clave se escribe en `keys.txt` **solo** después de que `/v1/chat/completions` responde 200 con contenido real; `accounts.jsonl` guarda la dirección, el grupo en el que quedó el token y el resultado de la comprobación.

### 🖱️ El lanzador

El lanzador pregunta por la lista de proxies (opcional — sin una, la CLI se ejecuta directo), cuántas cuentas crear y el modelo usado para la comprobación en vivo, los recuerda en `launcher.config.json` y ejecuta la CLI: **mint**, **verify**, **screen** (probar las salidas contra el panel), **settings**, **help** y **Connect to 9Router**.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`; el correo con el código llega en segundos |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200** con `access_token` |
| `POST /api/token/` y luego `POST /api/token/<id>/key` | la lista responde la clave **enmascarada** (`hdHR**********YTC0`); la ruta de revelado devuelve el texto plano |
| `PUT /api/token/` con `group: 国内模型` | **200** — sin esto el relay responde `503 No available channel … under group default` |
| `POST /v1/chat/completions` | **200** con contenido real (`deepseek-v4.1-flash`) |
| tools | **funciona** — una petición con `tools` devuelve `tool_calls: [get_time]` |
| `POST /api/user/checkin` | **no habilitado** en este panel |

> **Controles de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| buzón | Emailnator `POST /api/generate-email` (`ids: [3]`), con fallback a temp.tf `GET /api/account` | un `@gmail.com` nuevo (o un alias plus de Microsoft) registrado en su forma sin puntos; la bandeja se captura **antes** de solicitar el código — una dirección reciclada está llena de correo de otros inquilinos, así que solo cuentan los ids *y* una marca de tiempo más reciente que esa captura, y el mensaje debe nombrar el panel en su remitente/asunto |
| estado | `GET /api/status` | comprobación de la barrera antes de gastar un buzón |
| enviar código | `GET /api/verification?email=…` | el panel envía el código de 6 dígitos |
| código | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | sondea cada 5 s dentro de una ventana de 240 s; el código se lee solo del correo del propio panel (anclado a `验证码`/`code`) |
| registrar | `POST /api/user/register` | `{username, password, email, verification_code}` |
| iniciar sesión | `POST /api/user/login` | `access_token`, luego `New-Api-User: <id>` para las rutas de token |
| grupo | `GET /api/pricing` | el grupo en el que se sirve el modelo objetivo se lee de `enable_groups`, con `国内模型` como fallback estático |
| clave | `POST /api/token/` → `POST /api/token/<id>/key` | la creación responde una clave **enmascarada** en este fork; la ruta de revelado es la única vía al texto plano |
| comprobación | `POST /v1/chat/completions` | 200 con contenido real = la clave se conserva |

Cada petición de una cuenta pasa por la **misma salida fijada**: un fork que vincula el código de verificación pendiente del lado del servidor responde `Verification code is incorrect or has expired` cuando la dirección que pidió el código no es la dirección que se registra.

## ⚙️ Opciones de la CLI

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

| Variable de entorno | Predeterminado | Significado |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | grupo de salidas, una por línea (igual que `--pool`); ausente = directo |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | modelo usado para la comprobación en vivo |

## 🛰️ Detrás de un proxy

**Opcional — recomendado a escala.** Cada petición pasa por una salida de tu lista, y una salida está **fijada por cuenta**, así que el envío del código, el registro, el inicio de sesión, el revelado de la clave y la comprobación salen todos desde la misma dirección y el panel nunca ve un rastro mixto.

- **Con un grupo:** `--pool proxies.txt` (o `ZCTOTOKEN_PROXIES`). Una salida muerta hace fallar ese intento y el siguiente intento toma la siguiente salida.
- **Fail-closed:** un `--pool` explícito que apunta a nada recurre a **directo** con una advertencia impresa — nunca una ejecución mixta silenciosa.
- **Sin un grupo:** la CLI imprime `running WITHOUT a proxy (direct)` y funciona igual.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada en vivo por línea — ignorada por git |
| `accounts.jsonl` | un registro JSON por cuenta: dirección, nombre de usuario, grupo, cuota, carril de correo, salida, resultado de la comprobación, clave — ignorado por git |
| `proxies.txt` | tus salidas, una por línea — ignorado por git |
| `out/` | registros de ejecución — ignorados por git |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 Conectar con OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

Predeterminados: `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. Los modelos se sirven como `zctotoken/<model id>`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 Qué da el proveedor | ≈ **$2.00** de crédito de registro por cuenta (`999,971` de cuota), sin tarjeta |
| 🔑 Qué te da una clave | una clave de 48 caracteres en su propia cuenta, creada en `国内模型` y verificada por chat en `deepseek-v4.1-flash` |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://www.zctotoken.com/v1/chat/completions` (9 ids de modelo) |
| 🔒 Tus datos | solo se contacta con `zctotoken.com`, el backend de correo (`Emailnator`, con fallback a `temp.tf`) y tu propio proxy; las claves permanecen en tu máquina |

## 🐞 Problemas

Si ZCtotoken cambia la forma de su registro, su correo de verificación, las rutas de token o la tabla de grupos, la herramienta se detiene en ese paso y reporta el rechazo textualmente (el estado exacto, el mensaje que devolvió el panel, el grupo que intentó). **[Abre un issue](../../issues)** con el comando y la salida exacta.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>