# NVS Street - Site + Painel de Vendas

Projeto React (Vite) com site publico (catalogo com filtros, confirmacao via
WhatsApp) e painel administrativo completo (produtos, clientes, pedidos,
dashboard, financeiro) — mesma estrutura tecnica do Dyna Festas e do Mile
Atelier, com identidade visual propria (streetwear: preto + verde acido).

## 1. Rodar localmente

```bash
npm install
npm run dev
```

Sem configurar o Supabase (passo 2), o site funciona com **dados de exemplo**
apenas na memoria - nao salva nada de verdade.

## 2. Criar o banco de dados (Supabase - projeto novo e proprio)

Use um projeto Supabase **separado** dos outros clientes (Mile Atelier, Dyna
Festas) — mantem cada cliente isolado, facilita transferir titularidade no
futuro se precisar.

1. Crie um projeto em https://supabase.com (conta gratuita).
2. No painel do projeto, va em **SQL Editor > New query**.
3. Copie todo o conteudo de `supabase/schema.sql`, cole e clique em **Run**.
   Isso cria as tabelas `produtos`, `clientes`, `pedidos` e `despesas`, com
   4 produtos de exemplo.
4. Va em **Project Settings > API Keys**. Copie:
   - `Project URL` -> vira `VITE_SUPABASE_URL`
   - `Publishable key` (ou `anon public key`) -> vira `VITE_SUPABASE_ANON_KEY`
5. Copie `.env.example` para `.env` e cole os dois valores:

```bash
cp .env.example .env
```
(no PowerShell: `Copy-Item .env.example .env`)

> IMPORTANTE sobre seguranca: o `schema.sql` deixa as tabelas abertas pra
> leitura/escrita publica (RLS `true`), pra tudo funcionar sem login agora.
> Aceitavel pra validar com o cliente, mas antes de divulgar o link
> publicamente, rode o `supabase/migracao-auth.sql` (passo 4).

## 3. Colocar no ar (Vercel)

```bash
git init
git add .
git commit -m "NVS Street - proposta completa"
git branch -M main
git remote add origin https://github.com/CAIQUE4NDRADE/nvs-street.git
git push -u origin main
```

Depois:

1. Va em https://vercel.com, faca login com o GitHub e clique em
   **Add New > Project**, escolha o repositorio `nvs-street`.
2. O Vercel detecta que e um projeto Vite. Antes de clicar em **Deploy**,
   abra **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (marca as tres caixinhas: Production, Preview e Development)
3. Clique em **Deploy**. Em ~1 minuto voce recebe um link (ex:
   `nvs-street.vercel.app`).

## 4. Travar a Area da loja com login

O botao "Login da loja" pede e-mail e senha (Supabase Auth). Pra ativar:

1. No SQL Editor do Supabase, rode `supabase/migracao-auth.sql`.
2. Va em **Authentication -> Users -> Add user**, preencha e-mail e senha
   da loja e marque **Auto Confirm User**.

Sem isso configurado, o app roda em **modo demonstracao** (dados de
exemplo, nada salvo de verdade).

## Estrutura

```
src/
  App.jsx          # site + painel administrativo
  App.css          # identidade visual (preto + verde acido)
  lib/supabase.js  # cliente do Supabase
  lib/api.js       # funcoes de CRUD (produtos, clientes, pedidos, despesas)
supabase/
  schema.sql          # cria as tabelas no Supabase
  migracao-auth.sql   # trava o banco: exige login para escrever/ler dados sensiveis
```

## Diferencas em relacao ao Dyna Festas / Mile Atelier

Esse e um modelo de **venda de estoque**, nao locacao:
- `produtos` em vez de `vestidos` (sem caucao, com controle de `estoque`)
- `pedidos` em vez de `reservas` (sem data de devolucao, com status
  Pendente -> Pago -> Enviado -> Concluido)
- Estoque desconta automaticamente a cada pedido registrado, e o status do
  produto atualiza sozinho (Disponivel / Baixo estoque / Esgotado)
