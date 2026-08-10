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

## Atualização de visual (marca + preço com desconto)

O redesign visual (bandeira de marcas, cards com desconto, parcelamento)
adicionou 2 campos novos em `produtos`: `marca` e `preco_antigo`. Se seu
banco já existia antes dessa atualização, rode uma vez no SQL Editor:

```
supabase/migracao-marca-desconto.sql
```

Sem rodar isso, criar ou editar produto no painel admin vai dar erro
("coluna não existe"). O site público continua funcionando normalmente
mesmo sem rodar — só os dois campos novos ficam ocultos.

Depois de rodar a migração, edite cada produto no painel (Vestidos/Produtos)
e preencha a Marca (ex: Lacoste, Casablanca) e, se houver promoção, o
Preço antigo — o desconto e o "Xx de R$..." aparecem sozinhos no card.

## Sistema de imagens (fotos reais + placeholders elegantes)

Foi criado um componente único `<PhotoSlot>` (dentro de `src/App.jsx`) usado
em todas as seções com imagem: Hero, Categorias, Produtos, Estilo NVS
(lifestyle), Instagram e carrinho. Ele mostra a foto real quando o arquivo/
URL existe, e cai automaticamente num placeholder elegante e discreto quando
não existe — sem quebrar o layout, sem imagem "quebrada".

### Onde colocar cada foto

Veja o guia completo em `public/images/COMO-ADICIONAR-FOTOS.md`. Resumo:

- **Hero:** `public/images/hero/hero-desktop.webp`
- **Categorias:** `public/images/categorias/{camisetas,moletons,bermudas,calcas,bones,acessorios}.webp`
- **Estilo NVS (lifestyle):** `public/images/lifestyle/look-01.webp` a `look-04.webp`
- **Instagram:** `public/images/instagram/post-01.webp` a `post-05.webp`
- **Produtos:** não é arquivo fixo — cada produto tem um campo **"URL da foto
  do produto"** no painel admin (Produtos → editar). Cole o link e a foto
  aparece sozinha no card.

### Sobre as marcas (Lacoste, Nike, Casablanca, Tommy, Boss...)

Os logos oficiais dessas marcas são propriedade registrada — não recriei
nem gerei versões deles. A seção "Marcas em destaque" usa **tipografia**
(nome da marca, com um estilo visual distinto por marca) em vez de logo.
Se você tiver os arquivos oficiais de logo (obtidos com autorização/kit de
imprensa da marca), me avise que eu troco a tipografia pelas imagens.

### O que ficou como placeholder (por não ter foto/produto real ainda)

Tudo: hero, categorias, lifestyle e Instagram, porque ainda não existem os
arquivos de foto. Os produtos individuais também ficam em placeholder até
você preencher a URL da foto de cada um no painel. Nenhum produto, preço ou
informação de estoque foi inventado — os placeholders só ocupam o espaço
visual até a foto real chegar.

## Arquivos alterados/criados nesta atualização

| Arquivo | O que mudou |
|---|---|
| `src/App.jsx` | Componente `PhotoSlot`; Hero, Marcas em destaque, Categorias, Produtos, Estilo NVS, Instagram e faixa WhatsApp redesenhados; campo de foto no formulário de produto |
| `src/App.css` | Estilos novos: `nv-photoslot` (placeholder claro/escuro), `nv-brands-strip`, `nv-card-v2` (card de produto claro/premium), `nv-lifestyle`, `nv-insta`, `nv-whatsapp-banner` |
| `src/lib/api.js` | Campo `imagemUrl` adicionado ao produto |
| `supabase/migracao-imagem-produto.sql` | **Novo** — adiciona a coluna `imagem_url` (não apaga nada) |
| `public/images/COMO-ADICIONAR-FOTOS.md` | **Novo** — guia de onde colocar cada foto |
| `public/images/{hero,categorias,lifestyle,instagram,marcas}/` | **Novas pastas**, prontas para receber os arquivos |

**Carrinho, checkout, login e banco de dados existentes não foram tocados** —
só a apresentação visual, mais os 2 campos novos (marca, preço antigo — já
existentes da atualização anterior) e agora `imagem_url`.

## Upload de foto direto do computador (Supabase Storage)

Agora, ao criar ou editar um produto no painel admin, tem um botão
**"Escolher arquivo do computador"** — sem precisar colar link de foto.

Antes de usar pela primeira vez, rode uma vez no SQL Editor do Supabase:

```
supabase/migracao-storage-produtos.sql
```

Isso cria o espaço de armazenamento ("bucket") chamado `produtos`, público
para leitura (o site mostra a foto pra qualquer visitante) e restrito para
envio/exclusão (só a loja logada consegue subir foto nova).

Sem rodar essa migração, o botão de upload mostra um aviso pedindo pra
configurar o Storage primeiro. O campo de URL manual continua funcionando
como alternativa, se você já tiver a foto hospedada em outro lugar.
