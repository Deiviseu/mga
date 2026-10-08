# MGA Válvulas: site institucional e catálogo

Novo front-end de [www.mga.com.br](https://www.mga.com.br), da MGA – Metalúrgica Golden Art's (Grupo KITZ).
É um site estático em [Astro](https://astro.build) com três idiomas (PT, EN, ES), catálogo filtrável, lista de orçamento, formulários e SEO técnico.

> **Status do conteúdo:** o site atual não estava acessível a partir do ambiente onde este código foi escrito.
> Por isso, os textos institucionais foram reconstruídos a partir do briefing, e o catálogo traz **27 produtos de exemplo**
> (`"seed": true`) no lugar dos 67 originais. Rode `npm run import:content` numa máquina com acesso ao site para trazer os dados reais.
> Veja `TODO-EMPRESA.md`.

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:4321 (rascunhos do blog e marcadores TODO visíveis)
npm run build      # valida o conteúdo, gera redirects e o site estático em dist/
npm run preview    # serve o dist/
npm run check      # checagem de tipos (inclui as traduções de interface)
```

Requer Node 20 ou mais recente.

## Onde editar o quê

Todo o conteúdo editável está em `content/`. O código em `src/` só lê esses arquivos.

| O que | Arquivo |
|---|---|
| Dados da empresa, telefone, e-mail, WhatsApp, números da home | `content/site.json` |
| Unidades (endereço, telefone, mapa) | `content/units.json` |
| Famílias de produto (mega menu, páginas de categoria) | `content/categories.json` |
| **Produtos** (um arquivo por produto) | `content/products/<id>.json` |
| Termos dos filtros (classes, materiais, conexões) | `content/vocab.json` |
| Slides do hero e famílias em destaque | `content/home.json` |
| Linha do tempo | `content/timeline.json` |
| Certificados (selos + PDF) | `content/certificates.json` |
| Downloads | `content/downloads.json` |
| Tabela de aplicações (fluido × material) | `content/applications.json` |
| Sobre, Fundamentos, Meio ambiente, Resp. social, Privacidade, Termos | `content/pages/*.json` |
| Posts do blog (Markdown) | `content/blog/*.md` |
| Redirects 301 das URLs antigas | `content/redirects.json` |
| Textos de interface (menus, botões, formulários) nas 3 línguas | `src/i18n/ui.ts` |
| Slugs de URL por idioma | `src/i18n/routes.ts` |
| Cores, tipografia, espaçamentos | `src/styles/global.css` (tokens em `:root`) |

### Textos traduzíveis

Todo texto de conteúdo é um objeto `{ "pt": "...", "en": "...", "es": "..." }`. O `npm run build` falha se faltar uma das três línguas.
Nos textos de `content/pages/*.json` dá para usar Markdown simples: parágrafos separados por linha em branco, listas com `- `, `**negrito**` e `[links](/caminho)`.

### Adicionar ou editar um produto

1. Copie um arquivo de `content/products/` e renomeie para `<id>.json` (o `id` dentro do arquivo deve ser igual ao nome).
2. Preencha:
   - `category`: id de `categories.json`;
   - `slug`: um por idioma; vira a URL `/produtos/<slug.pt>`, `/en/products/<slug.en>`, `/es/productos/<slug.es>`;
   - `name`, `summary`, `description`: nas 3 línguas. O `<title>` fica "Nome | MGA Válvulas";
   - `attributes`: `pressureClass`, `material`, `connection` com ids de `vocab.json` (alimentam os filtros), e `sizes` (bitolas);
   - `specs`: linhas extras da tabela de dados técnicos;
   - `dimensions`: tabela opcional (colunas + linhas);
   - `images`: `{ "src", "width", "height", "alt": {pt,en,es} }`. `width`, `height` e `alt` são obrigatórios;
   - `datasheet`, `manual`: URL do PDF ou `null` (aí aparece "Solicitar arquivo");
   - `models3d`: lista por bitola. Cada uma tem `files` com `format` e `url`. Aparece como dropdown na aba "Modelos 3D";
   - `related`: ids de outros produtos;
   - `legacySlugs`: slugs antigos deste produto. Cada um gera um redirect 301 automático.
3. Remova `"seed": true` quando os dados forem oficiais.
4. `npm run validate` confere categorias, termos de filtro, slugs duplicados, traduções e imagens.

### Imagens

Por enquanto as imagens apontam para `https://www.mga.com.br/storage/...` (sem download em massa).
- Sem imagem (`null`), o site mostra um desenho técnico neutro no lugar.
- No deploy (Vercel/Netlify), `OPTIMIZE_REMOTE_IMAGES=1` faz o Astro converter imagens remotas para AVIF/WebP com `srcset`.
- Imagens locais em `src/assets/` são sempre otimizadas.

### Cores da marca

As cores estão em `src/styles/global.css`, nos tokens `--brand-primary`, `--brand-primary-strong` e `--brand-primary-soft`.
**Os valores atuais são provisórios.** Com acesso ao site antigo, rode `npm run palette` para listar as cores do CSS e da logo, e troque esses três valores. Todo o resto deriva deles ou é neutro.

## Funcionalidades

- **i18n**: PT na raiz, `/en` e `/es` com slugs traduzidos. O seletor de idioma leva à página equivalente.
- **Header** fixo que encolhe ao rolar. Mega menu de produtos por família, acessível por teclado (Enter/Esc). Menu mobile em painel.
- **Hero** com carrossel (Embla): autoplay que pausa no hover e no foco, botão pausar/retomar, swipe, indicadores e setas. Respeita `prefers-reduced-motion`.
- **Catálogo**: busca instantânea (nome, código, classe, norma) e filtros combináveis (família, classe, material, conexão). A URL reflete o estado (`?q=&fam=&cls=&mat=&con=&view=list`). Alterna entre grade e lista.
- **Produto**: galeria com zoom (lightbox), tabela de especificações em HTML, abas acessíveis (Dados técnicos | Manual | Modelos 3D), modelos 3D por bitola, produtos relacionados e barra fixa "Adicionar à lista de orçamento".
- **Lista de orçamento** em `localStorage`: produto + bitola + quantidade, editável, enviada em um único formulário.
- **Formulários** (contato, orçamento, denúncia): validação com mensagens claras e honeypot anti-spam. Enviam JSON via `POST` para `PUBLIC_FORM_ENDPOINT` (Formspree, webhook do Make/Zapier, API de CRM etc.). Sem endpoint, funcionam em modo demonstração.
- **Canal de Denúncia** em página própria, com envio anônimo e protocolo. Endpoint separado opcional: `PUBLIC_WHISTLEBLOWER_ENDPOINT`.
- **WhatsApp flutuante**: aparece quando `site.json → whatsapp.number` tiver um número válido.
- **Cookies (LGPD)**: Aceitar / Recusar / Personalizar. Google Analytics (`PUBLIC_GA_ID`) e Meta Pixel (`PUBLIC_FB_PIXEL_ID`) só carregam após o consentimento. Link "Preferências de cookies" no rodapé.
- **Números animados**, **linha do tempo** com arraste horizontal (lista vertical no mobile), **tabela de aplicações** com autocomplete, **carrossel de certificados**, **unidades** com mapa OpenStreetMap, telefone clicável e rota.
- **SEO**: `<title>` e description únicos, canonical, hreflang, Open Graph/Twitter. JSON-LD de `Organization`, `LocalBusiness` (por unidade), `Product`, `BreadcrumbList` e `TechArticle`. Também `sitemap.xml` com alternates, `robots.txt` e breadcrumbs visíveis.

## Variáveis de ambiente

Veja `.env.example`. Copie para `.env` no desenvolvimento ou configure no painel da Vercel/Netlify.

## Deploy

- **Vercel**: importe o repositório. O `vercel.json` (gerado no build) já define `cleanUrls`, cabeçalhos e redirects 301.
- **Netlify**: o `netlify.toml` está pronto. Os redirects vão em `public/_redirects` (também gerado no build).

Não edite `vercel.json` nem `public/_redirects` à mão: altere `content/redirects.json`.

## Qualidade

Medido no build local (Lighthouse 12, perfil mobile):

| Página | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Home | 99 | 100 | 100 | 100 |
| Catálogo | 95 | 100 | 100 | 100 |
| Produto | 97 | 100 | 100 | 100 |
| Contato | 100 | 100 | 100 | 100 |

Testado em 360, 768, 1280 e 1920 px sem rolagem horizontal. As métricas vão mudar quando as fotos reais entrarem: mantenha `width`/`height` em todas.

## Estrutura

```
content/            conteúdo editável (JSON/Markdown)
src/i18n/           rotas por idioma e textos de interface
src/lib/            leitura do conteúdo, geração de páginas, SEO/JSON-LD
src/views/          uma view por tipo de página
src/components/     header, footer, carrosséis, cards, formulários…
src/scripts/        JS de cliente (lista de orçamento, formulários)
src/pages/          rota única [...path].astro + sitemap, robots, 404
scripts/            validação, redirects, importação do site antigo, paleta
```
