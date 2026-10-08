# O que a MGA precisa confirmar ou enviar

Itens que dependem de informação da empresa. No código e no conteúdo, cada um está marcado com `TODO`.
`npm run validate` mostra a contagem atual.

## Prioridade alta (bloqueiam a publicação)

- [ ] **Importar o conteúdo real do site atual.** O ambiente onde o site foi construído não tinha acesso a `www.mga.com.br`.
      Numa máquina com internet, rode `npm run import:content`. O material bruto vai para `content/_import/`. Depois:
  - substituir os **27 produtos de exemplo** (`"seed": true`) pelos **67 produtos oficiais** em `content/products/`;
  - para cada slug listado em `content/_import/unmapped-slugs.txt`, criar o produto ou adicionar o slug em `legacySlugs` (gera o redirect 301);
  - conferir os textos de Sobre, Fundamentos, Meio ambiente e Responsabilidade social, que foram **reconstruídos** a partir do briefing.
- [ ] **Cores da marca**: rodar `npm run palette` e trocar os 3 valores `--brand-*` em `src/styles/global.css`. O azul atual é provisório.
- [ ] **Logo oficial em SVG**: salvar em `public/brand/logo-mga.svg` e trocar `src/components/Logo.astro` (hoje é uma marca tipográfica provisória). Atualizar `public/favicon.svg`.
- [ ] **Tabela de aplicações oficial**: `content/applications.json` está com `"sample": true` e exibe aviso de "tabela de exemplo". Os dados de compatibilidade vieram de referência geral e **não podem ser usados para especificação**. Substituir pela tabela da engenharia MGA (≈250 fluidos), sem duplicatas.
- [ ] **Endpoint dos formulários**: definir `PUBLIC_FORM_ENDPOINT` (e-mail via Formspree/webhook ou CRM) e, de preferência, um canal separado `PUBLIC_WHISTLEBLOWER_ENDPOINT` para denúncias. Sem eles, os formulários ficam em modo demonstração.
- [ ] **Revisão jurídica** da Política de Privacidade (LGPD) e dos Termos de uso (`content/pages/privacidade.json`, `termos.json`), incluindo **e-mail do encarregado (DPO)**.

## Contatos e unidades (`content/units.json`, `content/site.json`)

- [ ] **Telefone da unidade Peças Microfundidas** (está sem telefone no site atual).
- [ ] **Endereço da unidade Peças Microfundidas**: confirmar se é separado da Usinagem (Rua Quatro, 580).
- [ ] **Filial São Paulo**: endereço completo, CEP e telefone (o estado foi corrigido de "AC" para SP).
- [ ] **Filial Ceará**: cidade, endereço, CEP e telefone.
- [ ] **Coordenadas exatas** de cada unidade para o mapa. As atuais são aproximadas (`"approx": true`) e por isso não entram no JSON-LD.
- [ ] **Número de WhatsApp** comercial (`site.json → whatsapp.number`, só dígitos, ex.: `5554999999999`). O botão flutuante só aparece depois disso.
- [ ] **E-mail comercial principal**: confirmar `vendas@mga.com.br`.
- [ ] Links de **LinkedIn, YouTube e Facebook** (ou remover).
- [ ] Confirmar o telefone da matriz **(54) 3441-8900**. Diretórios de terceiros também listam (54) 3441-2301 e 0800 774 1818.

## Linha do tempo (`content/timeline.json`)

- [ ] **Marco de 1991**: o título antigo era "Primeira válvula atuada", mas o texto falava da fundação. Qual é o fato correto?
- [ ] **Marco de 2021**: texto e foto.
- [ ] **Marco de 2026 (35 anos)**: texto comemorativo e foto.
- [ ] Confirmar o **ano de início da microfusão própria** (2000 está estimado).
- [ ] Confirmar o **ano de inauguração da nova planta** de 6.189 m² (2024 está estimado).
- [ ] Demais marcos do site atual que não puderam ser importados.
- [ ] **Foto para cada marco.**

## Produtos e catálogo

- [ ] **Nomes oficiais das famílias** VED, VEM e VB (usados: "Esfera 3 vias", "Esfera monobloco", "Borboleta").
- [ ] Datasheets, manuais e **modelos 3D por bitola** (STEP/IGES/PDF 2D) com URLs `https://www.mga.com.br/storage/...`. Sem URL, o site mostra "Solicitar arquivo".
- [ ] **Fotos de produto** (fundo neutro, mesmo ângulo, mínimo 1200 × 900 px) e uma imagem por família para o mega menu e a home.
- [ ] Tabelas de dimensões reais (a da VET 300 é ilustrativa e está sinalizada como tal).

## Certificados (`content/certificates.json`)

- [ ] Lista definitiva de certificações (o site cita "+7"). As que estão marcadas "Confirmar se a MGA possui" foram **suposições** para montar o layout: API 6D, API 607, PED, INMETRO, TA-Luft/ISO 15848.
- [ ] PDF e logotipo de cada certificado, e órgão emissor.

## Downloads (`content/downloads.json`)

- [ ] URLs de todos os arquivos. Depois, `npm run import:content -- --sizes` preenche o tamanho.
- [ ] Copiar `politicas-mga.pdf` para `public/` e trocar `url` por `/politicas-mga.pdf`.
- [ ] Relatórios de transparência salarial: confirmar quais semestres publicar e as URLs.
- [ ] Confirmar se "Informação ambiental" e "Boletim ambiental" eram páginas ou arquivos, e o caminho antigo exato, para ajustar o redirect 301 (marcados `"confirm": true` em `content/redirects.json`).

## Fotos novas (hero e institucional)

- [ ] 5 fotos em tela cheia (mín. 2400 × 1350 px) para o hero: válvulas criogênicas, microfusão, peças Sulflon/PTFE, impressão 3D/CustomCast e fábrica/equipe (35 anos). Sem foto, cada slide usa um fundo técnico neutro.
- [ ] Fotos das unidades e da equipe para Sobre, Meio ambiente e Responsabilidade social.

## Responsabilidade social e meio ambiente

- [ ] Confirmar as ações descritas ("Das tampinhas à solidariedade" e "Um colaborador, uma árvore"). Os textos foram reconstruídos a partir de trechos do site atual.
- [ ] Confirmar os nomes exatos dos prêmios: "Prêmio KITZ de Meio Ambiente (2022–2026)" e "Prêmio Expressão de Ecologia 2026".

## Blog

- [ ] Revisão técnica dos 2 rascunhos em `content/blog/` e troca de `draft: true` para `false` para publicar.

## Revisão geral pendente

O briefing pede uma revisão ortográfica de **todos** os textos. Fiz as correções listadas no briefing e revisei todos os textos novos (ver `CHANGELOG-REVISAO.md`).
Os textos originais que vierem do `npm run import:content` (descrições de produto, blog antigo, demais marcos) ainda precisam passar pela mesma revisão antes da publicação.
