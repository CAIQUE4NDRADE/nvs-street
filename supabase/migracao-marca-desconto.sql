-- NVS Street — adiciona campos de marca e preço antigo (para desconto)
-- Rode no SQL Editor do projeto nvs-street ANTES de usar o novo visual,
-- senão salvar/editar produto vai dar erro (coluna não existe).
-- Não apaga nem altera nenhum dado existente — só adiciona 2 colunas novas,
-- que ficam vazias (null) nos produtos que já existem até você preencher.

alter table produtos add column if not exists marca text;
alter table produtos add column if not exists preco_antigo numeric;

-- Opcional: exemplo de como popular a marca dos produtos que já existem.
-- Ajuste os nomes/códigos conforme o seu catálogo real antes de rodar.
-- update produtos set marca = 'NVS Select' where marca is null;
