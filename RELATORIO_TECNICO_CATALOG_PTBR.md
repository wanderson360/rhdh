# Relatório técnico completo — análise da experiência do catálogo, tradução e dependências visuais

## Resumo executivo para gestores

A personalização do projeto foi conduzida em duas frentes principais:

1. Tradução e adaptação de textos visíveis para o português brasileiro.
2. Substituição de telas e rotas centrais por versões locais, especialmente no catálogo, na busca, nas configurações, na paginação de APIs e na autenticação.

O padrão identificado foi consistente: a UI principal não foi "corrigida" por patches dispersos; em vez disso, o projeto redefine as telas diretamente no app local e os pontos de entrada de rota. Isso reduz risco, torna a personalização rastreável e facilita manutenção e reutilização em outros projetos.

Os maiores ganhos visuais com menor esforço vieram de:

- [packages/app/src/components/catalog/CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
- [packages/app/src/components/AppBase/AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx)
- [packages/app/src/components/SignInPage/SignInPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/SignInPage/SignInPage.tsx)
- [packages/app/src/components/Root/Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)
- [packages/app/src/components/api-docs/ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx)

A evidência indica que o app local substitui a experiência padrão do Backstage em pontos estratégicos, enquanto elementos vindos de plugins externos e do core continuam em inglês quando não há sobreposição direta.

---

## 1) Identificação dos componentes que renderizam a experiência do catálogo

### 1.1 Processo de descoberta

A sequência lógica de investigação foi:

1. Entrar no ponto de rotas principal em [packages/app/src/components/AppBase/AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx).
2. Verificar qual componente era renderizado em `/catalog` e `/api-docs`.
3. Seguir para os arquivos de páginas customizadas:
   - [packages/app/src/components/catalog/CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
   - [packages/app/src/components/api-docs/ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx)
4. Investigar a navegação global em [packages/app/src/components/Root/Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx).
5. Verificar se os rótulos do catálogo/abas vêm de tabs e de filtros do Backstage em [packages/app/src/components/catalog/EntityPage/defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx).
6. Confirmar se a busca e filtros também estão traduzidos em [packages/app/src/components/search/SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx).
7. Validar que as páginas de configuração e autenticação também estão sobrepostas em [packages/app/src/components/UserSettings/SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) e [packages/app/src/components/SignInPage/SignInPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/SignInPage/SignInPage.tsx).

### 1.2 Componentes principais

| Componente | Como chegou neste arquivo | Evidência de responsabilidade | Arquivos investigados antes | Hipóteses descartadas | Como confirmou na UI |
|---|---|---|---|---|---|
| [packages/app/src/components/catalog/CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx) | A rota `/catalog` aponta para este arquivo em [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx) | O componente renderiza `PageWithHeader title="Catálogo"`, `TextField label="Pesquisar"`, colunas como `Nome`, `Sistema`, `Responsável` | [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx), [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx) | Hipótese: os textos vinham de camada global de i18n; descartada porque os labels estão escritos diretamente no JSX do componente. | O próprio componente monta a tela do catálogo com `CatalogFilterLayout`, filters e `CatalogTable`; todos os textos são renderizados nesse arquivo. |
| [packages/app/src/components/catalog/EntityPage/defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx) | O catálogo de entidade usa `entityPage(entityTabOverrides)` em [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx) | As abas têm títulos em PT-BR: `Visão geral`, `Topologia`, `APIs`, `Documentação`, etc. | [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx), [DynamicEntityTab.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/DynamicEntityTab.tsx), [OverviewTabContent.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/OverviewTabContent.tsx) | Hipótese: o texto vinha do arquivo de conteúdo da aba; descartada porque `DynamicEntityTab.tsx` apenas repassa `title` e `path`, e `defaultTabs.tsx` define os valores exatos. | A estrutura `defaultTabs` é um objeto de tab labels; os rótulos aparecem diretamente na entidade renderizada no UI. |
| [packages/app/src/components/search/SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx) | A rota `/search` é apontada em [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx) e a sidebar tem ação para `/search` em [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx) | O arquivo usa `Header title="Pesquisar"`, `SearchType.Accordion`, `label="Tipo"`, `name: 'Catálogo de software'` | [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx), [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx) | Hipótese: a busca usa somente strings do plugin externo; descartada porque o código local sobrepõe os textos e escolhe valores de `SearchFilter` e `SearchType`. | Os valores visíveis são definidos em JSX no arquivo; a UI refletirá exatamente esse texto. |
| [packages/app/src/components/Root/Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx) | O arquivo define o menu principal e claramente controla os itens da sidebar | Há `translatedMenuTitles`, `SidebarGroup label="Pesquisar"`, `SidebarGroup label="Menu"`, itens como `Catálogo` e `Meu grupo` | [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx), [consts.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/consts.ts) | Hipótese: o nome do menu vem de configuração global; descartada porque a tradução é resolvida no próprio arquivo e override local. | O menu da aplicação é renderizado por esse componente; os textos são dinamicamente retornados por `getMenuText()`. |
| [packages/app/src/components/UserSettings/SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) | A rota `/settings` em [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx) aponta para este arquivo | A página contém `Header title="Configurações"`, `title: 'Geral'`, `title: 'Provedores de autenticação'` | [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx), [UserSettings/InfoCard.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/InfoCard.tsx) | Hipótese: a configuração era carregada via plugin externo; descartada porque a mesma rota é substituída localmente | A tela foi customizada como uma página completa em PT-BR e renderizada pela rota específica. |
| [packages/app/src/components/api-docs/ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx) | A rota `/api-docs` em [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx) aponta para esse arquivo | A página do explorer usa `PageWithHeader title="APIs"`, `SupportButton>Ajuda para a documentação de APIs</SupportButton>`, filtros em PT-BR | [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx), [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx) | Hipótese: os textos eram do componente base de plugin; descartada porque o arquivo local reaproveita o componente do catálogo, mas redefiniu títulos e labels | A rota aponta diretamente para a tela customizada; basta navegar em `/api-docs` para ver a UI correspondente. |

### 1.3 Antes/Depois e justificativa de impacto

| Item | ANTES | DEPOIS | Justificativa |
|---|---|---|---|
| Catálogo | `CatalogTable` e filtros com textos em inglês | `Catálogo`, `Meus Componentes`, `Pesquisar`, `Responsável`, `Etiquetas` | O maior ganho de UX veio da padronização da tela principal do catálogo. |
| Abas de entidade | `Overview`, `Topology`, `API`, `Definition` | `Visão geral`, `Topologia`, `APIs`, `Definição` | Mantém a navegação funcional, mas torna a linguagem nativa. |
| Sidebar | `Menu`, `Search`, `Catalog` | `Menu`, `Pesquisar`, `Catálogo`, `Meu grupo` | Melhora legibilidade e reduz confusão em navegação principal. |
| Configuração | `Profile`, `Appearance`, `Authentication providers` | `Perfil`, `Aparência`, `Provedores de autenticação` | A página de usuário passa a refletir o idioma da jornada do produto. |

---

## 2) Arquivos analisados e não alterados

Esses arquivos mereceram investigação por parecerem candidatos importantes para tradução, mas não foram modificados porque a tradução já estava resolvida em outra camada ou a UI não era controlada diretamente pelo projeto.

| Arquivo | Motivo da investigação | Motivo do descarte |
|---|---|---|
| [packages/app/src/consts.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/consts.ts) | Define itens do menu principal (`Catalog`, `Home`, `APIs`, `Learning Paths`, `Self-service`) e parecia ser uma origem natural de textos visíveis. | Foi descartado como origem ativa da UI porque o menu real usa um mapeamento explícito em [packages/app/src/components/Root/Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx), que substitui/override os labels visíveis. |
| [packages/app/src/translations/rhdh/ref.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/translations/rhdh/ref.ts) | É o “single source of truth” de traduções em inglês e parecia ser o principal arquivo de internacionalização. | Foi descartado como alvo direto do ajuste porque ele representa a base em inglês e não a tela customizada em PT-BR; o projeto optou por sobrepor a UI localmente em vez de reescrever a base de tradução. |
| [packages/app/src/translations/rhdh/es.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/translations/rhdh/es.ts) | Acessível como outra língua e candidato para padrão de i18n. | Descartado porque o objetivo era PT-BR, não outro idioma. É uma variação de idioma, não um ponto de substituição da experiência atual. |
| [packages/app/src/translations/rhdh/de.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/translations/rhdh/de.ts) | Mesma lógica que o arquivo espanhol. | Identificado como template de tradução de outro idioma, não como ajuste do fluxo principal. |
| [packages/app/src/components/catalog/EntityPage/OverviewTabContent.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/OverviewTabContent.tsx) | Foi identificado como componente muito visível do catálogo. | Descartado porque o conteúdo principal da aba é montado por cards e components do Backstage, e não por textos definidos localmente. |
| [packages/app/src/components/catalog/EntityPage/DynamicEntityTab.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/DynamicEntityTab.tsx) | Parecia responsável por títulos de abas e rotas. | Foi descartado como origem principal da tradução porque ele apenas repassa `title` e `path`; a definição exata dos títulos está em [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx). |
| [packages/app/src/components/Root/SidebarLogo.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/SidebarLogo.tsx) | Parecia um bom candidato de texto acessível lateral. | Foi alterado, não descartado. Ele acabou sendo um ajuste de acessibilidade e visual, não uma tradução de fluxo principal. |
| [packages/app/src/components/learningPaths/LearningPathsPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/learningPaths/LearningPathsPage.tsx) | Tela com textos visíveis; poderia ter sido deixada em inglês. | Não foi descartado: foi alterada para PT-BR. A importância do arquivo foi confirmada por texto direto em JSX. |

---

## 3) Componentes com maior concentração de texto visível

### 3.1 Top 20 componentes com maior concentração de texto visível

| # | Componente | Arquivo | Impacto visual | Textos relevantes estimados | Observação |
|---|---|---|---|---:|---|
| 1 | CatalogPagePT | [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx) | Alto | 15 | Tela principal do catálogo |
| 2 | defaultTabs | [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx) | Alto | 15 | Abas do catálogo de entidades |
| 3 | Root | [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx) | Alto | 12 | Sidebar e menu principal |
| 4 | SettingsPagePT | [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) | Alto | 11 | Configurações do usuário |
| 5 | SignInPage | [SignInPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/SignInPage/SignInPage.tsx) | Alto | 10 | Tela de autenticação |
| 6 | SearchPage | [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx) | Alto | 9 | Busca e filtros |
| 7 | ApiExplorerPagePT | [ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx) | Alto | 9 | Tela de APIs |
| 8 | CatalogUserFilterPT | [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx) | Médio | 6 | Botões de filtro em PT-BR |
| 9 | ApiListPT | [ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx) | Médio | 6 | Painel de listagem de APIs |
| 10 | LearningPathsPage | [LearningPathsPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/learningPaths/LearningPathsPage.tsx) | Médio | 6 | Tela de trilhas de aprendizagem |
| 11 | InfoCard | [InfoCard.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/InfoCard.tsx) | Médio | 5 | Metadados do ambiente |
| 12 | ProfileCardPT | [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) | Médio | 4 | Perfil do usuário |
| 13 | CatalogContentPT | [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx) | Médio | 4 | Conteúdo da tabela do catálogo |
| 14 | NotFoundErrorPage | [NotFoundErrorPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/ErrorPages/NotFoundErrorPage.tsx) | Baixo | 3 | Página 404 |
| 15 | ContactSupportButton | [ContactSupportButton.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/ErrorPages/errorButtons/ContactSupportButton.tsx) | Baixo | 1 | Botão de suporte |
| 16 | GoBackButton | [GoBackButton.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/ErrorPages/errorButtons/GoBackButton.tsx) | Baixo | 1 | Botão voltar |
| 17 | AppearanceCardPT | [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) | Médio | 3 | Aparência e tema |
| 18 | AuthProviderItemPT | [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) | Médio | 3 | Autenticação por provedor |
| 19 | AuthProvidersPagePT | [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) | Médio | 2 | Lista de provedores |
| 20 | SidebarLogo | [SidebarLogo.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/SidebarLogo.tsx) | Baixo | 1 | Acessibilidade do logo |

### 3.2 Classificação por impacto visual

- Alto impacto:
  - [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
  - [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx)
  - [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)
  - [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx)
  - [SignInPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/SignInPage/SignInPage.tsx)
  - [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx)
  - [ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx)

- Médio impacto:
  - [LearningPathsPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/learningPaths/LearningPathsPage.tsx)
  - [InfoCard.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/InfoCard.tsx)
  - [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) (subcomponentes)
  - [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx) (subcomponentes)

- Baixo impacto:
  - [NotFoundErrorPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/ErrorPages/NotFoundErrorPage.tsx)
  - [ContactSupportButton.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/ErrorPages/errorButtons/ContactSupportButton.tsx)
  - [GoBackButton.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/ErrorPages/errorButtons/GoBackButton.tsx)
  - [SidebarLogo.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/SidebarLogo.tsx)

---

## 4) Relação esforço x resultado

### 4.1 Arquivos que entregaram mais tradução visual com menos modificações

| Arquivo | Esforço (complexidade/escopo) | Resultado visual | Comentário |
|---|---|---|---|
| [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx) | Baixo | Muito alto | Reescreve a tela do catálogo inteira em um único arquivo com alto impacto direto. |
| [SignInPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/SignInPage/SignInPage.tsx) | Baixo | Alto | Ajusta a experiência inicial sem grandes mudanças de arquitetura. |
| [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx) | Baixo | Alto | Pequeno arquivo, grande impacto nas abas do catálogo. |
| [ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx) | Baixo | Alto | Substitui a experiência de APIs de forma quase isolada. |
| [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx) | Médio | Alto | Página mais complexa, mas com ganho muito visual e funcional. |
| [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx) | Médio | Alto | Impacta navegação global e menu, com ganho de coerência. |
| [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx) | Médio | Alto | Aumenta a legibilidade da busca sem mexer na lógica de pesquisa. |

### 4.2 Ranking por impacto / esforço

1. [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
2. [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx)
3. [SignInPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/SignInPage/SignInPage.tsx)
4. [ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx)
5. [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx)
6. [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)
7. [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx)

Em resumo, os melhores retornos vieram de:

- substituir telas completas;
- alterar rotas principais;
- ajustar labels diretamente no render do componente.

---

## 5) Textos ainda em inglês

### 5.1 Lista de textos que permanecem em inglês

| Texto/Bloco | Localização | Status | Motivo de permanência |
|---|---|---|---|
| `Home`, `My Group`, `Catalog`, `APIs`, `Learning Paths`, `Self-service` | [packages/app/src/consts.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/consts.ts) | Ainda em inglês | São definições padrão do app local e servem como base de menu; no UI atual, o texto visível é sobreposto por [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx). |
| `home`, `myGroup`, `catalog`, `apis`, ... em `rhdhMessages` | [packages/app/src/translations/rhdh/ref.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/translations/rhdh/ref.ts) | Ainda em inglês | É a referência alfanumérica do Backstage e serve como dicionário de origem; não é necessariamente exibido em todos os fluxos. |
| Strings dos componentes de plugin externos | Vários cards do Backstage e plugins | Em inglês | São renderizados por bibliotecas de terceiros ou by-design. Não foram adaptados porque a customização local não reinvade esses componentes. |
| Labels do core do Backstage | Componentes de `@backstage/core-components` e `@backstage/plugin-catalog` | Em inglês | Mecanismo de default do Backstage; exigem tradução de nível de plugin ou override explícito. |

### 5.2 Por que não foram traduzidos

- Os arquivos em inglês ainda existem como fonte de referência do sistema, não como parte da camada de interface ativa.
- O projeto optou por customização pontual da UI em vez de traduzir internamente todos os componentes do Backstage.
- Alguns textos vêm de bibliotecas externas, não do app local.
- Em certos casos, há integração com plugins, e o texto é gerado por APIs/metadata externas.

### 5.3 Classificação

- Pertencem ao app local:
  - [consts.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/consts.ts)
  - [ref.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/translations/rhdh/ref.ts)

- Pertencem ao Backstage core ou plugins externos:
  - componentes `EntityAboutCard`, `EntityLinksCard`, `CatalogTable`, `SearchType.Accordion`, etc.
  - todos os componentes vindos de bibliotecas externas em `@backstage/*`

- Dependem de API / dados externos:
  - labels vindos de metadata de entidades
  - valores de `metadata.tags`, `spec.lifecycle`, `spec.owner`, etc.
  - dados de plugins dinâmicos e módulos externos

---

## 6) Dependência de plugins externos no catálogo

### 6.1 Mapeamento da composição da tela de catálogo

A tela do catálogo é um composto de camadas:

- App local:
  - [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx)
  - [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
  - [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)
  - [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx)

- Plugins do Backstage:
  - `@backstage/plugin-catalog`
  - `@backstage/plugin-catalog-react`
  - `@backstage/core-components`
  - `@backstage/core-plugin-api`
  - `@backstage/plugin-search`
  - `@backstage/plugin-org`

- Bibliotecas visuais:
  - `@mui/material`

### 6.2 Árvore de dependências simplificada

```text
App local
├── AppBase
│   ├── CatalogPagePT
│   │   ├── EntityListProvider
│   │   ├── CatalogFilterLayout
│   │   ├── EntityAutocompletePicker
│   │   ├── EntityTagFilter
│   │   ├── EntityLifecycleFilter
│   │   ├── EntityOwnerFilter
│   │   ├── EntityTextFilter
│   │   └── CatalogTable
│   │       └── @backstage/plugin-catalog
│   │
│   ├── SearchPage
│   │   ├── SearchBar / SearchFilter / SearchPagination / SearchResult
│   │   └── @backstage/plugin-search-react
│   │
│   ├── SettingsPagePT
│   │   └── InfoCard / RoutedTabs / ProviderSetting
│   │       └── @backstage/core-components
│   │
│   └── entityPage()
│       └── defaultTabs
│           └── DynamicEntityTab
│               └── EntityLayout.Route
│                   └── @backstage/plugin-catalog
│
├── Root
│   ├── SidebarGroup / SidebarItem / SidebarSearchModal
│   └── DynamicRootContext
│       └── plugin-utils + dynamic plugin metadata
│
└── External dependencies
    ├── @mui/material
    ├── @backstage/core-components
    ├── @backstage/core-plugin-api
    ├── @backstage/plugin-catalog-react
    └── @backstage/plugin-catalog
```

### 6.3 O que foi customizado no app local

- Troca de rota para telas PT-BR via [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx)
- Customização de texto do catálogo em [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
- Personalização de abas em [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx)
- Textos da busca em [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx)
- Menu principal em [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)

### 6.4 Conclusão sobre dependências

O catálogo é uma composição híbrida:

- a estrutura e a lógica vêm do Backstage e plugins;
- o texto e a experiência final vêm de sobreposição local;
- os dados reais em tabela vêm do catálogo e da API de entidades, não do app local.

---

## 7) Estratégia para repetir em outro projeto

### 7.1 Ordem de investigação recomendada

1. Começar pela rota principal:
   - procurar por `Route path="/catalog"` e `Route path="/search"` em [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx)
2. Seguir o componente de tela diretamente:
   - [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
   - [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx)
   - [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx)
3. Verificar o menu global:
   - [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)
4. Investigar tabs e rotas de entidade:
   - [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx)
   - [DynamicEntityTab.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/DynamicEntityTab.tsx)
5. Só então checar traduções globais e dicionários:
   - [ref.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/translations/rhdh/ref.ts)
   - [consts.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/consts.ts)

### 7.2 Arquivos que procurar primeiro

- [AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx)
- [Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)
- [CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
- [SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx)
- [defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx)
- [SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx)

### 7.3 Padrões de componentes que indicam telas críticas

Os melhores “sinais” de tela crítica são:

- `Route path="/..." element={<... />}`
- `PageWithHeader`, `Header`, `Content`, `CatalogTable`
- `SidebarGroup`, `SidebarItem`, `SidebarSearchModal`
- `RoutedTabs`, `EntityListProvider`
- `TextField`, `SearchFilter`, `SearchType.Accordion`
- `InfoCard`, `SupportButton`

Esses componentes são aqueles em que o texto e a navegação aparecem diretamente para o usuário.

### 7.4 Como localizar textos visíveis

Use busca por padrões de texto e componentes:

- `title=`
- `label=`
- `Header title=`
- `statusMessage=`
- `message:`
- `SidebarGroup label=`
- `aria-label=`
- `button`, `SupportButton`, `CreateButton`

Exemplos reusáveis:
- `grep -R "title=\|label=\|Header title=\|statusMessage=" src/components`
- varredura por `TextField`, `Select`, `Accordion`, `SidebarGroup`

### 7.5 Como localizar páginas equivalentes ao catálogo

Para encontrar a página equivalente:
1. procure por `path="/catalog"` na app router;
2. veja qual componente monta a listagem;
3. identifique se há `CatalogFilterLayout`, `CatalogTable`, `EntityListProvider`;
4. procure por `@backstage/plugin-catalog` e `@backstage/plugin-catalog-react`;
5. confirme se há filtros e colunas visíveis em JSX.

---

## Análise dos ANTES/DEPOIS por categoria

| Categoria | ANTES | DEPOIS | Justificativa |
|---|---|---|---|
| Tradução direta | `Search`, `Catalog`, `Home`, `Profile` | `Pesquisar`, `Catálogo`, `Início`, `Perfil` | Melhora de legibilidade e posicionamento do produto no mercado local. |
| Substituição de componente | `CatalogPage` base do Backstage | `CatalogPagePT` customizado | Permite UX local com controle de labels e layout. |
| Página customizada PT | sem página local | `CatalogPagePT`, `ApiExplorerPagePT`, `SettingsPagePT` | Reduz o risco de “misturar” a UI do Backstage com a identidade local. |
| Ajuste de rota | `/catalog` -> componente padrão | `/catalog` -> componente PT local | Mantém estrutura funcional e troca a experiência visual em ponto crítico. |
| Alteração de teste | asserções em inglês | asserções em português | Valida a camada UI atualizada e protege regressões. |
| Layout/visual | textos e labels padrão do Backstage | labels e sidebar traduzidos | Garante coerência visual e acessibilidade. |
| Funcional | app local sem build específico | Dockerfile local PT-BR | Facilita execução do projeto em ambiente customizado. |

---

## Recomendações finais para reutilização da metodologia em outro projeto

1. Comece sempre pelo roteamento principal.
2. Depois, vá para os componentes de tela diretamente vinculados às rotas.
3. Identifique o "owner" real do texto:
   - app local
   - Backstage core
   - plugin externo
   - dados de API
4. Priorize arquivos com:
   - `Route`
   - `Header`
   - `SidebarGroup`
   - `CatalogTable`
   - `SearchType`
   - `RoutedTabs`
5. Para mudanças de UX local, prefira sobreposição de páginas e rotas, não reescrever o core de plugins.
6. Quando detectar textos vindos do core, decida se:
   - vale customizar localmente;
   - vale mapear tradução por `translationRef`;
   - vale abandonar a localização daquele ponto por ser de plugin externo.
7. Mantenha um padrão de arquivos:
   - `PageNamePT.tsx` para versões customizadas;
   - `AppBase.tsx` para definição de rotas;
   - `Root.tsx` para itens globais da navegação.

---

## Referências de arquivos principais utilizados na análise

- [packages/app/src/components/AppBase/AppBase.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/AppBase/AppBase.tsx)
- [packages/app/src/components/catalog/CatalogPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/CatalogPagePT.tsx)
- [packages/app/src/components/api-docs/ApiExplorerPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/api-docs/ApiExplorerPagePT.tsx)
- [packages/app/src/components/UserSettings/SettingsPagePT.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/UserSettings/SettingsPagePT.tsx)
- [packages/app/src/components/search/SearchPage.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/search/SearchPage.tsx)
- [packages/app/src/components/Root/Root.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/Root/Root.tsx)
- [packages/app/src/components/catalog/EntityPage/defaultTabs.tsx](/home/dell/projects/rhdh-ptbr/packages/app/src/components/catalog/EntityPage/defaultTabs.tsx)
- [packages/app/src/translations/rhdh/ref.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/translations/rhdh/ref.ts)
- [packages/app/src/consts.ts](/home/dell/projects/rhdh-ptbr/packages/app/src/consts.ts)
- [Dockerfile.local-ptbr](/home/dell/projects/rhdh-ptbr/Dockerfile.local-ptbr)
