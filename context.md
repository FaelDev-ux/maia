# Maia - Contexto do Projeto

Este arquivo funciona como memória operacional e guia de contexto do projeto Maia. Ele deve orientar decisões de produto, UX/UI, frontend, backend, IA e uso de agentes como Codex.

## 1. Política de memória

- Manter este arquivo como fonte curta, prática e atualizada do projeto.
- Priorizar fatos estáveis: visão, escopo, arquitetura, stack, padrões, decisões, riscos e pendências.
- Evitar histórico verboso; registrar o resultado prático e o motivo quando ajudar manutenção futura.
- Preservar alertas sobre estado do Git, bugs conhecidos e convenções até confirmação de resolução.
- Quando o arquivo crescer demais, resumir entradas antigas e manter somente o que influencia decisões futuras.
- Este arquivo não substitui o Documento de Visão acadêmico; ele traduz a visão para decisões práticas de implementação.

## 2. Papel esperado do assistente/agente

- Atuar como engenheiro fullstack e IA sênior, com foco em qualidade, consistência visual, segurança e evolução pragmática.
- Antes de alterar código, entender a estrutura existente e seguir os padrões já adotados.
- Preservar mudanças do usuário e nunca reverter arquivos sem pedido explícito.
- Evitar refatorações amplas sem necessidade direta.
- Priorizar componentização clara, acessibilidade, responsividade e manutenção.
- Explicar decisões de forma didática quando o usuário estiver aprendendo.
- Ao editar com Codex ou outro agente, solicitar diff/revisão antes de mudanças grandes.

## 3. Visão do produto

- Maia é um app de apoio emocional para mulheres no puerpério.
- O objetivo é oferecer acompanhamento contínuo, acolhimento, registro emocional diário, conteúdos personalizados e comunidade segura.
- O produto deve ajudar mães a monitorar humor, sono, energia, sintomas e apoio recebido.
- O sistema interpreta padrões emocionais e gera insights/recomendações sem fazer diagnóstico médico.
- A proposta central é reduzir fricção emocional e oferecer uma rede de apoio acessível, humana e confiável.

## 4. Proposta de valor

- Registro rápido de sentimentos com baixa carga cognitiva.
- Histórico emocional e dashboard com evolução ao longo do tempo.
- Recomendação de conteúdos com base no check-in e nos padrões detectados.
- Comunidade Maia para troca de experiências e apoio entre mães.
- Participação de mentoras/mães experientes e profissionais verificados.
- Segurança, privacidade e linguagem ética como requisitos centrais.

## 5. Perfis de usuário

- PUE: Mãe no puerpério. Usuária principal; registra humor, sono, energia, sintomas, diário e participa da comunidade.
- MMT: Mãe mentora ou mãe experiente. Apoia outras mães, responde pedidos de ajuda e compartilha experiências.
- DSM/DS: Futura mãe ou deseja ser mãe. Consome conteúdos educativos e participa da comunidade para preparação.
- PRO: Profissional de saúde. Usuário verificado; publica conteúdos técnicos, responde dúvidas e orienta a comunidade.
- ADM: Administrador. Gerencia usuários, modera fórum e valida registros profissionais.

## 6. Escopo funcional consolidado

- Autenticação e gestão multicanal de perfis.
- Onboarding inicial e fluxo de entrada acolhedor.
- Login, cadastro e recuperação de senha.
- Check-in de bem-estar: humor, sono, energia/intensidade, ajuda recebida e observação opcional.
- Histórico de jornada emocional.
- Dashboard de indicadores e gráficos de tendências.
- Motor de recomendação baseado em tags do check-in e conteúdos cadastrados.
- Biblioteca de conteúdos educativos.
- Artigos/conteúdos técnicos publicados por profissionais.
- Mural da comunidade com posts, apoio e respostas.
- Notificações push para lembretes e respostas.
- Painel de gestão para administrador.
- Verificação de profissionais de saúde.
- Diário multimídia com voz e foto é desejável, não prioridade inicial.

## 7. Priorização do MVP

### Essencial

- Login/cadastro com sessão segura.
- Diferenciação básica de perfis.
- Check-in emocional diário.
- Histórico emocional.
- Comunidade/mural de apoio em versão inicial.
- Notificações/lembretes em versão simples.
- Segurança e privacidade/LGPD.
- UX mobile-first e uso com uma mão.

### Importante

- Dashboard com indicadores visuais.
- Motor de recomendação por regras/tags.
- Conteúdos recomendados com base no check-in.
- Performance adequada em rede móvel.
- Escalabilidade básica de arquitetura.

### Desejável

- Diário multimídia com áudio/foto.
- Recomendações mais inteligentes.
- Streaks, exportação de dados e relatórios.
- Integrações externas para validação profissional.

## 8. Restrições e cuidados éticos

- O Maia não substitui atendimento médico, psicológico ou psiquiátrico.
- O sistema nunca deve afirmar diagnóstico, como “você está com depressão” ou “você tem ansiedade”.
- Preferir linguagem: “identificamos um padrão”, “isso tem aparecido com frequência”, “considere buscar apoio profissional se persistir”.
- Dados emocionais são sensíveis e devem ser tratados com privacidade, segurança e transparência.
- Comunidade deve permitir anonimato ou identidade protegida quando possível.
- No mock local atual, profissionais de saúde iniciam com status em análise e não são bloqueadas; o status aparece como flag na comunidade e no painel. Na versão com backend, a validação administrativa deve continuar registrada.
- O app depende de internet para sincronização, conteúdos e comunidade.
- Há conflito no Documento de Visão ao citar dispositivos móveis/desktop e “não versão web”, enquanto o projeto atual usa Next.js. Decisão prática atual: tratar como aplicação web responsiva/mobile-first, com possibilidade futura de PWA ou empacotamento mobile.

## 9. Stack atual do frontend

- App principal em `frontend`.
- Next.js 16 com App Router.
- React 19.
- TypeScript com `strict: true`.
- Tailwind CSS v4 via `@tailwindcss/postcss`.
- React Compiler habilitado em `frontend/next.config.ts`.
- Formulários com `react-hook-form`.
- Validação com `zod` e `zodResolver`.
- Ícones com `lucide-react`.
- Máscaras de input com `@react-input/mask`.
- Imagens com `next/image`.

## 10. Backend planejado

- Decisão atual confirmada: usar Django REST + Firebase.
- Django REST será a camada HTTP/API principal do backend.
- Firebase Authentication gerencia credenciais, login e tokens de usuário.
- Cloud Firestore será usado como banco principal para perfis, check-ins, comunidade, conteúdos e dados operacionais.
- Arquitetura BFF: o navegador consome apenas rotas internas Next.js (`/api/...`), e o servidor Next chama o Django REST.
- O backend Django deve permanecer oculto do client; Server Components podem buscar dados diretamente no Django pelo servidor.
- Autenticação usa cookies httpOnly gerenciados pelo Next; não usar localStorage/sessionStorage, Auth.js ou Firebase Auth no frontend para autenticação.
- Evitar acoplar regras de negócio críticas apenas no frontend.
- Enquanto endpoints reais não estiverem completos, usar mocks tipados e isolados por feature.

### Backend em Cloud Run

- O backend Django REST está publicado no Google Cloud Run.
- Projeto Google Cloud: `maia-86c23`.
- Região: `southamerica-east1` (São Paulo).
- Serviço: `maia-backend`.
- URL canônica do serviço: `https://maia-backend-33fbqbgqka-rj.a.run.app`.
- URL alternativa impressa pelo deploy e também funcional: `https://maia-backend-325650050541.southamerica-east1.run.app`.
- O frontend hospedado na Vercel deve usar `MAIA_BACKEND_URL=https://maia-backend-33fbqbgqka-rj.a.run.app`.
- Não usar `NEXT_PUBLIC_` para `MAIA_BACKEND_URL`; essa variável deve ficar disponível apenas no servidor Next/BFF.
- Secrets do backend ficam no Google Secret Manager:
  - `maia-firebase-service-account`
  - `maia-django-secret-key`
  - `maia-firebase-web-api-key`
- Arquivos locais sensíveis continuam ignorados pelo Git: `backend/.env` e `backend/firebase.json`.
- O script de deploy do backend é `backend/scripts/deploy-cloud-run.ps1`.

Para subir uma nova versão do backend no Cloud Run:

```powershell
cd C:\Users\tiora\OneDrive\Documentos\GitHub\maia\backend
.\scripts\deploy-cloud-run.ps1
```

Pré-requisitos do deploy:

```powershell
gcloud auth login
gcloud config set project maia-86c23
```

O script:

- habilita APIs necessárias do Google Cloud;
- cria ou atualiza versões dos secrets no Secret Manager;
- concede `roles/secretmanager.secretAccessor` para a service account da revisão do Cloud Run;
- faz build a partir do `backend/Dockerfile`;
- publica o serviço `maia-backend` na região `southamerica-east1`.

Validação já realizada em produção:

- Vercel frontend -> Next BFF -> Cloud Run Django -> Firebase.
- Cadastro real pelo frontend: OK.
- Login real pelo frontend: OK.
- Logout com limpeza de cookies: OK.
- `/api/auth/me` com cookie httpOnly: OK.
- Rota protegida sem sessão redireciona para login: OK.
- Rota pública com sessão redireciona para `/home`: OK.

## 11. Estrutura atual conhecida

- `frontend/src/app`: rotas e layout global.
- `frontend/src/app/page.tsx`: renderiza onboarding.
- `frontend/src/app/(public)/auth/page.tsx`: tela unificada de login/cadastro.
- `frontend/src/app/(public)/auth/forgot-password/page.tsx`: recuperação de senha.
- `frontend/src/app/(private)/page.tsx`: rota privada ainda vazia.
- `frontend/src/features/onboarding`: onboarding inicial.
- `frontend/src/features/auth`: login, input compartilhado e recuperação.
- `frontend/src/features/signup`: cadastro, campos e intro por arraste.
- `frontend/src/schemas/auth.schema.ts`: schemas de autenticação e tipos derivados.
- `frontend/public/images`: logo e imagens usadas no onboarding.

## 12. Padrões de organização

- Componentes React em PascalCase.
- Dados estruturados separados em `data`.
- Tipos compartilhados em `types.ts` dentro da feature ou em `src/types` quando globais.
- Schemas compartilhados em `src/schemas`.
- Imports internos com alias `@/*`.
- Preferir componentes pequenos, com responsabilidade clara.
- Separar componentes de UI genéricos de componentes específicos de feature.
- Formularios com validação devem usar `react-hook-form` + `zodResolver`.
- Evitar lógica de API espalhada em componentes; criar camada de serviços quando necessário.

## 13. Rotas e fluxos atuais

- `/`: onboarding em slides com botão final para `/auth?mode=register&intro=1`.
- `/auth?mode=login`: login.
- `/auth?mode=register`: cadastro na tela unificada.
- `/auth?mode=register&intro=1`: cadastro com `SignupIntroGate` como overlay inicial.
- `/auth/forgot-password`: recuperação de senha.
- `SignupPage` existe como fluxo de cadastro com cover por arraste, mas atualmente não está ligado a uma rota.
- `(private)/page.tsx` existe, mas ainda está vazio.

## 14. Rotas planejadas do produto

- `/home`: dashboard inicial e check-in rápido.
- `/check-in` ou `/sentimentos/novo`: registro emocional completo.
- `/historico` ou `/sentimentos/historico`: histórico de jornada.
- `/conteudos`: biblioteca e recomendações.
- `/conteudos/[id]`: leitura de artigo/conteúdo.
- `/comunidade`: mural da comunidade.
- `/comunidade/[id]`: detalhes do post e respostas.
- `/perfil`: dados da usuária, resumo e preferências.
- `/admin`: painel administrativo futuro.
- `/profissional`: painel de profissional futuro.

## 15. Identidade visual implementada

Fonte visual principal: `frontend/src/app/globals.css` e export das telas principais do Figma.

### Cores atuais

- `primary`: `#f48ba4`
- `secondary`: `#be7ab8`
- `tertiary`: `#8262b6`
- `title`: `#393738`
- `text`: `#646162`
- `buttons`: `#d8748c`
- `neutral`: `#e7e1e2`
- `background`: `#fffafa`

### Tipografia

- Títulos: Poppins.
- Textos: Inter.
- Títulos usam peso 600 e line-height compacto.
- Texto deve preservar legibilidade, acolhimento e boa leitura em mobile.

### Tokens

- `--radius-maia`: `1rem`.
- `--radius-maia-lg`: `1.5rem`.
- `--radius-maia-xl`: `2rem`.
- `--shadow-soft`: `0 16px 48px rgb(57 55 56 / 0.12)`.
- `--shadow-card`: `0 12px 30px rgb(140 64 84 / 0.14)`.
- `--shadow-button`: `0 10px 20px rgb(140 64 84 / 0.22)`.

## 16. Diretrizes visuais

- Visual acolhedor, suave, arredondado e emocionalmente seguro.
- Fundo claro quente, evitando branco frio quando possível.
- Gradientes rosa/lilás/roxo podem ser usados em áreas de destaque.
- Botões e formulários devem ter cantos bem arredondados.
- Cards com sombra leve e espaçamento confortável.
- Evitar excesso de elementos por tela.
- Uma ação principal por tela sempre que possível.
- Em telas internas do app, evitar aparência de landing page.
- Manter experiência mobile-first, mas responsiva para desktop.
- Considerar uso com uma mão/polegar, principalmente em check-in e navegação inferior.

## 17. Telas do protótipo/Figma consideradas

- Onboarding inicial.
- Start/entrada.
- Login.
- Cadastro.
- Home 1, Home 2 e Home 3.
- Comunidade.
- Artigo/conteúdo.
- Perfil 1 e Perfil 2.
- Arquivo visual amplo `Maia.png` com visão geral das telas.
- Usar o link do Figma como referência complementar e os PNGs exportados como fonte visual mais confiável.

## 18. UX e linguagem

- Linguagem deve ser humana, acolhedora e sem julgamento.
- Exemplos de tom: “Como você está hoje?”, “Você não está sozinha”, “Tudo bem ter dias difíceis”, “Um passo de cada vez”.
- Em alertas: evitar medo; preferir orientação cuidadosa.
- Em comunidade: usar “Apoiar” em vez de “Curtir”.
- Feedbacks devem ser suaves, com microinterações discretas.
- Respeitar `prefers-reduced-motion`; animações devem ser desativáveis.

## 19. Check-in emocional

Dados desejados no registro:

- Humor principal.
- Intensidade/energia em escala simples.
- Sono ou qualidade do sono.
- Ajuda externa ou apoio recebido.
- Sentimentos secundários/sintomas, quando aplicável.
- Observação livre opcional.
- Data automática.
- Futuramente: anexos de voz/foto.

## 20. Motor de padrões e recomendação

- MVP pode usar regras simples, não IA pesada.
- Cruzar frequência, intensidade, persistência, sono e tags do conteúdo.
- Exemplo: ansiedade recorrente + intensidade alta recomenda conteúdos sobre respiração e ansiedade no pós-parto.
- Exemplo: sono baixo + cansaço frequente recomenda descanso possível e rede de apoio.
- Insights devem ser semanais ou contextuais, limitados em quantidade para não sobrecarregar.
- Sempre usar linguagem não diagnóstica.

## 21. Conteúdos

- Conteúdos devem ter título, resumo, categoria, tags, tempo de leitura e corpo.
- No escopo atual do frontend/local, conteúdos técnicos de profissionais são posts de orientação na comunidade; a biblioteca segue como conteúdo editorial/mockado.
- Usuárias recebem conteúdos com base no check-in, perfil e padrões.
- Tela de artigo deve ser confortável para leitura mobile.

## 22. Comunidade

- Comunidade é espaço de apoio, troca de experiências e pedidos de ajuda.
- PUE, DSM e MMT participam diretamente.
- PRO pode publicar posts de orientação geral e responder dúvidas técnicas na comunidade, sempre sem diagnóstico individual.
- ADM modera fórum e usuários.
- Deve haver cuidado contra exposição indevida, julgamento, spam e conselhos perigosos.

## 23. Requisitos não funcionais

- Segurança e LGPD são essenciais.
- Interface deve ser ergonômica para uso com uma mão.
- Performance: conteúdos devem carregar rapidamente em redes móveis.
- Disponibilidade é importante, principalmente para uso em horários sensíveis, como madrugada.
- Arquitetura deve permitir crescimento da base de usuários e dados.

## 24. Comandos conhecidos

Executar dentro de `frontend` quando aplicável:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`
- `npm run check`

## 25. Estado de validação conhecido

- `npm run lint`: passou na última varredura registrada.
- `npm run build`: passou na última varredura registrada.
- `npm run format:check`: falhou em 29 arquivos por formatação/line endings.
- Não rodar formatação ampla sem alinhamento, pois pode tocar muitos arquivos.

## 26. Estado do Git observado

- Branch: `main`, acompanhando `origin/main`.
- Mudanças existentes antes da criação do contexto operacional anterior:
  - `frontend/package.json` modificado.
  - `frontend/package-lock.json` modificado.
  - `package-lock.json` da raiz deletado.
- Essas mudanças não foram feitas pelo assistente e devem ser preservadas.

## 27. Pendências e riscos conhecidos

- `LoginForm.tsx` usa `hover:text-buttons`, mas `buttons` pode não estar acessível como classe Tailwind válida no tema atual.
- `ForgotPasswordPage.tsx` tem texto sem espaço entre `do` e `seu espaço` no heading.
- `onSubmit` de login, cadastro e recuperação ainda é stub com `Promise.resolve()`.
- Imagens de onboarding são grandes; `slide3.png` e `slide4.png` podem afetar performance.
- `README.md` de `frontend` está vazio.
- `(private)/page.tsx` ainda não implementa a experiência autenticada.
- Documento de Visão ainda contém trechos incompletos como placeholders de diagramas/referências.
- Necessário alinhar nomenclaturas: DSM, DS, futura mãe e deseja ser mãe.
- Necessário decidir rotas finais internas antes de conectar navegação.

## 28. Decisões práticas atuais

- Manter a tela unificada de autenticação em `/auth` por enquanto.
- Usar `src/schemas/auth.schema.ts` para centralizar validações de autenticação.
- Reaproveitar componentes de input entre login, cadastro e recuperação quando fizer sentido.
- Priorizar construção das telas internas do produto após autenticação visual.
- Usar mocks tipados até existir contrato real da API Django REST + Firebase.
- Buscar imagens de perfil mockadas a partir de `frontend/src/data/authenticated-user.ts`; telas internas não devem hardcodar avatar de usuária em mocks de feature.
- Considerar `context.md` como memória do projeto e futuro `AGENTS.md` como instrução específica para Codex/agentes.

## 29. Próximos passos recomendados

1. Revisar este arquivo e salvar na raiz do repositório como `context.md`.
2. Criar `AGENTS.md` para orientar Codex Desktop.
3. Corrigir pendências pequenas de UI/texto (`hover:text-buttons`, heading da recuperação).
4. Definir rotas privadas principais e navegação inferior.
5. Implementar Home autenticada com base no Figma.
6. Criar componentes base reutilizáveis: Button, Input, Card, Badge, BottomNavigation.
7. Criar mocks tipados de check-in, conteúdos, posts e perfil.
8. Integrar com API real quando o backend Django REST + Firebase estiver disponível.

## 30. Registro de mudanças

- 2026-05-27: Criado contexto operacional inicial com estado do frontend, padrões, riscos e comandos.
- 2026-05-28: Incorporado Documento de Visão do Maia, perfis de usuário, requisitos funcionais/não funcionais, stack planejada com Django REST e referência ao Figma/export das telas principais.
- 2026-06-02: Centralizada a imagem de perfil mockada em `frontend/src/data/authenticated-user.ts`; dashboards e telas internas devem ler avatar de usuária desse mock global.
- 2026-06-08: Confirmada direção de backend Django REST + Firebase; Django REST será a API principal, com Firebase Authentication e Firestore como serviços de autenticação e dados.
- 2026-06-08: Backend Django publicado no Google Cloud Run como `maia-backend` em `southamerica-east1`; frontend Vercel validado consumindo o backend via Next BFF com cookies httpOnly.
