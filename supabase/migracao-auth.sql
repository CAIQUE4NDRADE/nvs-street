-- NVS Street — migração de segurança (rode depois do schema.sql)
-- Restringe escrita e dados sensíveis a usuárias autenticadas (login da loja).
-- O catálogo de produtos continua público pra leitura — só a escrita
-- (criar/editar/excluir) passa a exigir login.

-- PRODUTOS: leitura pública continua, escrita só autenticada
drop policy if exists "Public write produtos" on produtos;
create policy "Authenticated write produtos" on produtos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- CLIENTES: dados sensíveis — só autenticada, nunca pública
drop policy if exists "Public read clientes" on clientes;
drop policy if exists "Public write clientes" on clientes;
create policy "Authenticated all clientes" on clientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PEDIDOS: dados sensíveis — só autenticada
drop policy if exists "Public read pedidos" on pedidos;
drop policy if exists "Public write pedidos" on pedidos;
create policy "Authenticated all pedidos" on pedidos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- DESPESAS: financeiro — só autenticada
drop policy if exists "Public read despesas" on despesas;
drop policy if exists "Public write despesas" on despesas;
create policy "Authenticated all despesas" on despesas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
