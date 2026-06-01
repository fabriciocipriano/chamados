# Deploy — Vercel + Neon (PostgreSQL)

## Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com) (entre com o GitHub)
- Conta no [Neon](https://neon.tech) **OU** crie o banco direto pela Vercel (passo 4)

---

## 1. Variáveis de ambiente necessárias

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (gerada pelo Neon) |
| `NEXTAUTH_SECRET` | Chave secreta aleatória — gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL pública da aplicação (ex: `https://chamados.vercel.app`) |

---

## 2. Criar o banco de dados (Neon)

### Opção A — Pela Vercel (mais fácil)
1. Acesse o painel da Vercel → **Storage**
2. Clique em **Create Database**
3. Escolha **Neon (Serverless Postgres)**
4. Dê um nome (ex: `chamados-db`) e clique em **Create**
5. Vá em **Connect** e copie a `DATABASE_URL`

### Opção B — Pelo Neon diretamente
1. Acesse [neon.tech](https://neon.tech) e crie um projeto
2. Copie a connection string em **Dashboard → Connection Details**

---

## 3. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New → Project**
2. Importe o repositório do GitHub
3. Antes de fazer deploy, vá em **Environment Variables** e adicione:

```
DATABASE_URL    = postgresql://...   (do Neon)
NEXTAUTH_SECRET = <resultado do openssl rand -base64 32>
NEXTAUTH_URL    = https://SEU-PROJETO.vercel.app
```

4. Clique em **Deploy**

> O build roda `prisma migrate deploy` automaticamente — as tabelas são criadas no banco.

---

## 4. Popular o banco (seed — apenas uma vez)

Após o deploy, rode localmente apontando para o banco de produção:

```bash
# 1. Edite o .env local substituindo DATABASE_URL pela URL do Neon de produção
# 2. Execute:
npm run db:seed

# 3. Restaure o .env local com o banco local
```

Credenciais criadas pelo seed:

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | `admin@sistema.com` | `admin123` |
| Funcionário | `funcionario@sistema.com` | `func123` |

> **Troque as senhas após o primeiro acesso em produção!**

---

## 5. Atualizar NEXTAUTH_URL

Após o deploy, a Vercel exibe a URL final (ex: `https://chamados-abc.vercel.app`).

1. Vá em **Settings → Environment Variables**
2. Atualize `NEXTAUTH_URL` com a URL correta
3. Clique em **Redeploy**

---

## 6. Deploys futuros (automático)

A partir de agora, cada `git push` na branch `main` dispara um deploy automático na Vercel:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── api/               → Rotas REST (auth, clientes, chamados, tipos, produtos, usuários)
│   ├── dashboard/         → Páginas autenticadas
│   └── login/             → Tela de login
├── components/
│   ├── layout/            → Sidebar, Providers
│   ├── tickets/           → Modal de detalhes
│   └── ui/                → Modal, StatusBadge, ConfirmDialog
└── lib/
    ├── auth.ts            → Configuração NextAuth
    └── prisma.ts          → Cliente Prisma singleton
prisma/
├── schema.prisma          → Modelos do banco
└── seed.ts                → Dados iniciais
```

## Tecnologias

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **Prisma 5** (ORM)
- **PostgreSQL** via Neon
- **NextAuth v5** (autenticação JWT)
- **bcryptjs** (hash de senhas)
- **Lucide React** (ícones)

---

## Comandos úteis (desenvolvimento local)

```bash
# Subir o banco local (Docker)
docker compose up -d

# Criar/atualizar tabelas
npm run db:migrate

# Popular dados iniciais
npm run db:seed

# Visualizar banco
npm run db:studio

# Servidor de desenvolvimento
npm run dev
```
