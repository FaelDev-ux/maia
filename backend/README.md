# Backend Maia

Backend Django REST do Maia usando Firebase Admin para Firebase Authentication e Cloud Firestore.

## Setup local

1. Crie e ative um ambiente virtual Python.
2. Instale as dependencias:

```bash
pip install -r requirements.txt
```

3. Copie `.env.example` para `.env` e ajuste os valores.
4. Coloque a credencial de service account do Firebase no caminho configurado em `FIREBASE_CREDENTIALS_FILE`.
   Por padrao, o projeto procura `backend/firebase.json`, que esta ignorado pelo Git.
5. Configure `FIREBASE_WEB_API_KEY` com a chave Web API do projeto Firebase.
6. Rode:

```bash
python manage.py check
python manage.py runserver
```

## Arquitetura acordada

- Django REST e a camada HTTP principal do backend.
- Firebase Authentication gerencia credenciais e tokens de usuario.
- Firestore guarda perfis, check-ins, comunidade, conteudos e dados operacionais.
- O navegador nao deve chamar este backend diretamente; o Next.js atua como BFF nas rotas internas `/api/...`.
- Cookies httpOnly sao definidos pelo Next, nao pelo Django.
- Senhas nunca devem ser salvas no Firestore.
- Dados emocionais devem permanecer privados e protegidos por autorizacao por UID.

## Endpoints iniciais

Os contratos completos e padroes de payload do MVP estao em `ENDPOINTS.MD`.

- `POST /api/cadastro/`: cria usuario no Firebase Auth e documento em `users/{uid}`.
- `POST /api/login/`: autentica com Firebase Authentication e devolve tokens para o BFF.
- `POST /api/logout/`: encerra a sessao logica.
- `GET /api/me/`: retorna o usuario autenticado.
- `GET /api/usuario/<uid>/`: retorna perfil do usuario autenticado.
- `PUT /api/usuario/<uid>/`: atualiza dados basicos do perfil.
- `DELETE /api/usuario/<uid>/`: marca a conta como `pending-deletion` e desativa o login.

As rotas protegidas exigem header:

```txt
Authorization: Bearer <firebase-id-token>
```

## Contrato de cadastro

O backend aceita o contrato atual do frontend:

```json
{
  "name": "Usuaria Maia",
  "email": "usuario@example.com",
  "phone": "(85) 99999-9999",
  "birthDate": "1995-05-12",
  "password": "senha-segura",
  "profileCode": "PUE"
}
```

Tambem aceita temporariamente aliases antigos em portugues, como `senha`, `nome_completo`, `telefone` e `data_nascimento`.

## Deploy no Google Cloud Run

Configuracao recomendada:

- Projeto: `maia-86c23`
- Regiao: `southamerica-east1`
- Servico: `maia-backend`
- Porta do container: `8080`
- Min instances: `0`
- Max instances: `3`
- Secrets no Secret Manager:
  - `maia-firebase-service-account`
  - `maia-django-secret-key`
  - `maia-firebase-web-api-key`

O deploy pode ser iniciado com:

```powershell
.\scripts\deploy-cloud-run.ps1
```

Antes do deploy, faca login no Google Cloud:

```powershell
gcloud auth login
gcloud config set project maia-86c23
```

O script usa `backend/firebase.json` e `backend/.env` locais para criar ou atualizar secrets no Secret Manager. Esses arquivos continuam ignorados pelo Git.
