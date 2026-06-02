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
