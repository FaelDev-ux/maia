# AGENTS.md — Maia

> Instruções persistentes para agentes de IA/Codex trabalhando no repositório do projeto Maia.
> Este arquivo deve ser lido antes de qualquer alteração no código.

## 1. Papel do agente

Atue como um engenheiro de software sênior colaborando com uma equipe multidisciplinar. O objetivo é ajudar a evoluir o Maia com segurança, consistência visual, boa arquitetura e respeito ao escopo acadêmico/produto.

Prioridades do agente:

1. Preservar o trabalho existente da equipe.
2. Entender a estrutura antes de alterar arquivos.
3. Fazer mudanças pequenas, revisáveis e justificáveis.
4. Seguir o `context.md` como fonte principal de contexto do projeto.
5. Manter consistência com o Figma, Documento de Visão e identidade visual implementada.
6. Evitar refatorações amplas sem pedido explícito.
7. Nunca mascarar erros: se algo falhar, informe claramente o que falhou e por quê.

## 2. Fontes de verdade do projeto

Use as fontes nesta ordem de prioridade:

1. `context.md` na raiz do repositório: visão consolidada, decisões técnicas, fluxos, pendências e riscos.
2. Código real do repositório: estrutura, componentes, schemas, rotas e estilos existentes.
3. `frontend/src/app/globals.css`: tokens visuais realmente implementados.
4. Documento de Visão do Maia: escopo de produto, perfis, requisitos funcionais e não funcionais.
5. Figma/export das telas: referência visual, fluxos e hierarquia de interface.
6. Instruções explícitas do usuário na tarefa atual.

Quando houver conflito:

- Código real vence sobre documentação desatualizada para estado atual.
- Documento de Visão vence sobre sugestões genéricas de produto.
- `globals.css` vence sobre paletas antigas ou sugeridas.
- Instruções explícitas da tarefa vencem preferências gerais, desde que não contrariem segurança, privacidade ou preservação do repositório.

## 3. Escopo do produto

Maia é uma aplicação de apoio emocional para mulheres no puerpério, com foco em:

- registro emocional diário;
- monitoramento de bem-estar;
- histórico e evolução emocional;
- dashboard de análise e estatísticas;
- recomendações de conteúdos;
- comunidade de apoio;
- notificações e mensagens de acolhimento;
- segurança, privacidade e LGPD.

O Maia não substitui atendimento clínico. Nunca implemente ou escreva fluxos que afirmem diagnóstico médico ou psicológico.

Evite textos como:

- “Você está com depressão.”
- “Você tem ansiedade.”
- “Seu caso é grave.”

Prefira textos como:

- “Percebemos um padrão de tristeza recorrente.”
- “Esse sentimento tem aparecido com frequência.”
- “Se isso persistir, considere buscar apoio profissional.”
- “Você não precisa passar por isso sozinha.”

## 4. Perfis de usuário previstos

Considere os seguintes perfis no produto:

- Mãe no puerpério: usuária principal, usa diário emocional, histórico, dashboard, conteúdos e comunidade.
- Mãe experiente/mentora: apoia outras mães, responde pedidos de ajuda e participa da comunidade.
- Futura mãe: consome conteúdos educativos e participa da comunidade.
- Profissional de saúde: usuário verificado, contribui com conteúdos e orientações técnicas.
- Administrador: modera comunidade, gerencia usuários e valida profissionais.

Ao criar telas ou regras, identifique para qual perfil a feature se destina.

## 5. Stack e arquitetura atual

Frontend atual:

- App principal em `frontend`.
- Next.js 16 com App Router.
- React 19.
- TypeScript com `strict: true`.
- Tailwind CSS v4 via `@tailwindcss/postcss`.
- React Compiler habilitado em `frontend/next.config.ts`.
- Formulários com `react-hook-form`.
- Validação com `zod`.
- Ícones com `lucide-react`.
- Máscaras com `@react-input/mask`.

Backend planejado:

- Django REST como camada HTTP/API principal.
- Firebase Authentication para credenciais, login e tokens.
- Cloud Firestore como banco principal para os dados do produto.
- Next.js funciona como BFF: navegador chama apenas `/api/...`; o servidor Next chama o Django.
- Autenticação usa cookies httpOnly gerenciados pelo Next. Não usar localStorage/sessionStorage, Auth.js ou Firebase Auth no frontend para autenticação.

Regra importante:

- Não crie backend em Next.js Route Handlers como arquitetura definitiva se a tarefa estiver relacionada ao backend real do projeto. O contexto atual aponta Django REST + Firebase como direção do backend.
- Route Handlers do Next podem ser usados como BFF/proxy para o Django, gerenciando cookies e traduzindo respostas.
- Se precisar mockar dados no frontend, deixe claro que é mock temporário e organize de forma fácil de substituir por API.

## 6. Estrutura conhecida do frontend

Estrutura principal:

```txt
frontend/src/app
frontend/src/features
frontend/src/components
frontend/src/schemas
frontend/src/data
frontend/src/types
frontend/public/images
```

Rotas/fluxos já conhecidos:

- `/`: onboarding em slides.
- `/auth?mode=login`: login.
- `/auth?mode=register`: cadastro.
- `/auth?mode=register&intro=1`: cadastro com intro/overlay.
- `/auth/forgot-password`: recuperação de senha.
- `frontend/src/app/(private)/page.tsx`: rota privada ainda vazia ou em evolução.

Antes de criar uma nova rota, verifique se já existe grupo de rotas, feature ou componente equivalente.

## 7. Comandos permitidos e recomendados

Execute comandos dentro de `frontend` quando forem específicos do app frontend.

Comandos conhecidos:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run check
```

Regras de uso:

- Prefira `npm run lint` e `npm run build` para validação quando a tarefa alterar código relevante.
- Não rode `npm run format` ou formatadores globais sem autorização explícita.
- `format:check` pode falhar em vários arquivos por formatação/line endings já existentes; não tente corrigir o projeto inteiro sem alinhamento.
- Se um comando falhar por problema preexistente, registre isso na resposta e separe do que foi causado pela tarefa atual.

## 8. Regras de Git e preservação de trabalho

Antes de alterar arquivos, verifique o estado do repositório quando possível:

```bash
git status --short
```

Regras obrigatórias:

- Nunca reverta mudanças do usuário sem pedido explícito.
- Nunca faça reset, checkout destrutivo, rebase ou limpeza de arquivos sem autorização.
- Não altere arquivos fora do escopo da tarefa.
- Não misture refatoração, formatação ampla e feature na mesma mudança.
- Ao finalizar, mostre resumo dos arquivos alterados e testes/checks executados.
- Se detectar mudanças não relacionadas já existentes, preserve-as e informe que não foram tocadas.

Estado observado anteriormente que deve ser tratado com cuidado:

- `frontend/package.json` modificado.
- `frontend/package-lock.json` modificado.
- `package-lock.json` da raiz deletado.

Essas mudanças podem ser de outro membro da equipe. Não reverta sem confirmação.

## 9. Padrões de código

Siga estes padrões:

- Componentes React em PascalCase.
- Hooks iniciando com `use`.
- Tipos e interfaces com nomes claros e exportados apenas quando necessário.
- Imports internos usando alias `@/*`.
- Dados mockados ou constantes em `data` quando fizer sentido.
- Tipos compartilhados em `types.ts` dentro da feature ou em `src/types` quando globais.
- Schemas compartilhados em `src/schemas`.
- Componentes pequenos, coesos e com responsabilidade clara.
- Evite duplicação visual criando componentes reutilizáveis quando a repetição aparecer em mais de uma tela.
- Prefira nomes semânticos a nomes genéricos como `Box`, `Thing`, `Data`.

Não faça:

- Refatoração ampla sem necessidade direta.
- Troca de biblioteca sem aprovação.
- Mudança de arquitetura por preferência pessoal.
- Código morto, console logs permanentes ou comentários óbvios.

## 10. Padrões de formulário

Formulários devem usar:

- `react-hook-form`;
- `zod` para schemas;
- `zodResolver` quando houver validação;
- mensagens de erro humanas e claras;
- componentes de input compartilhados quando possível.

Para autenticação, usar ou evoluir:

- `frontend/src/schemas/auth.schema.ts`;
- componentes em `frontend/src/features/auth`;
- componentes em `frontend/src/features/signup` quando relacionados ao cadastro.

Não duplique schemas de login, cadastro, recuperação ou senha em componentes isolados se eles pertencem ao domínio de autenticação.

## 11. Padrões visuais

A identidade visual real está em `frontend/src/app/globals.css`.

Tokens principais atuais:

- `primary`: `#f48ba4`
- `secondary`: `#be7ab8`
- `tertiary`: `#8262b6`
- `title`: `#393738`
- `text`: `#646162`
- `buttons`: `#d8748c`
- `neutral`: `#e7e1e2`
- `background`: `#fffafa`

Fontes:

- Títulos: Poppins.
- Textos: Inter.

Direção visual:

- mobile-first;
- acolhedor;
- limpo;
- bordas arredondadas;
- sombras suaves;
- baixo ruído visual;
- linguagem humana e sensível;
- evitar aparência de landing page em telas internas de produto/app.

Ao criar telas internas, priorize experiência de aplicativo, navegação clara e uso com uma mão.

## 12. Tailwind CSS v4

O projeto usa Tailwind CSS v4 com tokens via CSS.

Regras:

- Antes de usar uma classe personalizada, confirme que o token existe no tema/CSS.
- Evite classes inexistentes como `hover:text-buttons` se `buttons` não estiver exposto como cor válida naquele contexto.
- Prefira reutilizar tokens já definidos em `globals.css`.
- Não introduza um novo sistema de tema sem necessidade.
- Não migre para configuração antiga de Tailwind sem pedido explícito.

## 13. Acessibilidade e UX

Toda nova interface deve considerar:

- labels associados a inputs;
- estados de foco visíveis;
- navegação por teclado quando aplicável;
- `aria-*` apenas quando necessário e correto;
- botões com texto/label acessível;
- contraste adequado;
- mensagens de erro compreensíveis;
- animações respeitando `prefers-reduced-motion` quando forem relevantes.

Para o Maia, a UX deve reduzir carga cognitiva:

- uma ação principal por tela;
- textos curtos e acolhedores;
- componentes grandes o suficiente para toque;
- fluxos simples para mães cansadas ou com bebê no colo.

## 14. Produto, saúde e segurança emocional

Como o app lida com dados emocionais sensíveis:

- Não exponha dados pessoais sem necessidade.
- Não crie exemplos com dados reais de pessoas.
- Não use linguagem diagnóstica.
- Não prometa cura, tratamento ou avaliação clínica.
- Em sinais sensíveis, use linguagem de acolhimento e orientação para buscar apoio profissional.
- Na comunidade, prefira ações como “Apoiar” em vez de “Curtir”.

A privacidade e a LGPD são requisitos essenciais do projeto.

## 15. Requisitos funcionais de referência

Tenha em mente estes requisitos do Documento de Visão:

- RF01: gestão multicanal de perfis.
- RF02: check-in de bem-estar.
- RF03: painel de gestão para administrador.
- RF04: publicação de conteúdo técnico por profissional.
- RF05: mural/comunidade de apoio.
- RF06: histórico de jornada.
- RF07: motor de recomendação por tags.
- RF08: dashboard de indicadores.
- RF09: notificações push.
- RF10: diário multimídia com voz e foto como desejável.

Não implemente requisitos grandes de forma improvisada. Para features amplas, proponha etapas pequenas.

## 16. Requisitos não funcionais de referência

Considere sempre:

- Segurança e LGPD.
- Design ergonômico para uso com um polegar.
- Disponibilidade e confiabilidade.
- Performance em redes móveis.
- Escalabilidade futura.

Ao implementar frontend:

- otimize imagens;
- use `next/image` quando aplicável;
- evite dependências pesadas sem justificativa;
- mantenha bundle e carregamento em mente.

## 17. Componentização esperada

Para novas telas, procure separar:

- página/rota: composição e busca de dados;
- feature component: regra específica da funcionalidade;
- UI component: visual reutilizável;
- schema: validação;
- types: contratos TypeScript;
- data: mocks ou constantes temporárias;
- services/api: chamadas externas quando existirem.

Exemplo de organização desejada:

```txt
frontend/src/features/emotional-records/
  components/
  data/
  types.ts
  services.ts
```

A estrutura exata deve seguir o padrão real do repositório no momento da tarefa.

## 18. Integração futura com API

Quando criar funções de API:

- centralize URL base e tratamento de erro;
- preserve autenticação/cookies quando existirem;
- tipar payloads e responses;
- não espalhar `fetch` duplicado sem padrão;
- tratar loading, erro e empty state na UI.

Se o backend ainda não existir:

- use mocks bem isolados;
- nomeie como temporário;
- facilite substituição futura;
- não misture mock com lógica visual de forma irreversível.

## 19. Performance e imagens

O projeto já possui imagens de onboarding grandes.

Regras:

- Use `next/image` para imagens do app.
- Defina `alt` adequado.
- Evite importar imagens grandes sem necessidade.
- Considere dimensões, prioridade e lazy loading conforme o caso.
- Não adicione assets pesados sem avisar.

## 20. Comunicação com a equipe

Ao responder após uma tarefa, seja objetivo e útil para revisão.

Inclua:

- o que foi alterado;
- arquivos principais modificados;
- comandos executados;
- resultado dos comandos;
- pendências ou riscos;
- próximos passos recomendados, quando houver.

Evite:

- respostas vagas como “feito” sem detalhes;
- justificar mudanças sem mostrar impacto;
- esconder falhas de build/lint;
- sugerir grandes reescritas sem necessidade.

## 21. Quando pedir confirmação

Peça confirmação antes de:

- alterar arquitetura;
- instalar/remover dependências;
- rodar formatação global;
- deletar arquivos;
- mudar contratos de API;
- alterar rotas públicas importantes;
- substituir design system;
- mexer em autenticação, segurança ou dados sensíveis;
- fazer mudanças que afetem trabalho de outros membros.

Não peça confirmação para correções pequenas e diretamente solicitadas, desde que sejam seguras e dentro do escopo.

## 22. Fluxo recomendado para cada tarefa

1. Leia a solicitação.
2. Consulte `context.md`.
3. Inspecione arquivos relevantes.
4. Verifique padrões existentes antes de criar novos.
5. Faça a menor alteração suficiente.
6. Rode checks proporcionais à mudança.
7. Revise o diff.
8. Responda com resumo, checks e observações.

## 23. Definition of Done

Uma tarefa só deve ser considerada concluída quando:

- atende ao pedido do usuário;
- não altera arquivos fora do escopo;
- mantém padrões visuais e técnicos do Maia;
- não introduz linguagem clínica/diagnóstica inadequada;
- está tipada corretamente;
- foi validada com checks possíveis;
- falhas conhecidas foram reportadas;
- o diff está limpo e revisável.

## 24. Orientações específicas para Codex Desktop

Ao receber um arquivo pronto para salvar:

- salve exatamente no caminho solicitado;
- não edite outros arquivos;
- rode apenas o diff pedido;
- aguarde revisão antes de prosseguir.

Ao receber uma tarefa de implementação:

- leia `context.md` e este `AGENTS.md`;
- procure arquivos relacionados antes de criar novos;
- preserve mudanças existentes;
- mantenha o trabalho incremental;
- explique qualquer decisão que afete produto, arquitetura ou UX.

## 25. Observações finais

Este arquivo não substitui o `context.md`. Ele define como agentes devem trabalhar. O `context.md` define o que o Maia é, em que estado está e quais decisões já foram tomadas.

Se o projeto evoluir, atualize este arquivo apenas quando houver mudança real nas regras de colaboração, comandos, arquitetura ou padrões da equipe.
