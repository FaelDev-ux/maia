# Registro de interações com IA

Este documento registra interações importantes com IA no projeto Maia. O objetivo é manter um histórico curto, revisável e útil para apresentação acadêmica e acompanhamento da equipe.

Cada registro deve seguir a ordem:

**Objetivo -> Prompt -> Resposta -> Resultado -> Acertos -> Falhas -> Conclusão**

## Critério de registro

- Registrar apenas prompts que influenciaram entendimento, arquitetura, implementação ou validação do projeto.
- Resumir respostas longas, mantendo apenas o que importa para revisão.
- Não esconder falhas, limitações ou validações que não puderam ser feitas.
- Atualizar este arquivo quando uma nova interação importante acontecer.

---

## Interação 1 - Varredura inicial do projeto

### 1. Objetivo da interação

Fazer uma leitura inicial do repositório para a IA entender o projeto antes de sugerir ou alterar código.

### 2. Prompt enviado

> "faça uma varredura dos arquivos, leia o agents.md e o context.md pra vc saber oq fazer e ter uma base"

### 3. Resposta da IA

A IA leu `AGENTS.md`, `context.md`, `globals.css`, estrutura do `frontend`, rotas existentes, schemas, componentes de autenticação, seleção de perfil e navegação.

### 4. Resultado obtido

A IA passou a ter uma base do projeto Maia, incluindo stack, regras de colaboração, identidade visual, rotas atuais e pendências conhecidas.

### 5. Acertos

- Leu as fontes principais do projeto.
- Identificou Next.js, React, TypeScript, Tailwind v4 e tokens visuais.
- Verificou o estado do Git antes de qualquer alteração.
- Não alterou arquivos sem solicitação.

### 6. Falhas ou limitações

- A leitura no terminal exibiu alguns acentos quebrados por encoding.
- Não executou lint ou build porque a tarefa era apenas de análise.

### 7. Conclusão

A interação foi útil para reduzir risco antes das mudanças. A IA entendeu a estrutura principal, mas a leitura ainda depende de revisão humana.

---

## Interação 2 - Criação da home após o fluxo de mãe recente

### 1. Objetivo da interação

Criar uma tela de home baseada na referência visual enviada e fazer o fluxo "sou mãe recente" chegar nessa tela.

### 2. Prompt enviado

> "Após apertar na tela do sou mãe recente e passar pelas etapas, deve aparecer essa tela, faça pra mim e se eu n gostar, vou pedir pra retirar"

### 3. Resposta da IA

A IA criou a rota `/home`, adicionou uma feature de home com dados mockados, conectou o botão final do fluxo de mãe recente e validou com lint, build e teste de navegação.

### 4. Resultado obtido

Após a etapa final do fluxo de mãe recente, o botão "Continuar" redireciona para `/home`.

### 5. Acertos

- Implementou a rota `/home`.
- Conectou o fluxo de seleção de perfil sem mexer em autenticação real.
- Usou mocks isolados.
- Validou com `npm run lint` e `npm run build`.
- Usou linguagem não diagnóstica no insight emocional.

### 6. Falhas ou limitações

- A primeira versão ainda não estava suficientemente componentizada.
- A captura visual via Chrome falhou por timeout, então parte da validação foi feita por DOM/URL.
- A tela usou imagens locais existentes, não assets oficiais do Figma.

### 7. Conclusão

A interação entregou uma primeira versão funcional da home, adequada para revisão, mas ainda exigiu ajustes visuais e estruturais posteriores.

---

## Interação 3 - Adaptação da home para desktop

### 1. Objetivo da interação

Criar uma versão desktop da home seguindo o padrão responsivo das outras telas do projeto.

### 2. Prompt enviado

> "Faz a versão pc da mesma forma q os outros componentes tem sua tela na versão pc, faça o mesmo pra essa"

### 3. Resposta da IA

A IA ajustou a home para funcionar em mobile e desktop, usando layout em colunas, container mais largo e espaçamentos maiores em telas `md+`.

### 4. Resultado obtido

A home passou a ter uma apresentação mais adequada em telas maiores, sem perder o comportamento mobile-first.

### 5. Acertos

- Manteve uma única rota e um único componente principal responsivo.
- Preservou o mobile como base.
- Validou com lint, build e checagem da rota.

### 6. Falhas ou limitações

- Ainda dependia de ajuste posterior para seguir exclusivamente os tokens visuais do projeto.
- Não houve validação visual perfeita por screenshot automatizado.

### 7. Conclusão

A adaptação melhorou a experiência desktop, mas precisou de refinamento para ficar totalmente alinhada ao design system do Maia.

---

## Interação 4 - Correção para usar design tokens

### 1. Objetivo da interação

Garantir que a home usasse apenas as cores e tokens já definidos pela equipe.

### 2. Prompt enviado

> "as cores ja temos as cores padrões deeterminadas por nós, siga elas"

### 3. Resposta da IA

A IA removeu cores avulsas da home e substituiu por tokens/classes do projeto, como `bg-background`, `bg-surface`, `bg-primary/15`, `text-primary`, `text-title`, `text-text`, `shadow-card` e `shadow-soft`.

### 4. Resultado obtido

A tela ficou mais alinhada ao `globals.css` e à identidade visual definida no projeto.

### 5. Acertos

- Removeu cores hardcoded da feature da home.
- Fez busca para confirmar ausência de `#`, `rgb(...)`, `bg-white`, `border-white`, `text-black` e `bg-black`.
- Validou com lint e build.

### 6. Falhas ou limitações

- O ajuste foi reativo, feito depois de uma primeira versão com cores fora do padrão.
- Alguns estilos utilitários de layout ainda usam valores arbitrários de tamanho, o que é aceitável para fidelidade visual, mas deve ser revisado se virar padrão global.

### 7. Conclusão

A interação corrigiu um ponto importante de consistência visual e reforçou que novas telas devem partir dos tokens já definidos.

---

## Interação 5 - Tentativa e acesso ao frame do Figma via MCP

### 1. Objetivo da interação

Ler o frame do Figma via MCP para implementar a interface com maior fidelidade visual.

### 2. Prompt enviado

> "Leia esse frame do figma usando o MCP e implemente a interface com base no context.md"

### 3. Resposta da IA

Na primeira tentativa, o MCP retornou erro de acesso ao arquivo. Depois, em nova tentativa, o MCP conseguiu ler o frame `215:1427` e identificou a tela **HOME 3**, voltada para mãe experiente/mentora da comunidade.

### 4. Resultado obtido

A IA obteve a estrutura visual do frame: header com logo/avatar, badge de mentora, card de impacto, pedidos urgentes, card de comunidade e bottom navigation.

### 5. Acertos

- Tentou usar o MCP do Figma antes de depender apenas de inferência.
- Identificou corretamente a tela como `HOME 3`.
- Relatou a falha inicial de acesso em vez de esconder o problema.
- Não alterou arquivos quando o pedido posterior foi apenas "tente acessar".

### 6. Falhas ou limitações

- A primeira tentativa falhou por acesso ao arquivo.
- A implementação anterior da home foi baseada na referência enviada por imagem, não no frame completo do Figma.
- Ainda falta aplicar totalmente o frame `HOME 3` no código, caso essa seja a próxima decisão da equipe.

### 7. Conclusão

O acesso ao Figma melhorou a base visual para as próximas alterações, mas a equipe ainda precisa decidir se a home atual deve ser substituída ou adaptada para seguir exatamente a `HOME 3`.

---

## Interação 6 - Criação do context.md completo do projeto

### 1. Objetivo da interação

Criar um `context.md` completo para servir como memória operacional do projeto Maia, consolidando visão de produto, estado técnico, decisões de arquitetura, padrões visuais, Figma, Documento de Visão, pendências e próximos passos.

### 2. Prompt enviado

> "atue como um engenheiro fullstack e IA sênior, sua tarefa é fazer um context.md completo com base no atual, dentro as fontes vou lhe mandar o documento de visão e o link do figma funciona? ou teria que exportar as telas? não faça o context ainda, vou enviar o atual"

Depois, após envio das fontes principais:

> "crie primeiro o context.md completo"

### 3. Resposta da IA

A IA orientou que o `context.md` deveria ser gerado com base em quatro fontes principais: o contexto operacional atual, o Documento de Visão, o Figma/export das principais telas e os tokens reais do `globals.css`.

Em seguida, criou uma versão consolidada do `context.md`, separando visão do produto, proposta de valor, perfis de usuário, escopo funcional, MVP, cuidados éticos, stack frontend, backend planejado, rotas atuais, rotas futuras, identidade visual, UX, check-in emocional, motor de recomendação, comunidade, comandos, estado do Git, pendências e próximos passos.

### 4. Resultado obtido

Foi criado um `context.md` completo para ser salvo na raiz do repositório e utilizado por toda a equipe como fonte de alinhamento do projeto Maia.

O arquivo passou a documentar não apenas a visão acadêmica do produto, mas também o estado real do frontend, decisões práticas, riscos conhecidos e orientações para futuras implementações com IA/Codex.

### 5. Acertos

* Consolidou fontes diferentes em um único documento operacional.
* Separou visão de produto de estado técnico real.
* Registrou divergências importantes, como backend planejado em Django REST versus recomendações anteriores.
* Incluiu perfis de usuário do Documento de Visão.
* Considerou o Figma e os exports das telas como fonte visual.
* Usou os tokens reais do `globals.css` como referência visual implementada.
* Documentou pendências técnicas existentes.
* Reforçou cuidados éticos, privacidade e linguagem não diagnóstica.
* Indicou que o arquivo deve ficar na raiz do repositório.

### 6. Falhas ou limitações

* O Figma não foi lido diretamente via MCP nessa etapa; os exports das telas foram usados como fonte visual principal.
* Algumas decisões técnicas ainda dependem de validação do time, especialmente integração com backend Django REST.
* O `context.md` precisará ser mantido atualizado conforme o projeto evoluir.
* O documento não substitui documentação técnica específica, como README, contratos de API ou documentação de design system.

### 7. Conclusão

A interação foi essencial para alinhar produto, tecnologia, design e uso de IA no projeto Maia. O `context.md` passou a funcionar como memória viva do projeto e base para que todos os membros da equipe, incluindo usuários do Codex Desktop, trabalhem com o mesmo entendimento.

---

## Interação 7 - Implementação da HOME 1 pelo Figma MCP

### 1. Objetivo da interação

Ler o frame **HOME 1** do Figma via MCP e implementar a interface da home para o perfil de mãe recente, mantendo fidelidade visual, componentização, responsividade mobile-first e uso dos design tokens do Maia.

### 2. Prompt enviado

> "Leia esse frame do figma usando o MCP e implemente a interface com base no context.md"
>
> "basicamente ao apertar em sou mãe recente, deve aparecer essa tela aí, faça o mais parecido possivel e use as cores que já temos na estrutura"
>
> "Todas as telas tem sua versão desktop, ent faça isso tambem, foque no mobile-first, mas faça o desktop asssim como tem nos outros componentes"

### 3. Resposta da IA

A IA leu `context.md` e `AGENTS.md`, verificou o estado do Git e acessou o frame do Figma pelo MCP. O frame identificado foi `206:588`, nomeado **HOME 1**, com largura mobile de 412px e seções de header, check-in emocional, insight semanal, recomendações, prévia da comunidade e navegação inferior.

Depois, a IA implementou a rota `/home`, criou a feature `home` com componentes reutilizáveis e dados mockados tipados, ajustou o fluxo de seleção para que "Sou mãe recente" leve à home e adicionou uma versão desktop responsiva da tela.

### 4. Resultado obtido

A tela `/home` passou a renderizar uma home baseada no Figma, com:

- header com logo e avatar;
- saudação "Olá, Maria! Como você está hoje?";
- chips de check-in emocional;
- card de insight semanal com linguagem não diagnóstica;
- recomendações em carrossel no mobile e grid no desktop;
- card de comunidade;
- botão flutuante de apoio;
- bottom navigation flutuante com cinco ícones.

No fluxo de seleção de tipo de usuário, clicar em "Sou mãe recente" ou continuar com essa opção selecionada redireciona para `/home`.

### 5. Acertos

- Usou o MCP do Figma para ler o frame antes de implementar.
- Manteve a Home mobile-first e adicionou adaptação desktop em `md+`.
- Criou componentes separados em `frontend/src/features/home/components`.
- Isolou dados mockados em `frontend/src/features/home/data/home-content.ts`.
- Usou tokens/classes do projeto como `bg-background`, `text-title`, `text-text`, `text-primary`, `shadow-card` e `shadow-soft`.
- Preservou linguagem acolhedora e não diagnóstica no insight.
- Validou com `npm run lint` e `npm run build`, ambos passando.
- Verificou a rota no navegador local em `http://localhost:3000/home`.

### 6. Falhas ou limitações

- As imagens de recomendações e avatares ainda são mocks remotos temporários, não assets finais do Figma ou API real.
- A validação visual desktop pelo navegador embutido ficou limitada pela largura disponível da superfície aberta; a responsividade foi validada principalmente por classes, build e inspeção do layout.
- A tela ainda não consome backend Django REST; os mocks devem ser substituídos quando houver contrato real de API.
- O arquivo `context.md` ainda menciona `(private)/page.tsx` como vazio e recomenda implementar a home; esse contexto precisa ser atualizado em uma tarefa própria para refletir o novo estado.

### 7. Conclusão

A interação avançou a home autenticada do Maia de forma alinhada ao Figma e ao contexto do projeto. A implementação ficou revisável, componentizada e validada, mas ainda depende de integração futura com API e substituição dos mocks por dados e assets definitivos.

---

## Interação 8 - Homes por perfil e correção do fluxo de seleção

### 1. Objetivo da interação

Criar variações da Home para todos os perfis principais selecionáveis no onboarding e corrigir o fluxo para que a Home apareça apenas após a finalização das etapas de boas-vindas de cada usuário.

### 2. Prompt enviado

> "Faça a mesma interface para o desejo ser mãe"
>
> "O print que estou enviando agora é da seleção da mãe experiente, com relação ao q vc já fez só muda umas coisinhas, lembre de fazer a versão desktop"
>
> "Por ultimo a home da profissional de saude, o print q lhe enviei é do profissional de saúde"
>
> "N deve haver redirecionamento ao selecionar, o fluxo funciona ao usuario selecionar e apertar no botão de continuar e temos as paginas de welcomestep de cada, logo, as homes só devem aparecer após a finalização de todas as steps do welcome de cada usuario"

### 3. Resposta da IA

A IA leu `context.md`, `AGENTS.md`, inspecionou a feature `home`, o fluxo `SelectTypeFlow` e as steps finais de cada perfil. Em seguida, transformou a Home em uma tela parametrizada por perfil via query string:

- `/home`: mãe recente;
- `/home?profile=future-mother`: deseja ser mãe/futura mãe;
- `/home?profile=experienced-mother`: mãe experiente/mentora;
- `/home?profile=health-professional`: profissional de saúde.

Também criou componentes reutilizáveis para a variação de mentoria/profissional, como card de impacto, badge de perfil e cards de pedidos de ajuda.

Por fim, corrigiu o fluxo de seleção: clicar em um card passou a apenas selecionar o perfil; o botão "Continuar" leva à primeira step daquele perfil; a Home só é aberta no botão final da última step.

### 4. Resultado obtido

O projeto passou a ter quatro variações de Home com a mesma base visual, responsivas e alinhadas aos prints:

- mãe recente: check-in emocional, insight, recomendações e comunidade;
- deseja ser mãe: check-in emocional adaptado, recomendações e comunidade para futura mãe;
- mãe experiente: badge "Mentora da comunidade", impacto, pedidos de ajuda urgentes e comunidade;
- profissional de saúde: badge "Especialista verificada", especialidade "Pediatra", impacto, pedidos de ajuda urgentes e comunidade.

Os fluxos finais ficaram:

- mãe recente: `welcome -> baby-info -> support -> /home`;
- deseja ser mãe: `welcome -> support -> /home?profile=future-mother`;
- mãe experiente: `welcome -> /home?profile=experienced-mother`;
- profissional de saúde: `data -> welcome -> /home?profile=health-professional`.

### 5. Acertos

- Reaproveitou a rota `/home` sem criar rotas duplicadas para cada perfil.
- Tipou os perfis em `HomeProfile` e os conteúdos em estruturas específicas.
- Isolou mocks em `frontend/src/features/home/data/home-content.ts`.
- Criou componentes reutilizáveis para impacto, badge e pedidos de ajuda.
- Manteve mobile-first e adicionou adaptação desktop.
- Preservou linguagem acolhedora, sem diagnóstico clínico.
- Corrigiu a navegação para respeitar as steps de onboarding antes da Home.
- Validou com `npm run lint` e `npm run build`, ambos passando.
- Testou no navegador que selecionar um card não redireciona e que a step final da profissional leva à Home correta.

### 6. Falhas ou limitações

- As imagens de avatar, recomendações e participantes continuam como mocks remotos temporários.
- Os dados de impacto, pedidos de ajuda e comunidade ainda não vêm de API real.
- Algumas telas foram implementadas a partir de prints enviados, não por leitura direta de todos os frames via MCP.
- O `context.md` ainda precisa ser atualizado em tarefa separada para refletir que `/home` e as variações por perfil já existem.

### 7. Conclusão

A interação consolidou a Home como uma experiência inicial personalizada por perfil, mantendo coerência visual e respeitando o fluxo correto de onboarding. A implementação está adequada para revisão e validação de produto, mas ainda depende de integração futura com backend Django REST e assets definitivos.

---

## Interação 9 - Recomendações, artigos e check-in emocional

### 1. Objetivo da interação

Implementar a área de recomendações da Home, criar a biblioteca de conteúdos, abrir artigos individuais, tornar o registro emocional clicável e validar o fluxo completo sem introduzir problemas novos.

### 2. Prompt enviado

> "Vamos fazer a parte de recomendações, ok? como q funciona, ali vai ter um slide onde posso passar pro lado e no ver tudo vai mostrar os conteudos, apertando em algum desses conteudos vai abrir o artigo desse conteudo"
>
> "Vamos trabalhar nos registros de emoções na parte do feliz, cansada, sobrecarregada e assim por diante, deve ser clicavel e qnd clicar vai mostrar alguma coisa no lugar e esses botões vão sumir"
>
> "Esse botão ele é flutuante e fica fixo sempre a mostra e ao apertar nele ele vai para o /check-in onde posso registrar os sentimentos."
>
> "Faça validação, teste cada componente desde o começo, verifique se tem algo de errado, n crie problemas, após isso atualize o interacoes-ia"

### 3. Resposta da IA

A IA leu o contexto do projeto, inspecionou os componentes existentes da Home, comunidade e navegação, e criou a feature `contents` para a biblioteca e artigos. Também criou a rota `/check-in`, reaproveitando os chips de emoção e um card de feedback acolhedor.

Durante a validação, foi identificado que o arquivo `CheckInPage.tsx` estava reduzido a um fragmento de teste com o texto "Eu gosto de check-in". A IA corrigiu a tela para a implementação completa antes de concluir a validação.

### 4. Resultado obtido

Foram adicionados ou ajustados:

- `/conteudos`: biblioteca com todos os artigos recomendados;
- `/conteudos/[contentId]`: página de artigo com layout inspirado no Figma, badges, imagem, conteúdo, quote e feedback;
- botão "Ver tudo" da Home navegando para `/conteudos`;
- cards de recomendação clicáveis navegando para o artigo correspondente;
- botão de voltar na lista de artigos e no artigo individual;
- chips de emoção clicáveis na Home;
- card de confirmação substituindo os chips após a seleção;
- `/check-in`: tela dedicada para registrar sentimentos;
- botão flutuante fixo da Home apontando para `/check-in`.

### 5. Validação executada

Comandos executados:

- `npm run lint`: passou;
- `npm run build`: passou;
- `npm run format:check`: falhou por pendências amplas de formatação já existentes no projeto, envolvendo 73 arquivos. Não foi executada formatação global.

Rotas validadas com resposta `200`:

- `/`;
- `/auth?mode=login`;
- `/auth?mode=register`;
- `/auth/forgot-password`;
- `/auth/select-type`;
- `/home`;
- `/home?profile=future-mother`;
- `/home?profile=experienced-mother`;
- `/home?profile=health-professional`;
- `/check-in`;
- `/conteudos`;
- `/conteudos/navegando-nas-emocoes`;
- `/conteudos/alongamento-leve`;
- `/conteudos/preparando-sua-jornada`;
- `/conteudos/respiracao-para-ansiedade`;
- `/comunidade`;
- `/comunidade/post-sono-madrugada`;
- `/comunidade/post-rede-apoio`;
- `/comunidade/post-respirar`.

Também foram verificados textos e links essenciais em `/home`, `/check-in`, `/conteudos` e no artigo `navegando-nas-emocoes`.

### 6. Acertos

- A implementação manteve mobile-first e versão desktop responsiva.
- Os conteúdos e feedbacks ficaram isolados em dados tipados.
- Os componentes criados são reutilizáveis: card de artigo, página de artigo, header de conteúdo, feedback emocional e check-in.
- A linguagem dos registros emocionais evita diagnóstico e usa tom acolhedor.
- O botão flutuante agora tem destino real em `/check-in`.
- A página de artigos possui navegação de volta consistente com o padrão da comunidade.

### 7. Falhas ou limitações

- A bottom navigation ainda aponta para `/historico`, `/perfil` e `/mais`, mas essas rotas retornam `404` porque ainda não foram implementadas. Isso foi identificado como pendência existente do produto, não corrigida nesta interação para evitar criação de telas falsas fora do escopo.
- `npm run format:check` segue falhando por formatação global do repositório. A correção exigiria uma tarefa específica de formatação para não misturar feature e churn amplo.
- Os dados de artigos, recomendações e check-in ainda são mocks locais, sem integração com backend Django REST.

### 8. Conclusão

A interação consolidou o fluxo Home -> recomendações -> biblioteca -> artigo e Home -> check-in emocional. A validação técnica principal passou em lint, build e rotas críticas, com pendências conhecidas registradas para evolução futura.

---
