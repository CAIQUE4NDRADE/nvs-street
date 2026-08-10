# Como adicionar as fotos reais do site

Coloque os arquivos exatamente com esses nomes e pastas — o site detecta
sozinho assim que o arquivo existir (não precisa mudar nada no código).
Enquanto o arquivo não existir, aparece um placeholder elegante no lugar.

## Hero (banner principal)

```
public/images/hero/hero-desktop.webp
```

Foto grande e de impacto (jovem em ambiente urbano). Recomendado: 1920x1080px
ou maior, formato .webp (mais leve). O texto (ATITUDE. ORIGINALIDADE.
REALIDADE.) já é HTML por cima da imagem — não precisa embutir texto na foto.

## Categorias

```
public/images/categorias/camisetas.webp
public/images/categorias/moletons.webp
public/images/categorias/bermudas.webp
public/images/categorias/calcas.webp
public/images/categorias/bones.webp
public/images/categorias/acessorios.webp
```

Uma foto quadrada por categoria (recomendado 600x600px).

## Estilo NVS (lifestyle)

```
public/images/lifestyle/look-01.webp
public/images/lifestyle/look-02.webp
public/images/lifestyle/look-03.webp
public/images/lifestyle/look-04.webp
```

Fotos de modelo em ambiente urbano (proporção retrato, ~3:4).

## Instagram (seção "Siga a NVS")

```
public/images/instagram/post-01.webp
public/images/instagram/post-02.webp
public/images/instagram/post-03.webp
public/images/instagram/post-04.webp
public/images/instagram/post-05.webp
```

5 fotos quadradas (recomendado 400x400px).

## Fotos de produto (Lacoste, Casablanca, Tommy, etc.)

Essas **não** são arquivos fixos — cada produto tem seu próprio campo de
**"URL da foto"** no painel administrativo (aba Produtos → editar produto).
Cole ali o link de onde a foto estiver hospedada (Supabase Storage, seu
próprio site, etc.) e ela aparece automaticamente no card do produto.

> Por que assim, e não uma pasta fixa? Porque produtos são cadastrados e
> removidos o tempo todo pelo painel — um campo de URL por produto é o jeito
> mais flexível de cada peça ter a foto certa, sem precisar mexer em código
> toda vez que um produto novo entrar no catálogo.

## Marcas

A seção "Marcas em destaque" usa tipografia (não logos) por enquanto — ver
explicação completa no `README.md` principal do projeto.
