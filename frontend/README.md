# Frontend Maia

Frontend do Maia, uma aplicação web responsiva e mobile-first de apoio emocional para mulheres no puerpério. O app oferece onboarding, autenticação, seleção de perfil de usuária e prepara a base para check-in emocional, histórico, conteúdos recomendados, comunidade e dashboard.

O Maia não substitui atendimento médico, psicológico ou psiquiátrico. Textos e fluxos devem ser acolhedores, não diagnósticos e alinhados à LGPD.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript com `strict: true`
- Tailwind CSS v4 via `@tailwindcss/postcss`
- React Compiler habilitado em `next.config.ts`
- `react-hook-form`
- `zod` e `@hookform/resolvers`
- `lucide-react`
- `@react-input/mask`
- `next/image`
- ESLint, Prettier e TypeScript

## Como instalar

Execute os comandos a partir da raiz do repositório:

```bash
cd frontend
npm install
```

Para instalações limpas em CI ou ambientes descartáveis, use o lockfile:

```bash
cd frontend
npm ci
```

## Comandos disponíveis

Execute dentro de `frontend`:

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

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera build de produção.
- `npm run start`: inicia a build de produção.
- `npm run lint`: roda ESLint.
- `npm run lint:fix`: roda ESLint com correções automáticas.
- `npm run format`: roda Prettier em todo o projeto. Não use sem alinhamento, pois altera muitos arquivos.
- `npm run format:check`: verifica formatação.
- `npm run check`: roda lint, format:check e build em sequência.

## Estrutura de pastas

```txt
frontend/
  public/images/                  # logo e imagens do onboarding
  src/app/                        # App Router, layout global e rotas
    page.tsx                      # onboarding inicial em /
    globals.css                   # tokens visuais e estilos globais
    (public)/auth/page.tsx        # tela unificada de login/cadastro
    (public)/auth/forgot-password # recuperação de senha
    (public)/auth/select-type     # fluxo de seleção de perfil
    (public)/auth/login           # arquivo de rota existe, mas está vazio
    (public)/auth/register        # arquivo de rota existe, mas está vazio
    (private)/page.tsx            # rota privada ainda sem experiência implementada
  src/components/                 # componentes compartilhados
    ui/ProgressBar.tsx
  src/features/                   # features organizadas por domínio
    auth/
    onboarding/
    signup/
    usertypeselection/
  src/lib/                        # utilitários compartilhados
  src/schemas/                    # schemas Zod compartilhados
  src/services/                   # futura camada de serviços/API
  src/types/                      # tipos globais futuros
```

## Rotas e fluxos atuais

- `/`: onboarding em slides.
- `/auth?mode=login`: login na tela unificada.
- `/auth?mode=register`: cadastro na tela unificada.
- `/auth?mode=register&intro=1`: cadastro com overlay/intro.
- `/auth/forgot-password`: recuperação de senha.
- `/auth/select-type`: seleção de tipo de usuário após cadastro.

O fluxo de seleção de tipo usa query string em `/auth/select-type?step=...` para navegar entre etapas de mãe recente, futura mãe, mãe experiente e profissional de saúde.

## Padrões de desenvolvimento

- Componentes React em PascalCase.
- Hooks começando com `use`.
- Imports internos com alias `@/*`.
- Dados estruturados em `data` quando fizer sentido.
- Tipos de feature em `types.ts`; tipos globais em `src/types` quando necessário.
- Schemas compartilhados em `src/schemas`.
- Componentes pequenos e com responsabilidade clara.
- Mocks devem ser tipados, isolados por feature e fáceis de substituir por API.
- Evite refatorações amplas junto com feature ou correção pontual.
- Não crie backend definitivo com Route Handlers do Next.js; o backend planejado é Django REST.
- Use linguagem acolhedora e não diagnóstica.

## Tailwind CSS v4

O projeto usa Tailwind CSS v4 com tokens definidos em `src/app/globals.css` via `@theme inline`.

Tokens de cor expostos atualmente:

- `background`
- `surface`
- `foreground`
- `primary`
- `secondary`
- `tertiary`
- `title`
- `text`
- `primary-hover`
- `neutral`
- `border`
- `success`
- `warning`
- `danger`
- `info`

Antes de usar uma classe customizada, confirme que o token existe em `globals.css`. Por exemplo, `hover:text-buttons` aparece no código, mas `buttons` não está exposto como token Tailwind no estado atual; prefira tokens existentes ou adicione o token de forma explícita e revisável.

## App Router

As rotas ficam em `src/app`. Grupos como `(public)` e `(private)` organizam arquivos, mas não entram na URL.

Tenha cuidado ao criar páginas dentro de route groups: `src/app/(private)/page.tsx` também representa `/`, assim como `src/app/page.tsx`. Antes de evoluir a área autenticada, revise a estratégia de rotas privadas para evitar conflito de rota e deixar claro qual URL renderiza a home autenticada.

## React Hook Form e Zod

Formulários devem usar `react-hook-form` com schemas `zod` e `zodResolver` quando houver validação.

Para autenticação, use ou evolua:

- `src/schemas/auth.schema.ts`
- `src/features/auth/components/AuthInput.tsx`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/ForgotPasswordPage.tsx`
- `src/features/signup/components/SignupForm.tsx`

Tipos de formulário devem ser derivados dos schemas com `z.infer` para manter payload, validação e UI alinhados.

## Pendências conhecidas

- Implementar a experiência autenticada e definir as rotas internas principais (`/home`, `/check-in`, `/historico`, `/conteudos`, `/comunidade`, `/perfil`, `/admin`, `/profissional`).
- Revisar `src/app/(private)/page.tsx`, que retorna `null` e pode conflitar com `/` por estar em route group.
- Revisar ou remover os arquivos vazios de `/auth/login` e `/auth/register`.
- Corrigir `hover:text-buttons` em `LoginForm.tsx`, pois `buttons` não está exposto nos tokens atuais do Tailwind.
- Corrigir o heading de recuperação de senha: há falta de espaço entre `do` e `seu espaço`.
- Substituir stubs de login e recuperação por integração real ou mock explícito.
- Persistir/validar os dados coletados no fluxo de seleção de perfil.
- Definir destino dos botões finais nos fluxos de seleção de perfil.
- Otimizar imagens grandes do onboarding, especialmente `slide3.png` e `slide4.png`.
- Evitar rodar formatação global sem alinhamento, pois `format:check` já foi registrado como sensível a formatação/line endings.
- Resolver a duplicidade de `@babel/runtime` em `dependencies` e `devDependencies` quando houver uma tarefa própria para dependências.

## Capacitor

O Maia também possui projetos nativos gerados com Capacitor 8:

- `android/`: projeto Android (minSdk 24).
- `ios/`: projeto iOS (iOS 15 ou superior).
- `capacitor.config.ts`: configuração compartilhada.
- `native-shell/`: tela local de contingência usada quando nenhuma URL de desenvolvimento foi informada.

O PWA continua funcionando normalmente no navegador. Dentro do aplicativo Capacitor, o convite de instalação PWA e o registro manual do service worker ficam desativados.

Notificações no app nativo usam Firebase Cloud Messaging via `@capacitor/push-notifications`. O arquivo `android/app/google-services.json` precisa existir e corresponder ao package `com.maia.app`; ele foi gerado a partir do app Android "Maia Android" no projeto Firebase `maia-86c23`. No navegador/PWA, o fluxo continua usando Web Push com VAPID.

Como o frontend usa recursos server-side do Next.js, ele não pode ser empacotado como export estático sem uma mudança de arquitetura. Durante o desenvolvimento, o aplicativo nativo deve abrir uma instância acessível do servidor Next:

```powershell
npm run dev -- --hostname 0.0.0.0

# Android Emulator
$env:CAPACITOR_SERVER_URL="http://10.0.2.2:3000"
npm run cap:sync

# Aparelho físico na mesma rede Wi-Fi
$env:CAPACITOR_SERVER_URL="http://SEU-IP-LOCAL:3000"
npm run cap:sync
```

Depois da sincronização:

```powershell
npm run cap:open:android
npm run cap:open:ios
```

Para limpar a URL de desenvolvimento e voltar ao shell local:

```powershell
Remove-Item Env:CAPACITOR_SERVER_URL -ErrorAction SilentlyContinue
npm run cap:sync
```

Comandos adicionais:

```powershell
npm run cap:doctor
npm run cap:copy
npm run cap:run:android
npm run cap:run:ios
```

Para testar notificações no Android:

1. Faça login no app instalado.
2. Abra `/perfil` e ative o switch de notificações.
3. Aceite a permissão do sistema Android.
4. Verifique no backend se uma subscription `provider: "fcm"` foi criada para o usuário.

Requisitos externos:

- Android: Android Studio, Android SDK e JDK compatível.
- iOS: macOS com Xcode; o projeto pode ser gerado no Windows, mas não compilado nem assinado nele.

Antes de publicar nas lojas, confirme o identificador `com.maia.app`, configure assinatura, ícones, splash screen e uma estratégia de produção para servir o frontend. A opção `server.url` deve permanecer restrita a desenvolvimento e live reload.
