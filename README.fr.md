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

**Créez en masse des comptes ZCtotoken avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-9-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

ZCtotoken est un fork de **New API** derrière un CDN chinois. Son inscription est sans captcha (`turnstile_check: false`) et la seule barrière est un code à 6 chiffres envoyé par e-mail à l'adresse — ainsi, tout le compte est automatisable en HTTP simple **sauf** la lecture de cette boîte de réception, ce qui explique pourquoi l'outil communique avec Emailnator et enregistre la forme sans point de l'adresse qu'il obtient.

Le piège sur ce panneau est le **groupe**, pas l'inscription. `/api/pricing` ne sert les identifiants deepseek bon marché qu'à l'intérieur de `国内模型` ; un jeton laissé dans `default` reçoit la réponse `503 No available channel for model deepseek-v4.1-flash under group default`. Le CLI lit la table des groupes et crée le jeton dans le groupe depuis lequel le modèle cible est réellement servi, puis prouve la clé avec une vraie complétion avant de l'écrire dans `keys.txt`.

## 🎁 Offre gratuite — ce que vous obtenez

| Quoi | Valeur |
| --- | --- |
| Crédit d'inscription | **999 971 de quota** mesuré sur un compte neuf (`quota_per_unit: 500000` → ≈ **2,00 $**) |
| Check-in quotidien | **désactivé** (`checkin_enabled: false` ; la route répond `Check-in feature is not enabled`) |
| Carte / téléphone | aucun des deux |
| Unité de facturation | **par compte** — le quota vit sur le compte, c'est pourquoi cet outil crée un compte par clé |
| Barrière e-mail | **requise** — code à 6 chiffres, vérifié avant que le compte n'existe |

Avec N clés, vous détenez N comptes, soit **N × le crédit d'inscription**. L'absence de check-in signifie que le solde ne se recharge pas : quand une clé s'épuise, elle est remplacée en créant un autre compte, ce que fait exactement `--count`.

> 💡 L'offre gratuite est définie par ZCtotoken et peut changer. Consultez les chiffres en direct sur [www.zctotoken.com](https://www.zctotoken.com) — et laissez la barrière de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 9 au complet

`GET /v1/models` (avec une clé) liste **9 identifiants** sur ce panneau :

| ID du modèle | Groupe desservi | Vérifié |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` répondu |
| `deepseek-v4-flash` | `bonus`, `国内模型` | listé |
| `deepseek-v4-flash-vision-exp` | `国内模型` | listé |
| `deepseek-v4-pro` | listé | listé |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | listé | listé |
| `kimi-k3` | listé | listé |
| `MiniMax-M3` | listé | listé |

> ⚠️ `/v1/models` ne répond **qu'à GET** — un POST est refusé avec `Invalid URL (POST /v1/models)`.

## 🧪 Comment utiliser l'API

URL de base **`https://www.zctotoken.com/v1`** — compatible OpenAI.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

Le modèle renvoie son raisonnement dans `reasoning_content` à côté de `content`, donc un client qui ne lit que `content` voit quand même du texte.

## 🛠 Démarrage rapide

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

Aucun navigateur ni solveur de captcha n'est impliqué : l'inscription du panneau est du pur HTTP plus une boîte de réception. Une clé n'est écrite dans `keys.txt` **qu'après** que `/v1/chat/completions` ait répondu 200 avec du contenu réel ; `accounts.jsonl` conserve l'adresse, le groupe dans lequel le jeton a atterri et le résultat de la barrière.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys (facultative — sans elle, le CLI s'exécute en direct), combien de comptes créer et le modèle utilisé pour la barrière en direct, les mémorise dans `launcher.config.json`, et exécute le CLI : **mint**, **verify**, **screen** (tester les sorties contre le panneau), **settings**, **help** et **Connect to 9Router**.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}` ; l'e-mail contenant le code arrive en quelques secondes |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200** avec `access_token` |
| `POST /api/token/` puis `POST /api/token/<id>/key` | la liste renvoie la clé **masquée** (`hdHR**********YTC0`) ; la route de révélation renvoie le texte en clair |
| `PUT /api/token/` avec `group: 国内模型` | **200** — sans cela, le relais répond `503 No available channel … under group default` |
| `POST /v1/chat/completions` | **200** avec du contenu réel (`deepseek-v4.1-flash`) |
| tools | **fonctionne** — une requête `tools` renvoie `tool_calls: [get_time]` |
| `POST /api/user/checkin` | **non activé** sur ce panneau |

> **Barrières de qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combos de routeur suivent la même règle au niveau du modèle : une entrée n'est
> ajoutée **que si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans support des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais cachés.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| boîte mail | Emailnator `POST /api/generate-email` (`ids: [3]`), avec repli sur temp.tf `GET /api/account` | une nouvelle adresse `@gmail.com` (ou un plus-alias Microsoft) enregistrée sous sa forme sans point ; la boîte est capturée **avant** que le code ne soit demandé — une adresse recyclée est pleine de courriers d'autres locataires, donc seuls les ids *et* un horodatage plus récent que cette capture comptent, et le message doit nommer le panneau dans son expéditeur/objet |
| statut | `GET /api/status` | vérification de la barrière avant de dépenser une boîte mail |
| envoi du code | `GET /api/verification?email=…` | le panneau envoie le code à 6 chiffres par e-mail |
| code | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | interroge toutes les 5 s dans une fenêtre de 240 s ; le code n'est lu que depuis le courrier du panneau lui-même (ancré sur `验证码`/`code`) |
| inscription | `POST /api/user/register` | `{username, password, email, verification_code}` |
| connexion | `POST /api/user/login` | `access_token`, puis `New-Api-User: <id>` pour les routes de jeton |
| groupe | `GET /api/pricing` | le groupe dans lequel le modèle cible est servi est lu depuis `enable_groups`, avec `国内模型` comme repli statique |
| clé | `POST /api/token/` → `POST /api/token/<id>/key` | la création renvoie une clé **masquée** sur ce fork ; la route de révélation est le seul moyen d'obtenir le texte en clair |
| barrière | `POST /v1/chat/completions` | 200 avec du contenu réel = la clé est conservée |

Chaque requête d'un compte passe par la **même sortie épinglée** : un fork qui lie le code de vérification en attente côté serveur répond `Verification code is incorrect or has expired` lorsque l'adresse qui a demandé le code n'est pas l'adresse qui s'inscrit.

## ⚙️ Options du CLI

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

| Env | Défaut | Signification |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | pool de sorties, une par ligne (identique à `--pool`) ; absent = direct |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | modèle utilisé pour la barrière en direct |

## 🛰️ Derrière un proxy

**Facultatif — recommandé à grande échelle.** Chaque requête passe par une sortie de votre liste, et une sortie est **épinglée par compte**, de sorte que l'envoi du code, l'inscription, la connexion, la révélation de la clé et la barrière partent tous de la même adresse et que le panneau ne voit jamais une trace mixte.

- **Avec un pool :** `--pool proxies.txt` (ou `ZCTOTOKEN_PROXIES`). Une sortie morte fait échouer cette tentative et l'essai suivant prend la sortie suivante.
- **Fail-closed :** un `--pool` explicite pointant vers rien retombe en **direct** avec un avertissement affiché — jamais une exécution mixte silencieuse.
- **Sans pool :** le CLI affiche `running WITHOUT a proxy (direct)` et fonctionne de la même manière.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé vérifiée en direct par ligne — ignoré par git |
| `accounts.jsonl` | un enregistrement JSON par compte : adresse, nom d'utilisateur, groupe, quota, rail mail, sortie, résultat de la barrière, clé — ignoré par git |
| `proxies.txt` | vos sorties, une par ligne — ignoré par git |
| `out/` | journaux d'exécution — ignorés par git |

## 🔌 Se connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI :

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 Se connecter à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé compatible OpenAI :

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

Valeurs par défaut : `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. Les modèles sont servis sous `zctotoken/<model id>`.

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 Ce que le fournisseur offre | ≈ **2,00 $** de crédit d'inscription par compte (`999 971` de quota), sans carte |
| 🔑 Ce qu'une clé vous apporte | une clé de 48 caractères sur son propre compte, créée dans `国内模型` et vérifiée par chat sur `deepseek-v4.1-flash` |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://www.zctotoken.com/v1/chat/completions` (9 identifiants de modèle) |
| 🔒 Vos données | seuls `zctotoken.com`, le backend mail (`Emailnator`, avec repli sur `temp.tf`) et votre propre proxy sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si ZCtotoken modifie la forme de son inscription, son e-mail de vérification, ses routes de jeton ou sa table de groupes, l'outil s'arrête à cette étape et signale le refus mot pour mot (le statut exact, le message renvoyé par le panneau, le groupe qu'il a essayé). **[Ouvrez un ticket](../../issues)** avec la commande et la sortie exacte.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>