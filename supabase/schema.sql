-- NVS Street — schema inicial
-- Rode este script inteiro no SQL Editor de um projeto Supabase NOVO
-- (não reaproveite o projeto do Dyna Festas — mantenha cada cliente isolado).

create table if not exists produtos (
  id bigint generated always as identity primary key,
  codigo text,
  nome text not null,
  categoria text not null,
  cor text,
  tamanho text,
  preco numeric default 0,
  custo numeric,
  estoque integer default 0,
  status text default 'Disponível',
  fornecedor text,
  observacoes text,
  created_at timestamp with time zone default now()
);

create table if not exists clientes (
  id bigint generated always as identity primary key,
  nome text not null,
  telefone text,
  whatsapp text,
  instagram text,
  email text,
  endereco text,
  observacoes text,
  created_at timestamp with time zone default now()
);

create table if not exists pedidos (
  id bigint generated always as identity primary key,
  cliente_id bigint references clientes(id) on delete set null,
  produto_id bigint references produtos(id) on delete set null,
  quantidade integer default 1,
  data_pedido date not null,
  valor numeric default 0,
  status text default 'Pendente',
  created_at timestamp with time zone default now()
);

create table if not exists despesas (
  id bigint generated always as identity primary key,
  descricao text not null,
  categoria text,
  valor numeric default 0,
  data date,
  created_at timestamp with time zone default now()
);

-- Protótipo: leitura e escrita públicas em todas as tabelas, pra tudo
-- funcionar sem login agora. Rode migracao-auth.sql antes de divulgar o
-- link publicamente (veja README.md).
alter table produtos enable row level security;
alter table clientes enable row level security;
alter table pedidos enable row level security;
alter table despesas enable row level security;

create policy "Public read produtos" on produtos for select using (true);
create policy "Public write produtos" on produtos for all using (true) with check (true);

create policy "Public read clientes" on clientes for select using (true);
create policy "Public write clientes" on clientes for all using (true) with check (true);

create policy "Public read pedidos" on pedidos for select using (true);
create policy "Public write pedidos" on pedidos for all using (true) with check (true);

create policy "Public read despesas" on despesas for select using (true);
create policy "Public write despesas" on despesas for all using (true) with check (true);

-- Produtos de exemplo pra já ver o catálogo funcionando
insert into produtos (codigo, nome, categoria, cor, tamanho, preco, estoque, status)
values
  ('NVS001', 'Camiseta Oversized Logo', 'Camisetas', 'Preto', 'M', 89, 12, 'Disponível'),
  ('NVS002', 'Moletom Canguru Est.', 'Moletons', 'Cinza', 'G', 179, 5, 'Disponível'),
  ('NVS003', 'Jaqueta Corta-Vento', 'Jaquetas', 'Verde Militar', 'M', 249, 0, 'Esgotado'),
  ('NVS004', 'Boné Aba Reta NVS', 'Bonés', 'Preto', 'Único', 69, 20, 'Disponível');
