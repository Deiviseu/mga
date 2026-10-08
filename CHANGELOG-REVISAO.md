# Changelog da revisão: bugs corrigidos e textos alterados

Registro de cada correção feita na reconstrução do site da MGA.

> **Limite desta revisão:** o site atual (`www.mga.com.br`) estava bloqueado pela política de rede do ambiente de desenvolvimento,
> então não foi possível baixar e revisar o texto original na íntegra. As correções abaixo cobrem:
> (a) todos os problemas apontados no briefing e (b) os textos reconstruídos para o novo site.
> Os itens que ainda dependem do texto original estão em `TODO-EMPRESA.md` (ver "Revisão geral pendente").

## 1. Bugs técnicos

| # | Problema no site atual | Correção no novo site | Onde |
|---|---|---|---|
| T1 | Chaves de tradução vazando no rodapé: `texts.matrizes`, `texts.pecas-em-ptfe`, `texts.vf-visor-de-fluxo`, `texts.privacy-policy`, `texts.terms-of-use` | Todos os textos de interface ficam em `src/i18n/ui.ts`, tipado: faltar uma chave em EN ou ES é erro em `npm run check`. Textos de conteúdo sem tradução quebram o `npm run build` (`scripts/validate-content.mjs`). O rodapé mostra "Matrizes", "Peças em PTFE (Sulflon)", "Visores de fluxo", "Política de Privacidade (LGPD)" e "Termos de uso" nas 3 línguas. | `src/i18n/ui.ts`, `src/components/Footer.astro` |
| T2 | Imagem da página Sobre servida de host de desenvolvimento: `http://webapp129708.ip-69-164-202-77.cloudezapp.io/assets/site/empresa.jpg` | `https://www.mga.com.br/assets/site/empresa.jpg` (https, domínio próprio). O validador bloqueia `cloudezapp.io`, IPs de dev e URLs `http://`. | `content/pages/sobre.json`, `scripts/validate-content.mjs` |
| T3 | Link relativo quebrado nas páginas de produto: `/produtos/politicas-mga.pdf` | Caminho absoluto `/politicas-mga.pdf` e redirect 301 da URL quebrada. O download só aparece quando o PDF estiver em `public/` (até lá: "Sob solicitação"). | `content/downloads.json`, `content/redirects.json` |
| T4 | Contato com `tel:` e `mailto:` vazios | Telefones em `units.json`/`site.json` no formato `+55...` (validado). Unidade sem telefone mostra "Telefone em atualização" em vez de link vazio. | `content/units.json`, `src/components/UnitCard.astro` |
| T5 | Itens de menu com `href="#"` | Toda categoria tem página própria (`/produtos/categoria/<slug>`). "Produtos" e "Empresa" são links reais; o submenu abre por um botão separado. | `src/components/Header.astro`, `src/lib/pages.ts` |
| T6 | Slugs em espanhol/inglês em URLs PT (`clase-1500-flotante`, `visores-de-flujo`, `cryogenics`, `informacion-ambiental`, `boletin-ambiental`) | Slugs por idioma em `routes.ts` e nos produtos e categorias. Redirects 301: `/produtos/clase-1500-flotante` → `/produtos/valvula-esfera-bipartida-classe-1500-flutuante`; `/produtos/visores-de-flujo` → `/produtos/categoria/visores-de-fluxo`; `/produtos/cryogenics` → `/produtos/categoria/valvulas-criogenicas`; `informacion-ambiental` e `boletin-ambiental` → Downloads › Institucional ("Informação ambiental", "Boletim ambiental"). `/timeline` → `/linha-do-tempo`. | `src/i18n/routes.ts`, `content/redirects.json`, `public/_redirects`, `vercel.json` |
| T7 | Tabela de aplicações com fluidos duplicados (Amônio, Cloro gás, Formaldeído, Freon, Mercúrio, Hidróxido de sódio 20% e 50%) | Uma entrada por fluido. O validador rejeita nomes duplicados. | `content/applications.json` |
| T8 | Nomes cortados por vírgula: "Água clorada (0…", "Tricloroetano 1…" | "Água clorada" (concentração a confirmar) e "Tricloroetano 1,1,1". Nomes ficam em JSON, sem CSV: vírgulas não cortam mais o texto. O validador detecta parênteses abertos e reticências finais. | `content/applications.json` |
| T9 | Select com ~250 fluidos | Campo com autocomplete (combobox ARIA), tabela material × recomendação com cores **e** letras (A/B/C/–) e legenda. | `src/views/Applications.astro` |
| T10 | Canal de denúncia misturado ao contato, com nome/e-mail obrigatórios | Página própria `/canal-de-denuncia`, com envio anônimo (nome e e-mail ocultos e não enviados) e número de protocolo. | `src/views/Whistleblower.astro` |
| T11 | Formulário de contato pedia endereço completo | Campo removido. Entraram Produto / Bitola / Quantidade (linhas repetíveis, preenchidas pela lista de orçamento ou por `?produto=`), com validação e mensagens de erro claras. | `src/components/ContactForm.astro` |
| T12 | Referência a "Termos de GDPR" | "Política de Privacidade (LGPD)" em página própria, com redirect das URLs antigas prováveis. | `content/pages/privacidade.json` |
| T13 | Pixel do Facebook e analytics carregando sem consentimento | Banner LGPD com Aceitar / Recusar / Personalizar. Os scripts só são injetados após o consentimento da categoria. | `src/components/CookieConsent.astro` |
| T14 | Texto "Sobre" repetido no rodapé de todas as páginas | Resumo de 1 linha: "Válvulas industriais desde 1991 em Veranópolis/RS. Empresa do Grupo KITZ." | `src/components/Footer.astro` |
| T15 | Downloads sem categoria e relatórios de transparência duplicados | Categorias Catálogos, Técnico, Institucional, LGPD/Compliance e CustomCast, com busca, tipo e tamanho. Os relatórios de transparência salarial viraram um item com versões por semestre. | `content/downloads.json`, `src/views/Downloads.astro` |

## 2. Dados

| # | Antes | Depois | Onde |
|---|---|---|---|
| D1 | Filial São Paulo com estado "AC" | `SP` | `content/units.json` |
| D2 | Unidade Microfundidas/Usinagem com estado "AC" | `RS`. Separadas em duas unidades: "Peças Microfundidas" e "Usinagem" (Rua Quatro, 580) | `content/units.json` |
| D3 | Unidade Peças Microfundidas sem telefone | `"phone": "TODO"`. O site exibe "Telefone em atualização" (ver TODO-EMPRESA) | `content/units.json` |
| D4 | Alt da bandeira da Espanha = "Inglês" | "Bandeira da Espanha" / "Flag of Spain" / "Bandera de España" | `src/i18n/ui.ts` (`flag.es`) |
| D5 | Alt da bandeira do Brasil = "Portugês" | "Bandeira do Brasil" / "Flag of Brazil" / "Bandera de Brasil" | `src/i18n/ui.ts` (`flag.pt`) |

## 3. Textos (antes → depois)

### Home
- "Metalúriga" → **"Metalúrgica"**
- Variações de grafia/apóstrofo de "Golden Art's" → **"Golden Art's"** (apóstrofo reto, igual em todo o site e no `legalName`)

### Aplicações
- "aplicacções" → **"aplicações"**
- "fluído" → **"fluido"** (substantivo, sem acento, em todo o site)

### Linha do tempo
- "dano início" → **"dando início"** (marco de 1991)
- "domíno" → **"domínio"** ("Domínio da microfusão")
- "Consquista" → **"Conquista"** ("Conquista do Prêmio KITZ de Meio Ambiente")
- "Trófeu" → **"Troféu"** ("Troféu Expressão de Ecologia")
- "INAGURAÇÃO" → **"Inauguração"** (sem caixa alta forçada; "Inauguração da nova planta")
- Marco de 1991: o título "Primeira válvula atuada" não batia com o texto (fundação). O título passou a "Fundação da Metalúrgica Golden Art's" e o marco ficou com `todo` para confirmação.
- Eventos do mesmo ano agrupados em um único marco (ex.: 2026 = 35 anos + Troféu Expressão de Ecologia).
- Entraram marcadores `TODO` para 2021 e 2026 (35 anos). Ficam visíveis no `npm run dev` e ocultos no build de produção.

### Meio ambiente
- "fabrição" → **"fabricação"**
- "pelo redução" → **"pela redução"**
- "levantando em conta" → **"levando em conta"**
- Reconhecimentos alinhados com a linha do tempo: **Prêmio KITZ de Meio Ambiente (2022–2026)** e **Prêmio Expressão de Ecologia 2026**

### Responsabilidade social
- "um árvore" → **"uma árvore"**
- "nosso colaboradores" → **"nossos colaboradores"**
- Título "NÃO DE TAMPAS À SOLIDARIEDADE" → **"Das tampinhas à solidariedade"** ("NÃO" era erro de digitação de "DE"; caixa alta removida)

### Fundamentos
- Missão reescrita com gramática correta, sem mudar o sentido. Agora: "Fabricar e comercializar válvulas industriais e componentes com qualidade e segurança, **satisfazendo clientes e funcionários de forma lucrativa** e contribuindo para o desenvolvimento da comunidade."
- "subseqüentes" → **"subsequentes"** (sem trema, Acordo Ortográfico de 1990)
- Escopo em inglês: "Micromelted Castings" → **"Investment Castings"**

### Contato e rodapé
- "Termos de GDPR" → **"Política de Privacidade (LGPD)"**
- Rodapé: o bloco "Sobre" repetido virou um resumo de 1 linha (ver T14)

### Padronizações gerais aplicadas nos textos novos
- Caixa alta só em rótulos técnicos pequenos ("VET 300 · CLASSE 300 · ASME B16.34"), nunca em títulos ou frases.
- Unidades e números: "°C" com espaço (`−196 °C`), "m²", milhar com ponto em PT/ES (6.189) e vírgula em EN (6,189).
- Classes de pressão sempre "Classe 150/300/600/800/1500" (EN "Class", ES "Clase").
- Bitolas em polegadas no formato `1/2"`, `1.1/2"`.
- "Grupo KITZ" (KITZ em caixa alta, como a marca).

## 4. SEO

- `<title>` único por página no padrão "Página | MGA Válvulas" (EN: "MGA Valves"). Produtos: "Válvula Esfera Tripartida Classe 300 | MGA Válvulas".
- `meta description` única por página (produtos: nome + código + resumo, até 158 caracteres).
- **Removidos** `meta keywords`, `revisit-after`, `distribution`, `rating` e afins (não são gerados em nenhuma página).
- JSON-LD: `Organization` (com `parentOrganization` KITZ), `LocalBusiness` por unidade, `Product` por produto, `BreadcrumbList` e `TechArticle` nos posts.
- `sitemap.xml` com `xhtml:link` hreflang PT/EN/ES + `x-default`. Também `robots.txt` e `<link rel="canonical">` em todas as páginas.
- Open Graph e Twitter Card com imagem por página (produto: 1ª foto; padrão: foto da fábrica).
- Breadcrumbs visíveis em todas as páginas internas.
- Imagens com `width`/`height`, `loading="lazy"` (exceto o primeiro slide) e `alt` descritivo. Conversão AVIF/WebP no deploy (`OPTIMIZE_REMOTE_IMAGES=1`).
- Blog técnico com categorias "Técnico" e "Meio ambiente" e 2 posts de exemplo como rascunho: "Bipartida x tripartida: qual válvula esfera escolher" e "Como escolher a classe de pressão de uma válvula".
