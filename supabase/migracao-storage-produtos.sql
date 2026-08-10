-- NVS Street — cria o espaço de armazenamento (Storage) para fotos de produto
-- Rode no SQL Editor do projeto nvs-street.
-- Isso cria um "bucket" chamado "produtos": público para leitura (qualquer
-- visitante vê as fotos no site) e restrito para envio/exclusão (só a loja
-- logada consegue subir ou apagar fotos).

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

drop policy if exists "Public read produtos bucket" on storage.objects;
create policy "Public read produtos bucket" on storage.objects
  for select using (bucket_id = 'produtos');

drop policy if exists "Authenticated upload produtos bucket" on storage.objects;
create policy "Authenticated upload produtos bucket" on storage.objects
  for insert with check (bucket_id = 'produtos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated update produtos bucket" on storage.objects;
create policy "Authenticated update produtos bucket" on storage.objects
  for update using (bucket_id = 'produtos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete produtos bucket" on storage.objects;
create policy "Authenticated delete produtos bucket" on storage.objects
  for delete using (bucket_id = 'produtos' and auth.role() = 'authenticated');

-- Observação: se você ainda não tiver o login da loja configurado
-- (Authentication -> Users -> Add user), o upload de foto vai exigir login
-- real para funcionar — o modo demonstração não sobe arquivo de verdade.
