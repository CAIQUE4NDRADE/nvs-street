-- NVS Street — adiciona campo de foto do produto
-- Rode no SQL Editor do projeto nvs-street.
-- Não apaga nada — só adiciona 1 coluna nova (fica vazia até você preencher).

alter table produtos add column if not exists imagem_url text;
