from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from .authentication import FirebaseAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth, firestore

class CadastroUsuarioView(APIView):
    def post(self, request):
        # 1. Pegamos os dados que vieram do formulário (Front-End)
        dados = request.data
        email = dados.get('email')
        senha = dados.get('senha')
        nome_completo = dados.get('nome_completo')
        telefone = dados.get('telefone')
        data_nascimento = dados.get('data_nascimento')

        # Validação básica
        if not email or not senha:
            return Response({'erro': 'E-mail e senha são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 2. Cria o usuário no Firebase Authentication (Apenas e-mail e senha)
            user_record = auth.create_user(
                email=email,
                password=senha,
                display_name=nome_completo
            )

            # 3. Prepara os dados extras para o Banco de Dados (Firestore)
            db = firestore.client()
            
            # Seguindo a estrutura do seu documento AGENTS.md
            user_data = {
                'id': user_record.uid,
                'authUid': user_record.uid,
                'fullName': nome_completo,
                'email': email,
                'phone': telefone,
                'birthDate': data_nascimento,
                'profileCode': 'PUE', # Padrão: Mãe no puerpério
                'status': 'active',
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
            }

            # Salva o documento na coleção 'users' usando o UID como nome do arquivo
            db.collection('users').document(user_record.uid).set(user_data)

            return Response({
                'mensagem': 'Usuário criado com sucesso no Maia!',
                'uid': user_record.uid
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Se algo der errado (ex: e-mail já existe), devolvemos o erro
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class UsuarioDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]
    # 1. READ (GET) - Buscar os dados de uma usuária específica
    def get(self, request, uid):
        try:
            db = firestore.client()
            # Procura o documento na coleção 'users' com o UID fornecido
            user_ref = db.collection('users').document(uid)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return Response({'erro': 'Usuária não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

            # Retorna os dados salvos no Firestore
            return Response(user_doc.to_dict(), status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'erro': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 2. UPDATE (PUT) - Atualizar os dados da usuária (Nome, Telefone, Data de Nascimento)
    def put(self, request, uid):
        try:
            db = firestore.client()
            user_ref = db.collection('users').document(uid)
            
            if not user_ref.get().exists:
                return Response({'erro': 'Usuária não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

            dados = request.data
            
            # Mapeia apenas os campos que o formulário do front-end permite alterar
            dados_atualizados = {
                'fullName': dados.get('nome_completo'),
                'phone': dados.get('telefone'),
                'birthDate': dados.get('data_nascimento'),
                'updatedAt': firestore.SERVER_TIMESTAMP, # Data de modificação automática
            }

            # Remove chaves vazias para não sobrescrever dados com None por engano
            dados_atualizados = {k: v for k, v in dados_atualizados.items() if v is not None}

            # Atualiza apenas os campos enviados no Firestore
            user_ref.update(dados_atualizados)

            # Opcional: Atualizar também o Nome de Exibição no Firebase Auth para manter sincronizado
            if dados.get('nome_completo'):
                auth.update_user(uid, display_name=dados.get('nome_completo'))

            return Response({'mensagem': 'Perfil atualizado com sucesso!'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 3. DELETE (DELETE) - Exclusão lógica ou física
    # Seguindo o teu AGENTS.md, vamos fazer uma desativação/exclusão lógica (mudar status para 'deleted')
    # para preservar a integridade histórica dos check-ins se necessário, mas bloqueando o acesso.
    def delete(self, request, uid):
        try:
            db = firestore.client()
            user_ref = db.collection('users').document(uid)

            if not user_ref.get().exists:
                return Response({'erro': 'Usuária não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

            # Exclusão Lógica no Firestore (muda status e adiciona data de exclusão)
            user_ref.update({
                'status': 'deleted',
                'deletedAt': firestore.SERVER_TIMESTAMP
            })

            # Exclusão Física no Firebase Auth (Impede que ela consiga fazer login novamente)
            auth.delete_user(uid)

            return Response({'mensagem': 'Conta eliminada com sucesso do sistema Maia.'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        