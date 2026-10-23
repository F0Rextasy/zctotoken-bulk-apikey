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

**Crie contas ZCtotoken em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-9%20served-412991?style=for-the-badge)](https://www.zctotoken.com/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-9-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isso existe

ZCtotoken é um fork do **New API** atrás de um CDN chinês. Seu cadastro não tem captcha (`turnstile_check: false`) e a única barreira é um código de 6 dígitos enviado ao endereço — então toda a conta é automatizável via HTTP simples, **exceto** pela leitura dessa caixa de entrada, que é por isso que a ferramenta conversa com o Emailnator e registra a forma sem pontos do endereço que recebe.

A armadilha neste painel é o **grupo**, não o cadastro. `/api/pricing` serve os ids baratos do deepseek apenas dentro de `国内模型`; um token deixado em `default` recebe a resposta `503 No available channel for model deepseek-v4.1-flash under group default`. A CLI lê a tabela de grupos e cria o token no grupo em que o modelo alvo é realmente servido, depois comprova a chave com uma conclusão real antes de gravá-la em `keys.txt`.

## 🎁 Nível gratuito — quanto você recebe

| O quê | Valor |
| --- | --- |
| Crédito de cadastro | **999.971 de cota** medidos em uma conta nova (`quota_per_unit: 500000` → ≈ **$2,00**) |
| Check-in diário | **desativado** (`checkin_enabled: false`; a rota responde `Check-in feature is not enabled`) |
| Cartão / telefone | nenhum dos dois |
| Unidade de cobrança | **por conta** — a cota fica na conta, e é por isso que esta ferramenta cria uma conta por chave |
| Barreira de e-mail | **obrigatória** — código de 6 dígitos, verificado antes de a conta existir |

Com N chaves você tem N contas, ou seja, **N × o crédito de cadastro**. Sem check-in, o saldo não é recarregado: quando uma chave se esgota, ela é substituída criando outra conta, que é exatamente o que `--count` faz.

> 💡 O nível gratuito é definido pela ZCtotoken e pode mudar. Confira os números ao vivo em [www.zctotoken.com](https://www.zctotoken.com) — e deixe a própria verificação da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 9

`GET /v1/models` (com uma chave) lista **9 ids** neste painel:

| ID do modelo | Grupo em que é servido | Verificado |
| --- | --- | --- |
| `deepseek-v4.1-flash` | `国内模型` | **chat-200**, `tool_calls` respondido |
| `deepseek-v4-flash` | `bonus`, `国内模型` | listado |
| `deepseek-v4-flash-vision-exp` | `国内模型` | listado |
| `deepseek-v4-pro` | listado | listado |
| `glm-5.2` · `glm-5.3` · `glm-5.3-flash` | listado | listado |
| `kimi-k3` | listado | listado |
| `MiniMax-M3` | listado | listado |

> ⚠️ `/v1/models` responde **apenas a GET** — um POST é recusado com `Invalid URL (POST /v1/models)`.

## 🧪 Como usar a API

URL base **`https://www.zctotoken.com/v1`** — compatível com OpenAI.

```bash
curl https://www.zctotoken.com/v1/chat/completions \
  -H "Authorization: Bearer <48-char key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":64}'
```

O modelo retorna seu raciocínio em `reasoning_content` ao lado de `content`, então um cliente que lê apenas `content` ainda vê texto.

## 🛠 Início rápido

```bash
cd zctotoken-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — every request then leaves from one of these exits
node src/launcher.js                     # interactive: mint / verify / screen / settings

# or: node src/cli.js --count 10 --pool proxies.txt
```

Nenhum navegador e nenhum solucionador de captcha está envolvido: o cadastro do painel é HTTP puro mais uma caixa de entrada. Uma chave é gravada em `keys.txt` **somente** depois que `/v1/chat/completions` responde 200 com conteúdo real; `accounts.jsonl` guarda o endereço, o grupo em que o token caiu e o resultado da verificação.

### 🖱️ O launcher

O launcher pergunta pela lista de proxies (opcional — sem ela a CLI roda direto), quantas contas criar e o modelo usado para a verificação ao vivo, memoriza tudo em `launcher.config.json` e executa a CLI: **mint**, **verify**, **screen** (testa as saídas contra o painel), **settings**, **help** e **Connect to 9Router**.

## ✅ Verificado e funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `GET /api/status` | **200** — `register_enabled: true`, `email_verification: true`, `turnstile_check: false`, `checkin_enabled: false` |
| `GET /api/verification?email=…` | **200** `{"success":true}`; o e-mail com o código chega em segundos |
| `POST /api/user/register` | **200** `{"success":true}` |
| `POST /api/user/login` | **200** com `access_token` |
| `POST /api/token/` e depois `POST /api/token/<id>/key` | a listagem responde a chave **mascarada** (`hdHR**********YTC0`); a rota de revelação retorna o texto simples |
| `PUT /api/token/` com `group: 国内模型` | **200** — sem isso o relay responde `503 No available channel … under group default` |
| `POST /v1/chat/completions` | **200** com conteúdo real (`deepseek-v4.1-flash`) |
| tools | **funciona** — uma requisição com `tools` retorna `tool_calls: [get_time]` |
| `POST /api/user/checkin` | **não habilitado** neste painel |

> **Verificações de qualidade.** Toda chave aqui passou por um `chat-200` ao vivo antes de ser gravada em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do router seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e conseguir chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são relatadas, nunca ocultadas.

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ZCtotoken page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://www.zctotoken.com/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| caixa de correio | Emailnator `POST /api/generate-email` (`ids: [3]`), com fallback para temp.tf `GET /api/account` | um `@gmail.com` novo (ou um alias plus da Microsoft) registrado em sua forma sem pontos; a caixa é fotografada **antes** de o código ser solicitado — um endereço reciclado está cheio de e-mails de outros inquilinos, então só contam ids *e* um timestamp mais recente que essa fotografia, e a mensagem deve nomear o painel em seu remetente/assunto |
| status | `GET /api/status` | verificação da barreira antes de gastar uma caixa de correio |
| enviar código | `GET /api/verification?email=…` | o painel envia por e-mail o código de 6 dígitos |
| código | Emailnator `POST /api/message-list` → `POST /api/message/<id>` | consulta a cada 5 s dentro de uma janela de 240 s; o código é lido apenas do próprio e-mail do painel (ancorado em `验证码`/`code`) |
| registrar | `POST /api/user/register` | `{username, password, email, verification_code}` |
| login | `POST /api/user/login` | `access_token`, depois `New-Api-User: <id>` para as rotas de token |
| grupo | `GET /api/pricing` | o grupo em que o modelo alvo é servido é lido de `enable_groups`, com `国内模型` como fallback estático |
| chave | `POST /api/token/` → `POST /api/token/<id>/key` | a criação responde uma chave **mascarada** neste fork; a rota de revelação é o único caminho para o texto simples |
| verificação | `POST /v1/chat/completions` | 200 com conteúdo real = a chave é mantida |

Toda requisição de uma conta passa pela **mesma saída fixada**: um fork que vincula o código de verificação pendente no lado do servidor responde `Verification code is incorrect or has expired` quando o endereço que pediu o código não é o endereço que se registra.

## ⚙️ Opções da CLI

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

| Env | Padrão | Significado |
| --- | --- | --- |
| `ZCTOTOKEN_PROXIES` | — | pool de saídas, uma por linha (igual a `--pool`); ausente = direto |
| `ZCTOTOKEN_MODEL` | `deepseek-v4.1-flash` | modelo usado para a verificação ao vivo |

## 🛰️ Atrás de um proxy

**Opcional — recomendado em escala.** Toda requisição passa por uma saída da sua lista, e uma saída é **fixada por conta**, então envio de código, registro, login, revelação da chave e verificação saem todos do mesmo endereço e o painel nunca vê um rastro misturado.

- **Com um pool:** `--pool proxies.txt` (ou `ZCTOTOKEN_PROXIES`). Uma saída morta faz aquela tentativa falhar e a próxima tentativa pega a próxima saída.
- **Fail-closed:** um `--pool` explícito apontando para nada cai para **direto** com um aviso impresso — nunca uma execução mista silenciosa.
- **Sem um pool:** a CLI imprime `running WITHOUT a proxy (direct)` e funciona da mesma forma.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave verificada ao vivo por linha — ignorada pelo git |
| `accounts.jsonl` | um registro JSON por conta: endereço, nome de usuário, grupo, cota, trilho de e-mail, saída, resultado da verificação, chave — ignorado pelo git |
| `proxies.txt` | suas saídas, uma por linha — ignorado pelo git |
| `out/` | logs de execução — ignorados pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um router auto-hospedado e compatível com OpenAI:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456

```

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um router auto-hospedado e compatível com OpenAI:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456

# or the standalone connector shipped next to the CLI:
node src/connect-9router.js --api-key <48-char key>
```

Padrões: `--9router-prefix zctotoken`, `--9router-name ZCtotoken`, `--base-url https://www.zctotoken.com/v1`, `--model deepseek-v4.1-flash`. Os modelos são servidos como `zctotoken/<model id>`.

## 🔑 O que uma chave oferece

| | |
| --- | --- |
| 🏢 Provedor | **ZCtotoken** — [zctotoken.com](https://www.zctotoken.com) |
| 🎁 O que o provedor dá | ≈ **$2,00** de crédito de cadastro por conta (`999.971` de cota), sem cartão |
| 🔑 O que uma chave oferece | uma chave de 48 caracteres em sua própria conta, criada em `国内模型` e verificada por chat em `deepseek-v4.1-flash` |
| 🌐 Formato da API | compatível com OpenAI: `POST https://www.zctotoken.com/v1/chat/completions` (9 ids de modelo) |
| 🔒 Seus dados | apenas `zctotoken.com`, o backend de e-mail (`Emailnator`, com fallback para `temp.tf`) e seu próprio proxy são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Se a ZCtotoken mudar o formato do cadastro, o e-mail de verificação, as rotas de token ou a tabela de grupos, a ferramenta para nessa etapa e relata a recusa literalmente (o status exato, a mensagem que o painel retornou, o grupo que tentou). **[Abra uma issue](../../issues)** com o comando e a saída exata.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 zctotoken-bulk-apikey contributors

</div>