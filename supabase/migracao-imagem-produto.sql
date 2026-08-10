-- NVS Street — adiciona segunda foto do produto (frente/costas)
-- Rode no SQL Editor do projeto nvs-street.
-- Não apaga nada — só adiciona 1 coluna nova.

alter table produtos add column if not exists imagem_url_2 text;
