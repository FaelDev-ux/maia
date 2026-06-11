import mimetypes
import json
import unicodedata
import uuid
from collections import Counter
from datetime import datetime, timedelta
from urllib.parse import quote
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from firebase_admin import exceptions as firebase_exceptions
from firebase_admin import messaging
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import FirebaseAuthentication
from .firebase import (
    FirebaseNotConfiguredError,
    get_firebase_auth,
    get_firestore_client,
    get_storage_bucket,
    server_timestamp,
)
from .permissions import user_is_admin


CHECK_IN_COLLECTION = "checkIns"
CONTENT_COLLECTION = "contents"
COMMUNITY_POST_COLLECTION = "communityPosts"
COMMUNITY_COMMENT_COLLECTION = "communityComments"
COMMUNITY_SUPPORT_COLLECTION = "communitySupports"
NOTIFICATION_SUBSCRIPTION_COLLECTION = "notificationSubscriptions"
ADMIN_ACTION_COLLECTION = "adminActions"

CONTENT_IMAGE_PRESETS = {
    "sono": {
        "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Bebe dormindo tranquilo com manta clara",
    },
    "respiracao": {
        "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Pessoa respirando com calma em ambiente iluminado",
    },
    "apoio": {
        "imageUrl": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Maos unidas representando rede de apoio",
    },
    "preparacao": {
        "imageUrl": "https://images.unsplash.com/photo-1537673156864-5d2c72de7824?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Quarto de bebe preparado com luz suave",
    },
    "default": {
        "imageUrl": "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Mae segurando um bebe em momento de cuidado",
    },
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
NATIVE_NOTIFICATION_PROVIDERS = {"fcm"}
WEB_NOTIFICATION_PROVIDER = "webpush"

SEED_CONTENTS = [
    {
        "id": "navegando-nas-emocoes",
        "title": "Navegando nas emoções do puerpério.",
        "summary": "Compreender e acolher o universo emocional intenso dos primeiros meses após o nascimento.",
        "category": "Autocuidado",
        "tags": [
            "emoções",
            "puerpério",
            "autocompaixão",
            "bem-estar mental"
        ],
        "readTime": "9 min de leitura",
        "readingTimeMinutes": 9,
        "imageUrl": "https://images.unsplash.com/photo-1543342384-1f1350e27861?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mãe segurando seu bebê com expressão acolhedora.",
        "quote": "O cuidado com o bebê começa pelo cuidado com a mãe. Você não precisa ser perfeita, você só precisa ser você.",
        "sections": [
            {
                "paragraphs": [
                    "O período pós-parto é uma das transformações mais profundas na vida de uma mulher. Segundo o Ministério da Saúde, o puerpério compreende as primeiras 6 a 8 semanas após o parto, mas as adaptações emocionais podem durar meses. Seu corpo passou por mudanças extraordinárias, seus hormônios estão se reorganizando e sua identidade está se recalibrando — o que os especialistas chamam de 'matrescence', o processo de tornar-se mãe.",
                    "Você pode se sentir feliz e cansada. Grata e sobrecarregada. Apaixonada e ansiosa. Tudo ao mesmo tempo. Essas emoções não indicam fraqueza: indicam que você está vivendo uma transição real e complexa. A OMS reconhece o puerpério como um período de alta vulnerabilidade emocional que requer atenção e apoio estruturado."
                ]
            },
            {
                "title": "Por que as emoções são tão intensas agora?",
                "paragraphs": [
                    "Após o parto, o corpo experimenta uma queda abrupta de hormônios como estrogênio e progesterona — que estavam em níveis altíssimos durante a gestação. Simultaneamente, há ajustes nos níveis de ocitocina, prolactina, cortisol e serotonina, neurotransmissores que influenciam diretamente humor, apego e bem-estar. O Caderno de Atenção Básica nº 32 do Ministério da Saúde destaca essas alterações hormonais como causas primárias de instabilidade emocional no pós-parto.",
                    "Além da bioquímica, o sono fragmentado, a responsabilidade constante, a mudança de identidade e as expectativas sociais contribuem para um cenário emocional muito diferente do que você viveu antes. Reconhecer essas causas ajuda a lidar com os sentimentos sem se culpar."
                ]
            },
            {
                "title": "Baby Blues: normal e esperado",
                "paragraphs": [
                    "Entre 50% e 80% das mulheres experimentam o chamado 'baby blues' nos primeiros 3 a 5 dias após o parto, segundo a FEBRASGO. Os sintomas incluem choro sem motivo aparente, irritabilidade, ansiedade leve e oscilações de humor. É causado principalmente pela queda hormonal e costuma se resolver espontaneamente em até duas semanas, sem necessidade de tratamento específico.",
                    "Se os sintomas persistirem além de duas semanas ou se intensificarem, pode ser um sinal de depressão pós-parto — uma condição diferente e que requer avaliação profissional. Veja o artigo específico sobre DPP nesta seção."
                ]
            },
            {
                "title": "Práticas de Autocompaixão",
                "paragraphs": [
                    "Autocompaixão não é egoísmo: é um requisito para cuidar bem do bebê e de si. Pesquisas da psicóloga Kristin Neff, referência mundial no tema, mostram que mulheres com maior autocompaixão têm menos depressão pós-parto e melhor qualidade de apego com o bebê. Aqui estão formas concretas de integrar isso ao seu dia a dia:"
                ],
                "items": [
                    {
                        "title": "Aceite ajuda sem culpa:",
                        "text": "Delegar tarefas não é fraqueza. Seja alguém lavar roupa, preparar comida ou cuidar do bebê enquanto você dorme. O Ministério da Saúde recomenda explicitamente que a rede de apoio familiar seja ativada nos primeiros 40 dias."
                    },
                    {
                        "title": "Nomeie seus sentimentos:",
                        "text": "Em vez de 'estou fraca', tente 'estou cansada' ou 'sinto medo'. A técnica de nomeação emocional ('affect labeling'), estudada pela neurociência, ativa o córtex pré-frontal e reduz a intensidade da resposta emocional na amígdala."
                    },
                    {
                        "title": "Pequenos rituais restauradores:",
                        "text": "Um banho quente, cinco minutos sozinha, respiração consciente, um chá favorito. Momentos curtos que restauram sua presença e regulam o sistema nervoso autônomo."
                    },
                    {
                        "title": "Converse com pessoas de confiança:",
                        "text": "Compartilhar suas emoções reduz o isolamento e te lembra que outras mães vivem sentimentos semelhantes. O suporte social é um dos maiores fatores protetores contra a depressão pós-parto, segundo revisões sistemáticas da Cochrane."
                    }
                ]
            },
            {
                "title": "Quando buscar orientação profissional",
                "paragraphs": [
                    "Se você perceber tristeza persistente por mais de duas semanas, dificuldade intensa em adormecer (além do necessário para o bebê), perda de interesse em atividades que gostava, sentimentos de desesperança, pensamentos intrusivos ou dificuldade em se conectar com o bebê, converse com seu profissional de saúde. O rastreio com a Escala de Depressão Pós-Natal de Edimburgo (EPDS) é recomendado pelo Ministério da Saúde na consulta puerperal. Buscar ajuda não é fraqueza: é sabedoria e é cuidado."
                ]
            }
        ],
        "body": "O período pós-parto é uma das transformações mais profundas na vida de uma mulher. Segundo o Ministério da Saúde, o puerpério compreende as primeiras 6 a 8 semanas após o parto, mas as adaptações emocionais podem durar meses. Seu corpo passou por mudanças extraordinárias, seus hormônios estão se reorganizando e sua identidade está se recalibrando — o que os especialistas chamam de 'matrescence', o processo de tornar-se mãe.\n\nVocê pode se sentir feliz e cansada. Grata e sobrecarregada. Apaixonada e ansiosa. Tudo ao mesmo tempo. Essas emoções não indicam fraqueza: indicam que você está vivendo uma transição real e complexa. A OMS reconhece o puerpério como um período de alta vulnerabilidade emocional que requer atenção e apoio estruturado.\n\nPor que as emoções são tão intensas agora?\n\nApós o parto, o corpo experimenta uma queda abrupta de hormônios como estrogênio e progesterona — que estavam em níveis altíssimos durante a gestação. Simultaneamente, há ajustes nos níveis de ocitocina, prolactina, cortisol e serotonina, neurotransmissores que influenciam diretamente humor, apego e bem-estar. O Caderno de Atenção Básica nº 32 do Ministério da Saúde destaca essas alterações hormonais como causas primárias de instabilidade emocional no pós-parto.\n\nAlém da bioquímica, o sono fragmentado, a responsabilidade constante, a mudança de identidade e as expectativas sociais contribuem para um cenário emocional muito diferente do que você viveu antes. Reconhecer essas causas ajuda a lidar com os sentimentos sem se culpar.\n\nBaby Blues: normal e esperado\n\nEntre 50% e 80% das mulheres experimentam o chamado 'baby blues' nos primeiros 3 a 5 dias após o parto, segundo a FEBRASGO. Os sintomas incluem choro sem motivo aparente, irritabilidade, ansiedade leve e oscilações de humor. É causado principalmente pela queda hormonal e costuma se resolver espontaneamente em até duas semanas, sem necessidade de tratamento específico.\n\nSe os sintomas persistirem além de duas semanas ou se intensificarem, pode ser um sinal de depressão pós-parto — uma condição diferente e que requer avaliação profissional. Veja o artigo específico sobre DPP nesta seção.\n\nPráticas de Autocompaixão\n\nAutocompaixão não é egoísmo: é um requisito para cuidar bem do bebê e de si. Pesquisas da psicóloga Kristin Neff, referência mundial no tema, mostram que mulheres com maior autocompaixão têm menos depressão pós-parto e melhor qualidade de apego com o bebê. Aqui estão formas concretas de integrar isso ao seu dia a dia:\n\nAceite ajuda sem culpa: Delegar tarefas não é fraqueza. Seja alguém lavar roupa, preparar comida ou cuidar do bebê enquanto você dorme. O Ministério da Saúde recomenda explicitamente que a rede de apoio familiar seja ativada nos primeiros 40 dias.\n\nNomeie seus sentimentos: Em vez de 'estou fraca', tente 'estou cansada' ou 'sinto medo'. A técnica de nomeação emocional ('affect labeling'), estudada pela neurociência, ativa o córtex pré-frontal e reduz a intensidade da resposta emocional na amígdala.\n\nPequenos rituais restauradores: Um banho quente, cinco minutos sozinha, respiração consciente, um chá favorito. Momentos curtos que restauram sua presença e regulam o sistema nervoso autônomo.\n\nConverse com pessoas de confiança: Compartilhar suas emoções reduz o isolamento e te lembra que outras mães vivem sentimentos semelhantes. O suporte social é um dos maiores fatores protetores contra a depressão pós-parto, segundo revisões sistemáticas da Cochrane.\n\nQuando buscar orientação profissional\n\nSe você perceber tristeza persistente por mais de duas semanas, dificuldade intensa em adormecer (além do necessário para o bebê), perda de interesse em atividades que gostava, sentimentos de desesperança, pensamentos intrusivos ou dificuldade em se conectar com o bebê, converse com seu profissional de saúde. O rastreio com a Escala de Depressão Pós-Natal de Edimburgo (EPDS) é recomendado pelo Ministério da Saúde na consulta puerperal. Buscar ajuda não é fraqueza: é sabedoria e é cuidado.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "puerpério.",
        "badge": "Destaque"
    },
    {
        "id": "sono-descanso-puerperio",
        "title": "Sono e descanso no puerpério: restaurando sua energia.",
        "summary": "Estratégias práticas para melhorar qualidade do descanso em meio às demandas do bebê.",
        "category": "Sono e Repouso",
        "tags": [
            "sono",
            "descanso",
            "recuperação",
            "energia"
        ],
        "readTime": "10 min de leitura",
        "readingTimeMinutes": 10,
        "imageUrl": "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mulher descansando tranquilamente, representando sono no puerpério.",
        "quote": "Dormir não é luxo durante o puerpério: é recuperação essencial. Cada hora de sono restaura sua mente e corpo.",
        "sections": [
            {
                "paragraphs": [
                    "Dormir com um bebê recém-nascido é um dos maiores desafios do puerpério. O sono é fragmentado, a vigilância está elevada e você está constantemente em alerta. Isso é biologicamente esperado: estudos mostram que mães perdem em média 700 horas de sono no primeiro ano do bebê, com os primeiros 3 meses sendo os mais críticos.",
                    "A privação de sono não é apenas desconforto: compromete o sistema imunológico, a regulação emocional, a memória e aumenta o risco de depressão pós-parto. Melhorar a qualidade do descanso — mesmo que fragmentado — faz diferença real na sua recuperação."
                ]
            },
            {
                "title": "Compreenda a fisiologia do sono no puerpério",
                "paragraphs": [
                    "Nos primeiros meses, bebês têm ciclos de sono de apenas 45 a 60 minutos e necessidade de alimentação a cada 2 a 3 horas, inclusive à noite — isso é desenvolvimento neurológico normal, não 'mau comportamento'. O Ministério da Saúde orienta que amamentação noturna deve ser mantida pois sustenta a produção de prolactina, que é mais alta à noite.",
                    "Reconhecer que a privação é temporária e fisiológica — não permanente — é o primeiro passo para lidar melhor com ela sem entrar em colapso emocional."
                ]
            },
            {
                "title": "Estratégias para maximizar o descanso",
                "items": [
                    {
                        "title": "Durma quando o bebê dorme:",
                        "text": "A orientação mais respaldada pela literatura científica. Deixe louça, redes sociais e tarefas de lado. Seu sistema nervoso precisa de janelas de sono, mesmo que curtas. Pesquisas mostram que cochilos de 20 minutos restauram funções cognitivas de forma significativa."
                    },
                    {
                        "title": "Compartilhe as noites com um adulto de confiança:",
                        "text": "Se possível, alterne turnos com parceiro ou familiar. Uma pessoa dorme um bloco de 4 a 5 horas enquanto a outra cuida do bebê. Esse modelo, recomendado pelo ACOG, é um dos mais eficazes para reduzir privação severa."
                    },
                    {
                        "title": "Crie um ambiente propício ao sono:",
                        "text": "Quarto escuro (a melatonina é suprimida pela luz), temperatura entre 18 e 22°C e, se possível, ruído branco ou rosa leve. Esses fatores sinalizam ao sistema nervoso central que é hora de descansar."
                    },
                    {
                        "title": "Limite telas pelo menos 30 minutos antes de deitar:",
                        "text": "A luz azul de celulares e tablets suprime a produção de melatonina e aumenta o estado de alerta. Substituir por leitura leve ou respiração consciente facilita a transição para o sono."
                    },
                    {
                        "title": "Descanse sem culpa:",
                        "text": "Repouso é recuperação ativa, não ociosidade. O Ministério da Saúde recomenda explicitamente repouso relativo nos primeiros 40 dias pós-parto. Você não é preguiçosa: está se recuperando de um evento fisiológico intenso."
                    }
                ]
            },
            {
                "title": "Sinais de privação severa de sono",
                "paragraphs": [
                    "Dificuldade de concentração persistente, irritabilidade extrema, pensamentos muito negativos, desorientação, sensação de 'estar fora do corpo' ou dificuldade em cuidar do bebê podem indicar privação severa ou exaustão clínica. Esses sintomas se sobrepõem aos da depressão pós-parto e merecem avaliação profissional — não normalize se sentir assim por semanas."
                ]
            }
        ],
        "body": "Dormir com um bebê recém-nascido é um dos maiores desafios do puerpério. O sono é fragmentado, a vigilância está elevada e você está constantemente em alerta. Isso é biologicamente esperado: estudos mostram que mães perdem em média 700 horas de sono no primeiro ano do bebê, com os primeiros 3 meses sendo os mais críticos.\n\nA privação de sono não é apenas desconforto: compromete o sistema imunológico, a regulação emocional, a memória e aumenta o risco de depressão pós-parto. Melhorar a qualidade do descanso — mesmo que fragmentado — faz diferença real na sua recuperação.\n\nCompreenda a fisiologia do sono no puerpério\n\nNos primeiros meses, bebês têm ciclos de sono de apenas 45 a 60 minutos e necessidade de alimentação a cada 2 a 3 horas, inclusive à noite — isso é desenvolvimento neurológico normal, não 'mau comportamento'. O Ministério da Saúde orienta que amamentação noturna deve ser mantida pois sustenta a produção de prolactina, que é mais alta à noite.\n\nReconhecer que a privação é temporária e fisiológica — não permanente — é o primeiro passo para lidar melhor com ela sem entrar em colapso emocional.\n\nEstratégias para maximizar o descanso\n\nDurma quando o bebê dorme: A orientação mais respaldada pela literatura científica. Deixe louça, redes sociais e tarefas de lado. Seu sistema nervoso precisa de janelas de sono, mesmo que curtas. Pesquisas mostram que cochilos de 20 minutos restauram funções cognitivas de forma significativa.\n\nCompartilhe as noites com um adulto de confiança: Se possível, alterne turnos com parceiro ou familiar. Uma pessoa dorme um bloco de 4 a 5 horas enquanto a outra cuida do bebê. Esse modelo, recomendado pelo ACOG, é um dos mais eficazes para reduzir privação severa.\n\nCrie um ambiente propício ao sono: Quarto escuro (a melatonina é suprimida pela luz), temperatura entre 18 e 22°C e, se possível, ruído branco ou rosa leve. Esses fatores sinalizam ao sistema nervoso central que é hora de descansar.\n\nLimite telas pelo menos 30 minutos antes de deitar: A luz azul de celulares e tablets suprime a produção de melatonina e aumenta o estado de alerta. Substituir por leitura leve ou respiração consciente facilita a transição para o sono.\n\nDescanse sem culpa: Repouso é recuperação ativa, não ociosidade. O Ministério da Saúde recomenda explicitamente repouso relativo nos primeiros 40 dias pós-parto. Você não é preguiçosa: está se recuperando de um evento fisiológico intenso.\n\nSinais de privação severa de sono\n\nDificuldade de concentração persistente, irritabilidade extrema, pensamentos muito negativos, desorientação, sensação de 'estar fora do corpo' ou dificuldade em cuidar do bebê podem indicar privação severa ou exaustão clínica. Esses sintomas se sobrepõem aos da depressão pós-parto e merecem avaliação profissional — não normalize se sentir assim por semanas.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "energia."
    },
    {
        "id": "amamentacao-guia-pratico",
        "title": "Amamentação: informações e apoio para cada fase.",
        "summary": "Desde os primeiros dias até a adaptação: o que você precisa saber sobre amamentação.",
        "category": "Amamentação",
        "tags": [
            "amamentação",
            "aleitamento",
            "bebê",
            "lactação"
        ],
        "readTime": "12 min de leitura",
        "readingTimeMinutes": 12,
        "imageUrl": "https://plus.unsplash.com/premium_photo-1682090496470-6eec9f5bcc89?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mãe amamentando seu bebê no sofá em casa.",
        "quote": "Amamentação é uma habilidade que você e seu bebê desenvolvem juntos. Paciência, prática e apoio fazem toda a diferença.",
        "sections": [
            {
                "paragraphs": [
                    "Amamentação é um processo natural, mas não é instintivo — é uma habilidade aprendida. Para muitas mães e bebês, os primeiros dias envolvem aprendizado, ajustes e, às vezes, dor ou dificuldade. Isso é comum e não significa que algo está errado com você ou seu bebê.",
                    "O Ministério da Saúde e a OMS recomendam aleitamento materno exclusivo até os 6 meses e complementado até os 2 anos ou mais. Mas a realidade de cada mãe é singular, e o mais importante é o bem-estar de ambos."
                ]
            },
            {
                "title": "Primeiros dias: colostro e pega",
                "paragraphs": [
                    "Nos primeiros 2 a 4 dias, o seio produz colostro — um líquido amarelado, espesso e altamente nutritivo, rico em anticorpos (imunoglobulina A secretória), leucócitos e fatores de crescimento. A Sociedade Brasileira de Pediatria classifica o colostro como a 'primeira vacina do bebê'. A quantidade é pequena, mas suficiente para o estômago do recém-nascido, que tem o tamanho de uma bola de gude.",
                    "A pega correta é fundamental para evitar dor, fissuras e garantir produção adequada. Sinais de boa pega incluem:"
                ],
                "items": [
                    {
                        "title": "Boca bem aberta:",
                        "text": "O bebê abre amplamente a boca, capturando não apenas o mamilo, mas boa parte da auréola — especialmente a parte inferior. O queixo toca o seio."
                    },
                    {
                        "title": "Bochechas cheias e arredondadas:",
                        "text": "Enquanto suga, as bochechas permanecem cheias. Bochechas côncavas indicam pega superficial."
                    },
                    {
                        "title": "Som de deglutição audível:",
                        "text": "Você pode ouvir o bebê engolindo a cada 2 a 3 sucções. Não deve haver barulho de clique, que indica entrada de ar."
                    },
                    {
                        "title": "Ausência de dor intensa:",
                        "text": "Um leve desconforto inicial nos primeiros dias é comum, mas dor acentuada e persistente indica pega incorreta. Consulte uma consultora de lactação."
                    }
                ]
            },
            {
                "title": "Ingurgitamento mamário: o que é e como aliviar",
                "paragraphs": [
                    "Entre o 3º e o 5º dia pós-parto, com a subida do leite, as mamas podem ficar muito cheias, inchadas, tensas e desconfortáveis. É a apojadura — fisiológica e transitória. A SBP orienta que amamentação frequente é o melhor tratamento."
                ],
                "items": [
                    {
                        "title": "Amamente com frequência:",
                        "text": "A cada 2 a 3 horas, ou sempre que o bebê demonstrar interesse. Quanto mais o bebê mama, mais rápido o ingurgitamento alivia."
                    },
                    {
                        "title": "Compressa morna antes de amamentar:",
                        "text": "Facilita a saída do leite ao dilatar os ductos. Aplicar por 3 a 5 minutos."
                    },
                    {
                        "title": "Compressa fria após amamentar:",
                        "text": "Folhas de repolho geladas ou compressas de gel reduzem inchaço e desconforto. Aplicar por 10 a 15 minutos."
                    },
                    {
                        "title": "Ordenha manual leve:",
                        "text": "Se o bebê não conseguir pegar o seio muito cheio, ordene manualmente uma pequena quantidade para amolecer a auréola."
                    }
                ]
            },
            {
                "title": "Produção de leite: mitos e verdades",
                "paragraphs": [
                    "Mito: 'leite fraco'. Verdade: não existe leite fraco. O leite materno se adapta às necessidades do bebê em cada fase — o leite do início da mamada (leite anterior) é mais aquoso e hidrata; o do final (leite posterior) é mais calórico e sacia. Se o bebê está ganhando peso dentro do esperado pela curva da OMS, sua produção é suficiente.",
                    "A produção de leite funciona por oferta e demanda: quanto mais o bebê suga, mais leite é produzido. Suplementação desnecessária com fórmula pode reduzir a produção por diminuir o estímulo. Converse com seu profissional antes de suplementar."
                ]
            },
            {
                "title": "Quando parar também é uma escolha legítima",
                "paragraphs": [
                    "Se, por qualquer motivo — saúde física, saúde mental, condições de vida ou escolha pessoal — você precisar ou decidir parar de amamentar, isso não é fracasso. O Ministério da Saúde e a OMS reconhecem que fórmulas infantis são alternativas seguras quando a amamentação não é possível ou desejada. Sua saúde mental e física são prioridade. Converse com seu profissional sobre a transição segura e gradual."
                ]
            }
        ],
        "body": "Amamentação é um processo natural, mas não é instintivo — é uma habilidade aprendida. Para muitas mães e bebês, os primeiros dias envolvem aprendizado, ajustes e, às vezes, dor ou dificuldade. Isso é comum e não significa que algo está errado com você ou seu bebê.\n\nO Ministério da Saúde e a OMS recomendam aleitamento materno exclusivo até os 6 meses e complementado até os 2 anos ou mais. Mas a realidade de cada mãe é singular, e o mais importante é o bem-estar de ambos.\n\nPrimeiros dias: colostro e pega\n\nNos primeiros 2 a 4 dias, o seio produz colostro — um líquido amarelado, espesso e altamente nutritivo, rico em anticorpos (imunoglobulina A secretória), leucócitos e fatores de crescimento. A Sociedade Brasileira de Pediatria classifica o colostro como a 'primeira vacina do bebê'. A quantidade é pequena, mas suficiente para o estômago do recém-nascido, que tem o tamanho de uma bola de gude.\n\nA pega correta é fundamental para evitar dor, fissuras e garantir produção adequada. Sinais de boa pega incluem:\n\nBoca bem aberta: O bebê abre amplamente a boca, capturando não apenas o mamilo, mas boa parte da auréola — especialmente a parte inferior. O queixo toca o seio.\n\nBochechas cheias e arredondadas: Enquanto suga, as bochechas permanecem cheias. Bochechas côncavas indicam pega superficial.\n\nSom de deglutição audível: Você pode ouvir o bebê engolindo a cada 2 a 3 sucções. Não deve haver barulho de clique, que indica entrada de ar.\n\nAusência de dor intensa: Um leve desconforto inicial nos primeiros dias é comum, mas dor acentuada e persistente indica pega incorreta. Consulte uma consultora de lactação.\n\nIngurgitamento mamário: o que é e como aliviar\n\nEntre o 3º e o 5º dia pós-parto, com a subida do leite, as mamas podem ficar muito cheias, inchadas, tensas e desconfortáveis. É a apojadura — fisiológica e transitória. A SBP orienta que amamentação frequente é o melhor tratamento.\n\nAmamente com frequência: A cada 2 a 3 horas, ou sempre que o bebê demonstrar interesse. Quanto mais o bebê mama, mais rápido o ingurgitamento alivia.\n\nCompressa morna antes de amamentar: Facilita a saída do leite ao dilatar os ductos. Aplicar por 3 a 5 minutos.\n\nCompressa fria após amamentar: Folhas de repolho geladas ou compressas de gel reduzem inchaço e desconforto. Aplicar por 10 a 15 minutos.\n\nOrdenha manual leve: Se o bebê não conseguir pegar o seio muito cheio, ordene manualmente uma pequena quantidade para amolecer a auréola.\n\nProdução de leite: mitos e verdades\n\nMito: 'leite fraco'. Verdade: não existe leite fraco. O leite materno se adapta às necessidades do bebê em cada fase — o leite do início da mamada (leite anterior) é mais aquoso e hidrata; o do final (leite posterior) é mais calórico e sacia. Se o bebê está ganhando peso dentro do esperado pela curva da OMS, sua produção é suficiente.\n\nA produção de leite funciona por oferta e demanda: quanto mais o bebê suga, mais leite é produzido. Suplementação desnecessária com fórmula pode reduzir a produção por diminuir o estímulo. Converse com seu profissional antes de suplementar.\n\nQuando parar também é uma escolha legítima\n\nSe, por qualquer motivo — saúde física, saúde mental, condições de vida ou escolha pessoal — você precisar ou decidir parar de amamentar, isso não é fracasso. O Ministério da Saúde e a OMS reconhecem que fórmulas infantis são alternativas seguras quando a amamentação não é possível ou desejada. Sua saúde mental e física são prioridade. Converse com seu profissional sobre a transição segura e gradual.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "apoio."
    },
    {
        "id": "recuperacao-fisica-perineal",
        "title": "Recuperação do corpo: cuidados com o períneo e cicatrização.",
        "summary": "Entender o que seu corpo passa e como cuidar para recuperação segura e confortável.",
        "category": "Saúde Física",
        "tags": [
            "recuperação",
            "períneo",
            "cicatrização",
            "repouso pós-parto"
        ],
        "readTime": "11 min de leitura",
        "readingTimeMinutes": 11,
        "imageUrl": "https://images.unsplash.com/photo-1709315610148-f4b341aed9d4?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mulher tomando banho relaxante, representando cuidado e recuperação pós-parto.",
        "quote": "Seu corpo cresceu um ser. Agora ele merece tempo, gentileza e paciência para se recuperar.",
        "sections": [
            {
                "paragraphs": [
                    "O parto vaginal envolve estiramento significativo da região perineal. Mesmo sem laceração ou episiotomia, há microlesões nos tecidos, músculos e nervos locais. O processo de cicatrização completa leva entre 4 e 6 semanas para lacerações de 1º e 2º grau, e até 3 meses para as mais complexas, segundo o Ministério da Saúde.",
                    "Os primeiros 40 dias (puerpério imediato) são críticos para cicatrização e reabilitação. Descanso, higiene adequada e movimento gentil são os pilares dessa fase."
                ]
            },
            {
                "title": "Lóquios: o sangramento pós-parto",
                "paragraphs": [
                    "Após o parto, é normal um sangramento chamado lóquio — semelhante à menstruação, mas mais intenso nos primeiros dias. O Ministério da Saúde descreve três fases: lóquio rubro (vermelho vivo, dias 1 a 4), lóquio seroso (rosado ou amarronzado, dias 5 a 10) e lóquio alvo (amarelado ou branco, até a 6ª semana). A diminuição progressiva é sinal de boa recuperação."
                ]
            },
            {
                "title": "Higiene perineal: como fazer corretamente",
                "paragraphs": [
                    "Manter a área limpa e seca é fundamental para prevenir infecções, que afetam cerca de 5% das mulheres no pós-parto vaginal. O protocolo recomendado pelo Ministério da Saúde inclui:"
                ],
                "items": [
                    {
                        "title": "Higiene após usar o banheiro:",
                        "text": "Use água morna abundante de frente para trás, com sabonete íntimo de pH neutro ou apenas água. Seque com toalha limpa ou papel higiênico com toque suave, sempre da frente para trás."
                    },
                    {
                        "title": "Banhos de assento:",
                        "text": "Se teve laceração ou episiotomia, banhos de assento com água morna (sem aditivos) 2 a 3 vezes ao dia promovem limpeza, alívio e cicatrização. Duração de 10 a 15 minutos."
                    },
                    {
                        "title": "Troca frequente de absorventes:",
                        "text": "A cada 3 a 4 horas nos primeiros dias, ou ao sentir umidade. Absorventes úmidos aumentam o risco de infecção e irritação."
                    },
                    {
                        "title": "Evite produtos irritantes:",
                        "text": "Sem duchas vaginais, bidê com jato forte ou produtos perfumados. A vagina é autolimpante — interferências alteram o pH e aumentam o risco de infecção."
                    }
                ]
            },
            {
                "title": "Alívio do desconforto",
                "paragraphs": [
                    "Desconforto, ardência e sensibilidade são esperados, especialmente nas primeiras 72 horas. Estratégias validadas incluem:"
                ],
                "items": [
                    {
                        "title": "Compressas frias nas primeiras 24 a 48 horas:",
                        "text": "Reduzem edema e dor. Use compressas de gel envolvidas em pano limpo por 15 a 20 minutos, com intervalos de pelo menos 20 minutos entre as aplicações."
                    },
                    {
                        "title": "Almofada com orifício central:",
                        "text": "Redistribui a pressão ao sentar, aliviando a região perineal. Especialmente útil nas duas primeiras semanas."
                    },
                    {
                        "title": "Analgésicos seguros:",
                        "text": "Paracetamol e ibuprofeno são considerados seguros durante a amamentação, segundo a SBP e a OMS. Sempre use conforme prescrição médica."
                    },
                    {
                        "title": "Roupas confortáveis:",
                        "text": "Calcinhas de algodão de cintura alta que não comprimam a região. Evite tecidos sintéticos que retêm calor e umidade."
                    }
                ]
            },
            {
                "title": "Restrições de movimento nos primeiros 40 dias",
                "items": [
                    {
                        "title": "Evite esforço físico intenso:",
                        "text": "Levantamento de peso acima de 5 kg, corrida, pulos e exercícios abdominais podem comprometer a cicatrização perineal e aumentar o risco de prolapso. Reintrodução gradual após 6 a 8 semanas, com liberação médica."
                    },
                    {
                        "title": "Relações sexuais:",
                        "text": "O Ministério da Saúde e o ACOG recomendam aguardar pelo menos 4 a 6 semanas, ou até a consulta puerperal de revisão, para avaliação individual da cicatrização."
                    },
                    {
                        "title": "Exercícios do assoalho pélvico (Kegel):",
                        "text": "Esses podem ser iniciados precocemente — a partir do 1º ou 2º dia pós-parto, salvo complicações — e são altamente recomendados pelo Ministério da Saúde para restaurar a função do assoalho pélvico."
                    }
                ]
            },
            {
                "title": "Sinais de alerta que exigem avaliação imediata",
                "paragraphs": [
                    "Busque atendimento profissional se notar: febre acima de 38°C, aumento progressivo de dor (ao invés de melhora), inchaço crescente na região perineal, secreção com odor fétido ou purulento, sangramento muito intenso (saturar mais de um absorvente por hora) ou deiscência (abertura) da sutura. Esses são sinais possíveis de infecção puerperal — uma emergência obstétrica."
                ]
            }
        ],
        "body": "O parto vaginal envolve estiramento significativo da região perineal. Mesmo sem laceração ou episiotomia, há microlesões nos tecidos, músculos e nervos locais. O processo de cicatrização completa leva entre 4 e 6 semanas para lacerações de 1º e 2º grau, e até 3 meses para as mais complexas, segundo o Ministério da Saúde.\n\nOs primeiros 40 dias (puerpério imediato) são críticos para cicatrização e reabilitação. Descanso, higiene adequada e movimento gentil são os pilares dessa fase.\n\nLóquios: o sangramento pós-parto\n\nApós o parto, é normal um sangramento chamado lóquio — semelhante à menstruação, mas mais intenso nos primeiros dias. O Ministério da Saúde descreve três fases: lóquio rubro (vermelho vivo, dias 1 a 4), lóquio seroso (rosado ou amarronzado, dias 5 a 10) e lóquio alvo (amarelado ou branco, até a 6ª semana). A diminuição progressiva é sinal de boa recuperação.\n\nHigiene perineal: como fazer corretamente\n\nManter a área limpa e seca é fundamental para prevenir infecções, que afetam cerca de 5% das mulheres no pós-parto vaginal. O protocolo recomendado pelo Ministério da Saúde inclui:\n\nHigiene após usar o banheiro: Use água morna abundante de frente para trás, com sabonete íntimo de pH neutro ou apenas água. Seque com toalha limpa ou papel higiênico com toque suave, sempre da frente para trás.\n\nBanhos de assento: Se teve laceração ou episiotomia, banhos de assento com água morna (sem aditivos) 2 a 3 vezes ao dia promovem limpeza, alívio e cicatrização. Duração de 10 a 15 minutos.\n\nTroca frequente de absorventes: A cada 3 a 4 horas nos primeiros dias, ou ao sentir umidade. Absorventes úmidos aumentam o risco de infecção e irritação.\n\nEvite produtos irritantes: Sem duchas vaginais, bidê com jato forte ou produtos perfumados. A vagina é autolimpante — interferências alteram o pH e aumentam o risco de infecção.\n\nAlívio do desconforto\n\nDesconforto, ardência e sensibilidade são esperados, especialmente nas primeiras 72 horas. Estratégias validadas incluem:\n\nCompressas frias nas primeiras 24 a 48 horas: Reduzem edema e dor. Use compressas de gel envolvidas em pano limpo por 15 a 20 minutos, com intervalos de pelo menos 20 minutos entre as aplicações.\n\nAlmofada com orifício central: Redistribui a pressão ao sentar, aliviando a região perineal. Especialmente útil nas duas primeiras semanas.\n\nAnalgésicos seguros: Paracetamol e ibuprofeno são considerados seguros durante a amamentação, segundo a SBP e a OMS. Sempre use conforme prescrição médica.\n\nRoupas confortáveis: Calcinhas de algodão de cintura alta que não comprimam a região. Evite tecidos sintéticos que retêm calor e umidade.\n\nRestrições de movimento nos primeiros 40 dias\n\nEvite esforço físico intenso: Levantamento de peso acima de 5 kg, corrida, pulos e exercícios abdominais podem comprometer a cicatrização perineal e aumentar o risco de prolapso. Reintrodução gradual após 6 a 8 semanas, com liberação médica.\n\nRelações sexuais: O Ministério da Saúde e o ACOG recomendam aguardar pelo menos 4 a 6 semanas, ou até a consulta puerperal de revisão, para avaliação individual da cicatrização.\n\nExercícios do assoalho pélvico (Kegel): Esses podem ser iniciados precocemente — a partir do 1º ou 2º dia pós-parto, salvo complicações — e são altamente recomendados pelo Ministério da Saúde para restaurar a função do assoalho pélvico.\n\nSinais de alerta que exigem avaliação imediata\n\nBusque atendimento profissional se notar: febre acima de 38°C, aumento progressivo de dor (ao invés de melhora), inchaço crescente na região perineal, secreção com odor fétido ou purulento, sangramento muito intenso (saturar mais de um absorvente por hora) ou deiscência (abertura) da sutura. Esses são sinais possíveis de infecção puerperal — uma emergência obstétrica.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "cicatrização."
    },
    {
        "id": "alongamento-leve",
        "title": "Alongamento leve para aliviar tensões.",
        "summary": "Movimentos suaves para relaxar o corpo durante o puerpério, respeitando sua recuperação.",
        "category": "Bem-estar",
        "tags": [
            "corpo",
            "alongamento",
            "respiração",
            "movimento suave"
        ],
        "readTime": "10 min de leitura",
        "readingTimeMinutes": 10,
        "imageUrl": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Pessoa em postura de alongamento sobre tapete.",
        "quote": "Um corpo que recebe pequenas pausas ao longo do dia encontra mais espaço para respirar e se recuperar.",
        "sections": [
            {
                "paragraphs": [
                    "Entre amamentações, colo, cuidados com o bebê e falta de sono, seu corpo acumula tensão muscular sem que você perceba. Pescoço, ombros, costas e quadris são as regiões mais afetadas — especialmente pela postura de amamentação, que mantém os ombros rodados para frente por longos períodos. Movimentos leves melhoram circulação, reduzem tensão miofascial e regulam o sistema nervoso.",
                    "Importante: aguarde liberação médica antes de iniciar qualquer atividade física. Se houve cesariana, os primeiros 45 a 60 dias exigem cuidado extra com a região abdominal. Se houve parto vaginal com laceração, evite exercícios que pressionar o assoalho pélvico."
                ]
            },
            {
                "title": "Quando é seguro começar",
                "paragraphs": [
                    "Nos primeiros 7 a 10 dias, priorize repouso. Entre 2 e 6 semanas, alongamentos muito suaves, sem força abdominal e sem impacto, são geralmente seguros. O retorno a atividades físicas mais intensas deve ser avaliado individualmente na consulta puerperal de 6 semanas, conforme recomendado pelo Ministério da Saúde. Se houver qualquer dor, pare imediatamente."
                ]
            },
            {
                "title": "Alongamentos seguros para os primeiros meses",
                "items": [
                    {
                        "title": "Liberação dos ombros:",
                        "text": "Sentada ou em pé, faça círculos lentos com os ombros — para trás 5 a 8 vezes, depois para frente. Respire profundamente a cada movimento. Contra-atua a postura de amamentação e alivia tensão do trapézio."
                    },
                    {
                        "title": "Alongamento lateral do pescoço:",
                        "text": "Incline a cabeça suavemente para um lado, mantendo por 20 a 30 segundos. Sem forçar, sem puxar. Repita do outro lado. Alivia o esternocleidomastoideo e o escaleno — músculos constantemente contraídos ao segurar e amamentar o bebê."
                    },
                    {
                        "title": "Abertura de peito:",
                        "text": "Sente-se ereta. Entrelaçe os dedos atrás das costas, levante suavemente o queixo e abra o peito. Mantenha por 20 a 30 segundos respirando profundamente. Reverte a cifose postural gerada pela amamentação."
                    },
                    {
                        "title": "Inclinação para frente (isquiotibiais):",
                        "text": "Sente-se no chão com as pernas estendidas. Incline o tronco suavemente para frente mantendo a coluna alongada. Pare quando sentir o alongamento, nunca no limite da dor. Mantenha 20 a 30 segundos."
                    },
                    {
                        "title": "Alongamento lateral do tronco:",
                        "text": "Em pé, levante um braço acima da cabeça e incline suavemente para o lado oposto. Mantenha 20 segundos. Repita do outro lado. Alivia a tensão dos oblíquos e quadrado lombar."
                    }
                ]
            },
            {
                "title": "Respiração durante o alongamento",
                "paragraphs": [
                    "Nunca prenda a respiração durante um alongamento — isso aumenta a pressão intra-abdominal e pode ser prejudicial no pós-parto. Inspire pelo nariz antes do movimento e expire lentamente pela boca ao aprofundar o alongamento. A expiração prolongada ativa o sistema nervoso parassimpático, potencializando o relaxamento muscular."
                ]
            },
            {
                "title": "Fisioterapia pélvica: uma aliada importante",
                "paragraphs": [
                    "A fisioterapia especializada em saúde pélvica é recomendada pelo Ministério da Saúde e pela FEBRASGO para todas as mulheres no pós-parto, independente do tipo de parto. Além do assoalho pélvico, o fisioterapeuta avalia diástase abdominal (separação dos músculos retos abdominais, presente em até 66% das mulheres após o parto) e cria um programa personalizado e seguro."
                ]
            }
        ],
        "body": "Entre amamentações, colo, cuidados com o bebê e falta de sono, seu corpo acumula tensão muscular sem que você perceba. Pescoço, ombros, costas e quadris são as regiões mais afetadas — especialmente pela postura de amamentação, que mantém os ombros rodados para frente por longos períodos. Movimentos leves melhoram circulação, reduzem tensão miofascial e regulam o sistema nervoso.\n\nImportante: aguarde liberação médica antes de iniciar qualquer atividade física. Se houve cesariana, os primeiros 45 a 60 dias exigem cuidado extra com a região abdominal. Se houve parto vaginal com laceração, evite exercícios que pressionar o assoalho pélvico.\n\nQuando é seguro começar\n\nNos primeiros 7 a 10 dias, priorize repouso. Entre 2 e 6 semanas, alongamentos muito suaves, sem força abdominal e sem impacto, são geralmente seguros. O retorno a atividades físicas mais intensas deve ser avaliado individualmente na consulta puerperal de 6 semanas, conforme recomendado pelo Ministério da Saúde. Se houver qualquer dor, pare imediatamente.\n\nAlongamentos seguros para os primeiros meses\n\nLiberação dos ombros: Sentada ou em pé, faça círculos lentos com os ombros — para trás 5 a 8 vezes, depois para frente. Respire profundamente a cada movimento. Contra-atua a postura de amamentação e alivia tensão do trapézio.\n\nAlongamento lateral do pescoço: Incline a cabeça suavemente para um lado, mantendo por 20 a 30 segundos. Sem forçar, sem puxar. Repita do outro lado. Alivia o esternocleidomastoideo e o escaleno — músculos constantemente contraídos ao segurar e amamentar o bebê.\n\nAbertura de peito: Sente-se ereta. Entrelaçe os dedos atrás das costas, levante suavemente o queixo e abra o peito. Mantenha por 20 a 30 segundos respirando profundamente. Reverte a cifose postural gerada pela amamentação.\n\nInclinação para frente (isquiotibiais): Sente-se no chão com as pernas estendidas. Incline o tronco suavemente para frente mantendo a coluna alongada. Pare quando sentir o alongamento, nunca no limite da dor. Mantenha 20 a 30 segundos.\n\nAlongamento lateral do tronco: Em pé, levante um braço acima da cabeça e incline suavemente para o lado oposto. Mantenha 20 segundos. Repita do outro lado. Alivia a tensão dos oblíquos e quadrado lombar.\n\nRespiração durante o alongamento\n\nNunca prenda a respiração durante um alongamento — isso aumenta a pressão intra-abdominal e pode ser prejudicial no pós-parto. Inspire pelo nariz antes do movimento e expire lentamente pela boca ao aprofundar o alongamento. A expiração prolongada ativa o sistema nervoso parassimpático, potencializando o relaxamento muscular.\n\nFisioterapia pélvica: uma aliada importante\n\nA fisioterapia especializada em saúde pélvica é recomendada pelo Ministério da Saúde e pela FEBRASGO para todas as mulheres no pós-parto, independente do tipo de parto. Além do assoalho pélvico, o fisioterapeuta avalia diástase abdominal (separação dos músculos retos abdominais, presente em até 66% das mulheres após o parto) e cria um programa personalizado e seguro.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "tensões."
    },
    {
        "id": "respiracao-para-ansiedade",
        "title": "Respiração para desacelerar pensamentos.",
        "summary": "Um exercício simples para voltar ao corpo quando a mente acelera.",
        "category": "Bem-estar Mental",
        "tags": [
            "ansiedade",
            "respiração",
            "pausa",
            "mindfulness"
        ],
        "readTime": "8 min de leitura",
        "readingTimeMinutes": 8,
        "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Pessoa sentada em postura tranquila para respirar.",
        "quote": "Respirar com atenção é uma forma simples de lembrar ao corpo que há uma pausa possível.",
        "sections": [
            {
                "paragraphs": [
                    "Nos primeiros meses pós-parto, o pensamento pode acelerar: 'O bebê está bem? E se ele acordar? E se eu esquecer algo?'. Essa hipervigilância materna é parcialmente adaptativa — está ligada à ocitocina e ao instinto de proteção — mas quando se torna constante, coloca o sistema nervoso em estado de alarme crônico, com consequências reais para saúde física e emocional.",
                    "A respiração consciente é uma das intervenções mais bem documentadas para regulação do sistema nervoso autônomo. Estudos publicados no Journal of Neurophysiology mostram que a respiração lenta e controlada ativa o nervo vago e o sistema parassimpático, reduzindo frequência cardíaca, cortisol e percepção de ansiedade."
                ]
            },
            {
                "title": "Como a respiração regula o sistema nervoso",
                "paragraphs": [
                    "Quando você está ansiosa, sua respiração fica rápida e superficial (torácica). Isso sinaliza ao cérebro que há ameaça, mantendo o ciclo de ansiedade. Quando você desacelera intencionalmente a respiração — especialmente a expiração — estimula o nervo vago e ativa o sistema nervoso parassimpático (o 'freio' do organismo). Isso é fisiologia, não misticismo. É uma habilidade que pode ser treinada."
                ]
            },
            {
                "title": "Exercício 4-6: o mais recomendado para ansiedade",
                "paragraphs": [
                    "Escolha um momento onde você tenha 3 a 5 minutos. Pode ser enquanto o bebê dorme, antes de levantar, ou antes de dormir. Sente-se ou deite em posição confortável."
                ],
                "items": [
                    {
                        "title": "Passo 1 — Inspire:",
                        "text": "Respire pelo nariz contando mentalmente até 4. Expanda primeiro o abdômen (barriga sobe), depois o peito. Isso garante respiração diafragmática, mais eficiente para ativação parassimpática."
                    },
                    {
                        "title": "Passo 2 — Pausa breve:",
                        "text": "Retenha o ar suavemente por 1 a 2 segundos, sem forçar."
                    },
                    {
                        "title": "Passo 3 — Expire:",
                        "text": "Solte o ar lentamente pela boca ou pelo nariz, contando até 6. A expiração mais longa que a inspiração é o que ativa o sistema parassimpático — esse é o mecanismo central do exercício."
                    },
                    {
                        "title": "Passo 4 — Repita:",
                        "text": "Faça 6 a 10 ciclos. Apenas isso. Pesquisas mostram efeito mensuravelmente na variabilidade da frequência cardíaca já a partir do 4º ciclo."
                    }
                ]
            },
            {
                "title": "Variação: Respiração 4-7-8",
                "paragraphs": [
                    "Popularizada pelo Dr. Andrew Weil e estudada em contextos de ansiedade clínica: inspire por 4 segundos, retenha por 7, expire por 8. É mais intensa — indicada quando a ansiedade está mais elevada. Não recomendada para quem tem histórico de hiperventilação sem orientação profissional."
                ]
            },
            {
                "title": "Quando e como praticar",
                "paragraphs": [
                    "Não espere estar em crise para aprender. Pratique diariamente quando estiver calma — assim, quando a ansiedade aparecer, seu sistema nervoso já conhece o caminho. Mesmo 2 a 3 minutos por dia produzem mudanças neurológicas mensuráveis ao longo de semanas, segundo estudos de neuroplasticidade. Pode ser feito durante a amamentação, nos primeiros minutos da manhã ou ao deitar."
                ]
            }
        ],
        "body": "Nos primeiros meses pós-parto, o pensamento pode acelerar: 'O bebê está bem? E se ele acordar? E se eu esquecer algo?'. Essa hipervigilância materna é parcialmente adaptativa — está ligada à ocitocina e ao instinto de proteção — mas quando se torna constante, coloca o sistema nervoso em estado de alarme crônico, com consequências reais para saúde física e emocional.\n\nA respiração consciente é uma das intervenções mais bem documentadas para regulação do sistema nervoso autônomo. Estudos publicados no Journal of Neurophysiology mostram que a respiração lenta e controlada ativa o nervo vago e o sistema parassimpático, reduzindo frequência cardíaca, cortisol e percepção de ansiedade.\n\nComo a respiração regula o sistema nervoso\n\nQuando você está ansiosa, sua respiração fica rápida e superficial (torácica). Isso sinaliza ao cérebro que há ameaça, mantendo o ciclo de ansiedade. Quando você desacelera intencionalmente a respiração — especialmente a expiração — estimula o nervo vago e ativa o sistema nervoso parassimpático (o 'freio' do organismo). Isso é fisiologia, não misticismo. É uma habilidade que pode ser treinada.\n\nExercício 4-6: o mais recomendado para ansiedade\n\nEscolha um momento onde você tenha 3 a 5 minutos. Pode ser enquanto o bebê dorme, antes de levantar, ou antes de dormir. Sente-se ou deite em posição confortável.\n\nPasso 1 — Inspire: Respire pelo nariz contando mentalmente até 4. Expanda primeiro o abdômen (barriga sobe), depois o peito. Isso garante respiração diafragmática, mais eficiente para ativação parassimpática.\n\nPasso 2 — Pausa breve: Retenha o ar suavemente por 1 a 2 segundos, sem forçar.\n\nPasso 3 — Expire: Solte o ar lentamente pela boca ou pelo nariz, contando até 6. A expiração mais longa que a inspiração é o que ativa o sistema parassimpático — esse é o mecanismo central do exercício.\n\nPasso 4 — Repita: Faça 6 a 10 ciclos. Apenas isso. Pesquisas mostram efeito mensuravelmente na variabilidade da frequência cardíaca já a partir do 4º ciclo.\n\nVariação: Respiração 4-7-8\n\nPopularizada pelo Dr. Andrew Weil e estudada em contextos de ansiedade clínica: inspire por 4 segundos, retenha por 7, expire por 8. É mais intensa — indicada quando a ansiedade está mais elevada. Não recomendada para quem tem histórico de hiperventilação sem orientação profissional.\n\nQuando e como praticar\n\nNão espere estar em crise para aprender. Pratique diariamente quando estiver calma — assim, quando a ansiedade aparecer, seu sistema nervoso já conhece o caminho. Mesmo 2 a 3 minutos por dia produzem mudanças neurológicas mensuráveis ao longo de semanas, segundo estudos de neuroplasticidade. Pode ser feito durante a amamentação, nos primeiros minutos da manhã ou ao deitar.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "pensamentos."
    },
    {
        "id": "preparando-sua-jornada",
        "title": "Preparando sua jornada com leveza.",
        "summary": "Para futuras mães: entenda o puerpério e prepare-se com realismo e acolhimento.",
        "category": "Preparação",
        "tags": [
            "planejamento",
            "futura mãe",
            "acolhimento",
            "expectativa realista"
        ],
        "readTime": "10 min de leitura",
        "readingTimeMinutes": 10,
        "imageUrl": "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Família em momento tranquilo de cuidado.",
        "quote": "Planejar com leveza significa estar pronta sem obsessão. Conhecer a realidade sem perder a esperança.",
        "sections": [
            {
                "paragraphs": [
                    "Desejar ser mãe traz alegria, expectativa e dúvidas legítimas. As redes sociais mostram bebês dormindo em berços perfeitos, mas a realidade inclui noites sem dormir, corpo em transformação e emoções intensas. Ambas as versões existem — e se preparar para a realidade não diminui a alegria: aumenta a resiliência.",
                    "Estudos da Universidade de Cambridge mostram que mães que recebem informações realistas sobre o puerpério durante o pré-natal apresentam menor incidência de depressão pós-parto e maior satisfação com a maternidade nos primeiros 6 meses."
                ]
            },
            {
                "title": "O que realmente muda",
                "paragraphs": [
                    "Sono, corpo, tempo, relacionamento, identidade e prioridades. Tudo isso passa por transformação. E é completamente válido sentir medo ou ambivalência diante disso."
                ],
                "items": [
                    {
                        "title": "Sono fragmentado por meses:",
                        "text": "Recém-nascidos têm ciclos de sono de 45 a 60 minutos e precisam de alimentação frequente à noite. Isso é desenvolvimento neurológico normal, não um problema a resolver. É desafiador e é temporário."
                    },
                    {
                        "title": "Seu corpo não volta ao que era — e não precisa:",
                        "text": "Diástase abdominal, estrias, cicatrizes, mudanças no seio, no quadril, no peso: tudo conta a história de um corpo que gerou vida. Recuperação física leva meses, não semanas."
                    },
                    {
                        "title": "Emoções contraditórias são normais:",
                        "text": "Você pode se sentir apaixonada pelo bebê e exausta ao mesmo tempo. Grata e ressentida. Isso não te torna má mãe — te torna humana."
                    },
                    {
                        "title": "Relacionamentos se transformam:",
                        "text": "Com parceiro, família e amigos. Mais responsabilidades, menos tempo espontâneo, novas formas de conexão. A transição é real para todos."
                    }
                ]
            },
            {
                "title": "Como se preparar com realismo",
                "items": [
                    {
                        "title": "Construa sua rede de apoio antes do parto:",
                        "text": "O Ministério da Saúde recomenda que a rede de suporte seja identificada ainda no pré-natal. Quem pode ajudar? Com o quê? Por quanto tempo? Ter isso definido antes evita sobrecarga no momento mais vulnerável."
                    },
                    {
                        "title": "Conheça os sinais de depressão pós-parto:",
                        "text": "Tristeza persistente, desconexão com o bebê, pensamentos intrusivos, ansiedade severa. Saber reconhecer — em você ou em quem você ama — permite buscar ajuda rapidamente."
                    },
                    {
                        "title": "Prepare refeições congeladas:",
                        "text": "Ter comida nutritiva pronta nos primeiros 15 a 30 dias é uma das formas mais práticas de autocuidado. Congele antes do parto: sopas, feijão, arroz, pratos prontos."
                    },
                    {
                        "title": "Permita-se mudar de planos:",
                        "text": "Planejou amamentar exclusivamente e precisou suplementar. Planejou parto normal e foi cesariana. Planejou licença de 6 meses e as circunstâncias mudaram. Flexibilidade não é falha — é adaptação inteligente."
                    },
                    {
                        "title": "Conheça seus direitos:",
                        "text": "Licença-maternidade de 120 dias (ou 180 dias em empresas do Programa Empresa Cidadã), intervalo para amamentação até os 6 meses do bebê durante a jornada de trabalho, e estabilidade no emprego até 5 meses após o parto — tudo garantido por lei brasileira."
                    }
                ]
            },
            {
                "title": "Primeiras semanas: sobrevivência com gentileza",
                "paragraphs": [
                    "Nos primeiros dias após o nascimento, o foco é apenas dois: recuperação materna e vínculo com o bebê. Casa arrumada, visitas, redes sociais — tudo pode esperar. O Ministério da Saúde orienta repouso relativo nos primeiros 40 dias. Trate a si mesma com a mesma gentileza que trataria uma amiga que acabou de passar por uma cirurgia de grande porte — porque foi exatamente isso que seu corpo viveu."
                ]
            }
        ],
        "body": "Desejar ser mãe traz alegria, expectativa e dúvidas legítimas. As redes sociais mostram bebês dormindo em berços perfeitos, mas a realidade inclui noites sem dormir, corpo em transformação e emoções intensas. Ambas as versões existem — e se preparar para a realidade não diminui a alegria: aumenta a resiliência.\n\nEstudos da Universidade de Cambridge mostram que mães que recebem informações realistas sobre o puerpério durante o pré-natal apresentam menor incidência de depressão pós-parto e maior satisfação com a maternidade nos primeiros 6 meses.\n\nO que realmente muda\n\nSono, corpo, tempo, relacionamento, identidade e prioridades. Tudo isso passa por transformação. E é completamente válido sentir medo ou ambivalência diante disso.\n\nSono fragmentado por meses: Recém-nascidos têm ciclos de sono de 45 a 60 minutos e precisam de alimentação frequente à noite. Isso é desenvolvimento neurológico normal, não um problema a resolver. É desafiador e é temporário.\n\nSeu corpo não volta ao que era — e não precisa: Diástase abdominal, estrias, cicatrizes, mudanças no seio, no quadril, no peso: tudo conta a história de um corpo que gerou vida. Recuperação física leva meses, não semanas.\n\nEmoções contraditórias são normais: Você pode se sentir apaixonada pelo bebê e exausta ao mesmo tempo. Grata e ressentida. Isso não te torna má mãe — te torna humana.\n\nRelacionamentos se transformam: Com parceiro, família e amigos. Mais responsabilidades, menos tempo espontâneo, novas formas de conexão. A transição é real para todos.\n\nComo se preparar com realismo\n\nConstrua sua rede de apoio antes do parto: O Ministério da Saúde recomenda que a rede de suporte seja identificada ainda no pré-natal. Quem pode ajudar? Com o quê? Por quanto tempo? Ter isso definido antes evita sobrecarga no momento mais vulnerável.\n\nConheça os sinais de depressão pós-parto: Tristeza persistente, desconexão com o bebê, pensamentos intrusivos, ansiedade severa. Saber reconhecer — em você ou em quem você ama — permite buscar ajuda rapidamente.\n\nPrepare refeições congeladas: Ter comida nutritiva pronta nos primeiros 15 a 30 dias é uma das formas mais práticas de autocuidado. Congele antes do parto: sopas, feijão, arroz, pratos prontos.\n\nPermita-se mudar de planos: Planejou amamentar exclusivamente e precisou suplementar. Planejou parto normal e foi cesariana. Planejou licença de 6 meses e as circunstâncias mudaram. Flexibilidade não é falha — é adaptação inteligente.\n\nConheça seus direitos: Licença-maternidade de 120 dias (ou 180 dias em empresas do Programa Empresa Cidadã), intervalo para amamentação até os 6 meses do bebê durante a jornada de trabalho, e estabilidade no emprego até 5 meses após o parto — tudo garantido por lei brasileira.\n\nPrimeiras semanas: sobrevivência com gentileza\n\nNos primeiros dias após o nascimento, o foco é apenas dois: recuperação materna e vínculo com o bebê. Casa arrumada, visitas, redes sociais — tudo pode esperar. O Ministério da Saúde orienta repouso relativo nos primeiros 40 dias. Trate a si mesma com a mesma gentileza que trataria uma amiga que acabou de passar por uma cirurgia de grande porte — porque foi exatamente isso que seu corpo viveu.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "leveza."
    },
    {
        "id": "sinais-alerta-puerperio",
        "title": "Sinais de alerta: quando buscar ajuda profissional.",
        "summary": "Conhecer os sinais te capacita a buscar ajuda rapidamente se necessário.",
        "category": "Saúde e Segurança",
        "tags": [
            "saúde",
            "segurança",
            "sinais de alerta",
            "apoio profissional"
        ],
        "readTime": "7 min de leitura",
        "readingTimeMinutes": 7,
        "imageUrl": "https://images.unsplash.com/photo-1769029270661-b59a8a6270e7?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Profissional de saúde apoiando uma mãe em consulta.",
        "quote": "Pedir ajuda não é fraqueza. É sabedoria. É amor por você mesma e pelo seu bebê.",
        "sections": [
            {
                "paragraphs": [
                    "O puerpério é um período de alta vulnerabilidade clínica. O Ministério da Saúde estima que complicações puerperais — físicas ou emocionais — afetam entre 10% e 20% das mulheres. Reconhecer os sinais precocemente pode salvar vidas: a maioria das mortes maternas pós-parto é evitável com acesso rápido ao cuidado.",
                    "A presença de qualquer sinal abaixo não significa que você falhou. Significa que você está enfrentando um desafio que merece suporte qualificado."
                ]
            },
            {
                "title": "Sinais físicos de emergência ou urgência",
                "items": [
                    {
                        "title": "Sangramento intenso (hemorragia):",
                        "text": "Saturar mais de um absorvente por hora por duas horas consecutivas, ou sangramento que aumenta após estar diminuindo. É o principal sinal de hemorragia puerperal — emergência obstétrica. Vá ao pronto-socorro imediatamente."
                    },
                    {
                        "title": "Febre acima de 38°C:",
                        "text": "Especialmente acompanhada de dor, inchaço, secreção com odor ou mal-estar geral. Pode indicar infecção puerperal — endometrite, infecção de episiorrafia ou mastite. Requer antibioticoterapia."
                    },
                    {
                        "title": "Dor intensa e progressiva:",
                        "text": "Dor abdominal, perineal ou mamária que piora ao invés de melhorar, especialmente entre o 3º e o 10º dia pós-parto."
                    },
                    {
                        "title": "Inchaço, calor ou vermelhidão nas pernas:",
                        "text": "Pode indicar trombose venosa profunda (TVP) — risco aumentado no puerpério pela hipercoagulabilidade fisiológica. Emergência vascular."
                    },
                    {
                        "title": "Dificuldade respiratória ou dor no peito:",
                        "text": "Emergência. Pode indicar embolia pulmonar — principal causa de morte materna tardia no Brasil, segundo o Ministério da Saúde."
                    },
                    {
                        "title": "Dificuldade persistente para urinar ou evacuar:",
                        "text": "Retenção urinária aguda é uma emergência. Constipação severa persistente além do 4º dia requer avaliação."
                    }
                ]
            },
            {
                "title": "Sinais emocionais e mentais que requerem avaliação",
                "items": [
                    {
                        "title": "Tristeza persistente além de 2 semanas:",
                        "text": "Choro frequente, sensação de vazio ou desesperança que não melhora — diferente do baby blues, que se resolve em até 14 dias. Pode ser depressão pós-parto."
                    },
                    {
                        "title": "Desconexão com o bebê:",
                        "text": "Sentir-se indiferente, distante ou com dificuldade de se vincular ao bebê após as primeiras semanas. Sinal importante a ser avaliado."
                    },
                    {
                        "title": "Pensamentos intrusivos ou obsessivos:",
                        "text": "Imagens ou pensamentos repetitivos sobre algo ruim acontecer com o bebê, mesmo sem intenção de agir. São comuns na ansiedade pós-parto e têm tratamento eficaz."
                    },
                    {
                        "title": "Ansiedade severa ou ataques de pânico:",
                        "text": "Preocupação paralisante, sensação constante de perigo iminente, palpitações, falta de ar sem causa física."
                    },
                    {
                        "title": "Pensamentos de se machucar ou machucar o bebê:",
                        "text": "Qualquer pensamento dessa natureza requer avaliação profissional imediata — sem julgamento. É um sinal de que o sistema nervoso está sobrecarregado e precisa de suporte. Não é sua culpa."
                    }
                ]
            },
            {
                "title": "Como buscar ajuda",
                "paragraphs": [
                    "Para emergências físicas: pronto-socorro obstétrico. Para urgências e acompanhamento: seu obstetra, médico de família ou UBS de referência. Para saúde mental: psicólogo, psiquiatra perinatal ou CAPS (Centro de Atenção Psicossocial) — disponível pelo SUS. O CVV (Centro de Valorização da Vida) atende 24 horas pelo número 188, com escuta qualificada e gratuita."
                ]
            }
        ],
        "body": "O puerpério é um período de alta vulnerabilidade clínica. O Ministério da Saúde estima que complicações puerperais — físicas ou emocionais — afetam entre 10% e 20% das mulheres. Reconhecer os sinais precocemente pode salvar vidas: a maioria das mortes maternas pós-parto é evitável com acesso rápido ao cuidado.\n\nA presença de qualquer sinal abaixo não significa que você falhou. Significa que você está enfrentando um desafio que merece suporte qualificado.\n\nSinais físicos de emergência ou urgência\n\nSangramento intenso (hemorragia): Saturar mais de um absorvente por hora por duas horas consecutivas, ou sangramento que aumenta após estar diminuindo. É o principal sinal de hemorragia puerperal — emergência obstétrica. Vá ao pronto-socorro imediatamente.\n\nFebre acima de 38°C: Especialmente acompanhada de dor, inchaço, secreção com odor ou mal-estar geral. Pode indicar infecção puerperal — endometrite, infecção de episiorrafia ou mastite. Requer antibioticoterapia.\n\nDor intensa e progressiva: Dor abdominal, perineal ou mamária que piora ao invés de melhorar, especialmente entre o 3º e o 10º dia pós-parto.\n\nInchaço, calor ou vermelhidão nas pernas: Pode indicar trombose venosa profunda (TVP) — risco aumentado no puerpério pela hipercoagulabilidade fisiológica. Emergência vascular.\n\nDificuldade respiratória ou dor no peito: Emergência. Pode indicar embolia pulmonar — principal causa de morte materna tardia no Brasil, segundo o Ministério da Saúde.\n\nDificuldade persistente para urinar ou evacuar: Retenção urinária aguda é uma emergência. Constipação severa persistente além do 4º dia requer avaliação.\n\nSinais emocionais e mentais que requerem avaliação\n\nTristeza persistente além de 2 semanas: Choro frequente, sensação de vazio ou desesperança que não melhora — diferente do baby blues, que se resolve em até 14 dias. Pode ser depressão pós-parto.\n\nDesconexão com o bebê: Sentir-se indiferente, distante ou com dificuldade de se vincular ao bebê após as primeiras semanas. Sinal importante a ser avaliado.\n\nPensamentos intrusivos ou obsessivos: Imagens ou pensamentos repetitivos sobre algo ruim acontecer com o bebê, mesmo sem intenção de agir. São comuns na ansiedade pós-parto e têm tratamento eficaz.\n\nAnsiedade severa ou ataques de pânico: Preocupação paralisante, sensação constante de perigo iminente, palpitações, falta de ar sem causa física.\n\nPensamentos de se machucar ou machucar o bebê: Qualquer pensamento dessa natureza requer avaliação profissional imediata — sem julgamento. É um sinal de que o sistema nervoso está sobrecarregado e precisa de suporte. Não é sua culpa.\n\nComo buscar ajuda\n\nPara emergências físicas: pronto-socorro obstétrico. Para urgências e acompanhamento: seu obstetra, médico de família ou UBS de referência. Para saúde mental: psicólogo, psiquiatra perinatal ou CAPS (Centro de Atenção Psicossocial) — disponível pelo SUS. O CVV (Centro de Valorização da Vida) atende 24 horas pelo número 188, com escuta qualificada e gratuita.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "profissional."
    },
    {
        "id": "nutricao-recuperacao",
        "title": "Nutrição no puerpério: alimentar-se para recuperar.",
        "summary": "Alimentos e hábitos que apoiam cicatrização, energia e bem-estar durante a recuperação.",
        "category": "Nutrição",
        "tags": [
            "nutrição",
            "alimentação",
            "recuperação",
            "energia"
        ],
        "readTime": "9 min de leitura",
        "readingTimeMinutes": 9,
        "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Prato colorido com alimentos nutritivos e saudáveis.",
        "quote": "Você está alimentando um corpo que está se recuperando. Nutrição não é vaidade aqui: é parte essencial da cura.",
        "sections": [
            {
                "paragraphs": [
                    "Após o parto, seu corpo está em processo intenso de recuperação: cicatrização de tecidos, restauração do volume sanguíneo, equilíbrio hormonal e, se estiver amamentando, produção de leite — que demanda cerca de 500 kcal adicionais por dia, segundo a OMS. Nutrir-se adequadamente não é luxo: é o suporte fisiológico da sua recuperação.",
                    "O Ministério da Saúde orienta que a alimentação no puerpério siga os princípios do Guia Alimentar para a População Brasileira: alimentos in natura como base, refeições regulares e variedade de grupos alimentares."
                ]
            },
            {
                "title": "Nutrientes essenciais no pós-parto",
                "items": [
                    {
                        "title": "Proteína:",
                        "text": "Fundamental para cicatrização tecidual e recuperação muscular. A recomendação aumenta para 1,2 a 1,5 g/kg/dia no puerpério. Fontes: carnes magras, ovos, leguminosas (feijão, lentilha, grão-de-bico), iogurte natural, queijo."
                    },
                    {
                        "title": "Ferro:",
                        "text": "O parto envolve perda média de 300 a 500 ml de sangue. Reposição de ferro é crítica para prevenir anemia puerperal. Fontes heme (melhor absorção): carnes vermelhas, fígado. Fontes não heme: espinafre, feijão, lentilha — combinar com vitamina C aumenta a absorção."
                    },
                    {
                        "title": "Cálcio:",
                        "text": "Se estiver amamentando, o organismo mobiliza cálcio ósseo para a produção de leite — reposição dietética é essencial. Meta: 1.000 mg/dia. Fontes: leite e derivados, sardinha, tofu, couve, brócolis."
                    },
                    {
                        "title": "Vitamina D:",
                        "text": "Essencial para absorção de cálcio e imunidade. Deficiência é altamente prevalente no Brasil puerperal. Fontes: exposição solar (15 a 20 minutos/dia), peixes gordurosos, ovos. Suplementação frequentemente necessária — converse com seu médico."
                    },
                    {
                        "title": "Ômega-3 (DHA/EPA):",
                        "text": "Apoia recuperação do sistema nervoso, reduz inflamação e pode auxiliar na prevenção da depressão pós-parto, segundo estudos publicados no Journal of Affective Disorders. Fontes: salmão, sardinha, atum, sementes de linhaça, chia, nozes."
                    },
                    {
                        "title": "Fibras e hidratação:",
                        "text": "Constipação intestinal afeta até 40% das mulheres no pós-parto, agravada por analgésicos opioides e imobilidade. Meta: 25 a 35 g de fibra/dia e pelo menos 2 a 3 litros de água. Se amamentando, aumente para 3 a 3,5 litros."
                    }
                ]
            },
            {
                "title": "Refeições práticas para os primeiros meses",
                "paragraphs": [
                    "Você tem pouco tempo e energia. Priorize alimentos de preparo simples, que possam ser feitos com antecedência ou pedidos de ajuda:"
                ],
                "items": [
                    {
                        "title": "Café da manhã:",
                        "text": "Ovo mexido com pão integral e fruta. Ou aveia com banana, pasta de amendoim e chia. Algo rápido, com proteína e energia de baixo índice glicêmico."
                    },
                    {
                        "title": "Almoço e jantar:",
                        "text": "Arroz integral, feijão, proteína (frango, carne, ovo, peixe) e vegetais. A combinação arroz+feijão já oferece proteína completa e ferro. Simple e nutricionalmente sólida."
                    },
                    {
                        "title": "Lanches práticos:",
                        "text": "Iogurte natural com granola, mix de castanhas, queijo com fruta, hummus com cenoura. Sempre acessíveis — deixe à mão na bancada ou geladeira."
                    },
                    {
                        "title": "Hidratação estratégica:",
                        "text": "Deixe uma garrafa de água perto do local onde amamenta. A sensação de sede durante a amamentação é o sinal do corpo — não espere sentir sede intensa."
                    }
                ]
            },
            {
                "title": "O que limitar",
                "items": [
                    {
                        "title": "Cafeína:",
                        "text": "Passa para o leite materno. Limite a 200 mg/dia se amamentando (equivalente a 1 a 2 xícaras de café). Excesso pode causar irritabilidade e dificuldade para dormir no bebê."
                    },
                    {
                        "title": "Álcool:",
                        "text": "A OMS e o Ministério da Saúde recomendam abstinência durante a amamentação. Se houver consumo eventual, aguarde pelo menos 2 horas por dose consumida antes de amamentar."
                    },
                    {
                        "title": "Ultraprocessados:",
                        "text": "Alimentos ricos em sódio, açúcar refinado e gordura trans aumentam inflamação sistêmica e pioram a qualidade energética. Não são proibidos — mas não devem ser a base da alimentação."
                    }
                ]
            }
        ],
        "body": "Após o parto, seu corpo está em processo intenso de recuperação: cicatrização de tecidos, restauração do volume sanguíneo, equilíbrio hormonal e, se estiver amamentando, produção de leite — que demanda cerca de 500 kcal adicionais por dia, segundo a OMS. Nutrir-se adequadamente não é luxo: é o suporte fisiológico da sua recuperação.\n\nO Ministério da Saúde orienta que a alimentação no puerpério siga os princípios do Guia Alimentar para a População Brasileira: alimentos in natura como base, refeições regulares e variedade de grupos alimentares.\n\nNutrientes essenciais no pós-parto\n\nProteína: Fundamental para cicatrização tecidual e recuperação muscular. A recomendação aumenta para 1,2 a 1,5 g/kg/dia no puerpério. Fontes: carnes magras, ovos, leguminosas (feijão, lentilha, grão-de-bico), iogurte natural, queijo.\n\nFerro: O parto envolve perda média de 300 a 500 ml de sangue. Reposição de ferro é crítica para prevenir anemia puerperal. Fontes heme (melhor absorção): carnes vermelhas, fígado. Fontes não heme: espinafre, feijão, lentilha — combinar com vitamina C aumenta a absorção.\n\nCálcio: Se estiver amamentando, o organismo mobiliza cálcio ósseo para a produção de leite — reposição dietética é essencial. Meta: 1.000 mg/dia. Fontes: leite e derivados, sardinha, tofu, couve, brócolis.\n\nVitamina D: Essencial para absorção de cálcio e imunidade. Deficiência é altamente prevalente no Brasil puerperal. Fontes: exposição solar (15 a 20 minutos/dia), peixes gordurosos, ovos. Suplementação frequentemente necessária — converse com seu médico.\n\nÔmega-3 (DHA/EPA): Apoia recuperação do sistema nervoso, reduz inflamação e pode auxiliar na prevenção da depressão pós-parto, segundo estudos publicados no Journal of Affective Disorders. Fontes: salmão, sardinha, atum, sementes de linhaça, chia, nozes.\n\nFibras e hidratação: Constipação intestinal afeta até 40% das mulheres no pós-parto, agravada por analgésicos opioides e imobilidade. Meta: 25 a 35 g de fibra/dia e pelo menos 2 a 3 litros de água. Se amamentando, aumente para 3 a 3,5 litros.\n\nRefeições práticas para os primeiros meses\n\nVocê tem pouco tempo e energia. Priorize alimentos de preparo simples, que possam ser feitos com antecedência ou pedidos de ajuda:\n\nCafé da manhã: Ovo mexido com pão integral e fruta. Ou aveia com banana, pasta de amendoim e chia. Algo rápido, com proteína e energia de baixo índice glicêmico.\n\nAlmoço e jantar: Arroz integral, feijão, proteína (frango, carne, ovo, peixe) e vegetais. A combinação arroz+feijão já oferece proteína completa e ferro. Simple e nutricionalmente sólida.\n\nLanches práticos: Iogurte natural com granola, mix de castanhas, queijo com fruta, hummus com cenoura. Sempre acessíveis — deixe à mão na bancada ou geladeira.\n\nHidratação estratégica: Deixe uma garrafa de água perto do local onde amamenta. A sensação de sede durante a amamentação é o sinal do corpo — não espere sentir sede intensa.\n\nO que limitar\n\nCafeína: Passa para o leite materno. Limite a 200 mg/dia se amamentando (equivalente a 1 a 2 xícaras de café). Excesso pode causar irritabilidade e dificuldade para dormir no bebê.\n\nÁlcool: A OMS e o Ministério da Saúde recomendam abstinência durante a amamentação. Se houver consumo eventual, aguarde pelo menos 2 horas por dose consumida antes de amamentar.\n\nUltraprocessados: Alimentos ricos em sódio, açúcar refinado e gordura trans aumentam inflamação sistêmica e pioram a qualidade energética. Não são proibidos — mas não devem ser a base da alimentação.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "recuperar."
    },
    {
        "id": "relacionamento-durante-puerperio",
        "title": "Relacionamento e intimidade no puerpério.",
        "summary": "Compreender mudanças emocionais e físicas que impactam conexão e intimidade.",
        "category": "Relacionamento",
        "tags": [
            "relacionamento",
            "intimidade",
            "comunicação",
            "casal"
        ],
        "readTime": "10 min de leitura",
        "readingTimeMinutes": 10,
        "imageUrl": "https://images.unsplash.com/photo-1650658765299-c1470b7d9945?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Casal em momento de carinho e conexão durante o puerpério.",
        "quote": "Intimidade não é apenas sexual. É estar presente um com o outro durante a tempestade.",
        "sections": [
            {
                "paragraphs": [
                    "O relacionamento a dois passa por uma das maiores reorganizações da vida após o nascimento do bebê. Pesquisas do Gottman Institute mostram que 67% dos casais relatam queda significativa na satisfação conjugal no primeiro ano após o nascimento do primeiro filho. Isso não é falha do casal — é a pressão objetiva de uma nova realidade com menos sono, menos tempo e mais responsabilidade.",
                    "Compreender que essa mudança é esperada e transitória ajuda a atravessar esse período com mais compaixão e menos culpa."
                ]
            },
            {
                "title": "Mudanças sexuais: o que é normal",
                "paragraphs": [
                    "Seu corpo está em recuperação. Os hormônios estão em reorganização. Você tem pouco sono e muita responsabilidade. Nesse contexto, a redução ou ausência do desejo sexual é uma resposta fisiológica esperada — não um problema de relacionamento."
                ],
                "items": [
                    {
                        "title": "Redução da libido é fisiológica:",
                        "text": "Os hormônios de lactação (prolactina e ocitocina) suprimem os estrogênios, o que reduz lubrificação vaginal e libido. Isso pode durar meses após o desmame. Não há nada de errado com você nem com o relacionamento."
                    },
                    {
                        "title": "Retorno às relações sexuais:",
                        "text": "O Ministério da Saúde e o ACOG recomendam aguardar pelo menos 4 a 6 semanas para avaliação da cicatrização. Mas 'liberado' não significa 'obrigado'. O retorno deve ser desejado por ambos, gradual e confortável."
                    },
                    {
                        "title": "Toque não sexual tem grande valor:",
                        "text": "Abraços, carinhos, beijos e contato físico sem pressão sexual mantêm a conexão emocional e liberam ocitocina em ambos os parceiros — essencial para o vínculo nos momentos de baixa libido."
                    },
                    {
                        "title": "Comunique seus limites claramente:",
                        "text": "Dizer 'estou cansada e não tenho energia para sexo agora, mas gosto de você' é mais saudável para o relacionamento do que silêncio ou evasão. Clareza evita ressentimento acumulado."
                    }
                ]
            },
            {
                "title": "Dinâmicas práticas que mudam",
                "items": [
                    {
                        "title": "Divisão de tarefas:",
                        "text": "Pesquisas mostram que percepção de injustiça na divisão doméstica é um dos principais preditores de insatisfação conjugal no pós-parto. Conversas explícitas e combinados claros sobre quem faz o quê reduzem conflito."
                    },
                    {
                        "title": "O parceiro pode se sentir excluído:",
                        "text": "O vínculo mãe-bebê é intenso e biologicamente mediado pela amamentação. É compreensível que o parceiro se sinta periférico. Nomear isso abertamente — sem culpa de nenhum lado — abre espaço para adaptação."
                    },
                    {
                        "title": "Diferentes velocidades de adaptação:",
                        "text": "Um pode estar entusiasmado com a paternidade enquanto o outro está exausto. Um pode precisar de mais tempo sozinho enquanto o outro quer proximidade. Ambas as experiências são válidas e simultâneas."
                    }
                ]
            },
            {
                "title": "Como fortalecer a conexão nessa fase",
                "items": [
                    {
                        "title": "Check-ins diários breves:",
                        "text": "Reservar 5 a 10 minutos por dia para conversar sem o bebê como tema central. 'Como você está? Do que você precisa?'. O Gottman Institute chama isso de 'turning toward' — virar-se um para o outro."
                    },
                    {
                        "title": "Reconhecimento mútuo:",
                        "text": "Nomear o esforço do outro — 'obrigada por acordar de madrugada', 'vi o quanto você se dedicou hoje' — tem impacto desproporcional na satisfação conjugal, segundo pesquisas de psicologia positiva."
                    },
                    {
                        "title": "Momentos pequenos de qualidade:",
                        "text": "Não precisa ser noite de cinema. Podem ser 20 minutos de café juntos enquanto o bebê dorme, uma caminhada curta, assistir um episódio de série lado a lado. Consistência importa mais que grandiosidade."
                    },
                    {
                        "title": "Pedidos específicos funcionam melhor:",
                        "text": "Em vez de 'você nunca me ajuda', tente 'você poderia ficar com o bebê das 20h às 22h para eu descansar?'. Pedidos concretos e respeitosos são mais efetivos e menos ativadores de conflito."
                    }
                ]
            },
            {
                "title": "Quando considerar apoio profissional",
                "paragraphs": [
                    "Se há ressentimento acumulado, comunicação rompida, conflitos frequentes ou distância emocional persistente após 3 a 4 meses, terapia de casal pode ser muito útil. Isso não é sinal de que o relacionamento está falhando — é sinal de que vocês querem cuidar dele. Muitos casais relatam que a terapia iniciada no puerpério foi transformadora para o relacionamento a longo prazo."
                ]
            }
        ],
        "body": "O relacionamento a dois passa por uma das maiores reorganizações da vida após o nascimento do bebê. Pesquisas do Gottman Institute mostram que 67% dos casais relatam queda significativa na satisfação conjugal no primeiro ano após o nascimento do primeiro filho. Isso não é falha do casal — é a pressão objetiva de uma nova realidade com menos sono, menos tempo e mais responsabilidade.\n\nCompreender que essa mudança é esperada e transitória ajuda a atravessar esse período com mais compaixão e menos culpa.\n\nMudanças sexuais: o que é normal\n\nSeu corpo está em recuperação. Os hormônios estão em reorganização. Você tem pouco sono e muita responsabilidade. Nesse contexto, a redução ou ausência do desejo sexual é uma resposta fisiológica esperada — não um problema de relacionamento.\n\nRedução da libido é fisiológica: Os hormônios de lactação (prolactina e ocitocina) suprimem os estrogênios, o que reduz lubrificação vaginal e libido. Isso pode durar meses após o desmame. Não há nada de errado com você nem com o relacionamento.\n\nRetorno às relações sexuais: O Ministério da Saúde e o ACOG recomendam aguardar pelo menos 4 a 6 semanas para avaliação da cicatrização. Mas 'liberado' não significa 'obrigado'. O retorno deve ser desejado por ambos, gradual e confortável.\n\nToque não sexual tem grande valor: Abraços, carinhos, beijos e contato físico sem pressão sexual mantêm a conexão emocional e liberam ocitocina em ambos os parceiros — essencial para o vínculo nos momentos de baixa libido.\n\nComunique seus limites claramente: Dizer 'estou cansada e não tenho energia para sexo agora, mas gosto de você' é mais saudável para o relacionamento do que silêncio ou evasão. Clareza evita ressentimento acumulado.\n\nDinâmicas práticas que mudam\n\nDivisão de tarefas: Pesquisas mostram que percepção de injustiça na divisão doméstica é um dos principais preditores de insatisfação conjugal no pós-parto. Conversas explícitas e combinados claros sobre quem faz o quê reduzem conflito.\n\nO parceiro pode se sentir excluído: O vínculo mãe-bebê é intenso e biologicamente mediado pela amamentação. É compreensível que o parceiro se sinta periférico. Nomear isso abertamente — sem culpa de nenhum lado — abre espaço para adaptação.\n\nDiferentes velocidades de adaptação: Um pode estar entusiasmado com a paternidade enquanto o outro está exausto. Um pode precisar de mais tempo sozinho enquanto o outro quer proximidade. Ambas as experiências são válidas e simultâneas.\n\nComo fortalecer a conexão nessa fase\n\nCheck-ins diários breves: Reservar 5 a 10 minutos por dia para conversar sem o bebê como tema central. 'Como você está? Do que você precisa?'. O Gottman Institute chama isso de 'turning toward' — virar-se um para o outro.\n\nReconhecimento mútuo: Nomear o esforço do outro — 'obrigada por acordar de madrugada', 'vi o quanto você se dedicou hoje' — tem impacto desproporcional na satisfação conjugal, segundo pesquisas de psicologia positiva.\n\nMomentos pequenos de qualidade: Não precisa ser noite de cinema. Podem ser 20 minutos de café juntos enquanto o bebê dorme, uma caminhada curta, assistir um episódio de série lado a lado. Consistência importa mais que grandiosidade.\n\nPedidos específicos funcionam melhor: Em vez de 'você nunca me ajuda', tente 'você poderia ficar com o bebê das 20h às 22h para eu descansar?'. Pedidos concretos e respeitosos são mais efetivos e menos ativadores de conflito.\n\nQuando considerar apoio profissional\n\nSe há ressentimento acumulado, comunicação rompida, conflitos frequentes ou distância emocional persistente após 3 a 4 meses, terapia de casal pode ser muito útil. Isso não é sinal de que o relacionamento está falhando — é sinal de que vocês querem cuidar dele. Muitos casais relatam que a terapia iniciada no puerpério foi transformadora para o relacionamento a longo prazo.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "puerpério."
    },
    {
        "id": "depressao-pos-parto",
        "title": "Depressão pós-parto: reconhecer é o primeiro passo.",
        "summary": "O que é, como identificar e como buscar apoio — sem culpa e com informação de qualidade.",
        "category": "Saúde Mental",
        "tags": [
            "depressão pós-parto",
            "saúde mental",
            "DPP",
            "apoio profissional"
        ],
        "readTime": "11 min de leitura",
        "readingTimeMinutes": 11,
        "imageUrl": "https://plus.unsplash.com/premium_photo-1690443475241-2da4e318834b?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mulher em momento de reflexão e acolhimento.",
        "quote": "Depressão pós-parto não é fraqueza. Não é falta de amor pelo bebê. É uma condição de saúde — tratável e com suporte disponível.",
        "sections": [
            {
                "paragraphs": [
                    "A depressão pós-parto (DPP) afeta entre 10% e 20% das mulheres no Brasil, segundo o Ministério da Saúde — ou seja, aproximadamente 1 em cada 5 a 10 mães. Apesar de ser a complicação de saúde mental mais comum do puerpério, continua sendo subdiagnosticada e estigmatizada. Reconhecê-la não é fraqueza: é o ato de cuidado mais importante que você pode ter consigo mesma.",
                    "A DPP é diferente do baby blues. Enquanto o blues é uma reação hormonal breve (até 2 semanas), a DPP é uma condição clínica que persiste, se intensifica e interfere significativamente na vida diária. Tem causas biológicas, psicológicas e sociais — e tem tratamento eficaz."
                ]
            },
            {
                "title": "Causas e fatores de risco",
                "paragraphs": [
                    "A DPP é multifatorial. Os principais fatores de risco identificados pela FEBRASGO e pela literatura científica incluem: histórico pessoal de depressão ou ansiedade, baixo suporte social, conflito conjugal, gravidez não planejada, complicações no parto, dificuldades com amamentação, privação severa de sono e fatores socioeconômicos como renda baixa e vulnerabilidade social.",
                    "Importante: mesmo sem nenhum fator de risco aparente, qualquer mulher pode desenvolver DPP. A ausência de 'motivo aparente' não invalida o sofrimento."
                ]
            },
            {
                "title": "Como diferenciar baby blues de DPP",
                "items": [
                    {
                        "title": "Baby Blues:",
                        "text": "Surge nos primeiros 3 a 5 dias, é leve a moderado, e se resolve espontaneamente em até 2 semanas. Caracterizado por choro fácil, irritabilidade, ansiedade leve e oscilações de humor. Não requer tratamento específico — apenas apoio, descanso e suporte emocional."
                    },
                    {
                        "title": "Depressão Pós-Parto:",
                        "text": "Surge a qualquer momento no primeiro ano após o parto (mais frequentemente entre 2 e 8 semanas). Persiste por mais de 2 semanas, é mais intensa e interfere na capacidade de cuidar de si e do bebê. Requer avaliação e tratamento profissional."
                    },
                    {
                        "title": "Psicose Puerperal:",
                        "text": "Rara (1 a 2 casos por 1.000 nascimentos), mas grave. Caracterizada por alucinações, delírios, confusão e comportamento desorganizado. É uma emergência psiquiátrica — busque atendimento imediato."
                    }
                ]
            },
            {
                "title": "Sinais e sintomas da DPP",
                "paragraphs": [
                    "A Escala de Depressão Pós-Natal de Edimburgo (EPDS), validada em português e recomendada pelo Ministério da Saúde, é usada para rastreio. Os principais sintomas incluem:"
                ],
                "items": [
                    {
                        "title": "Tristeza persistente:",
                        "text": "Sentir-se triste, vazia ou sem esperança na maior parte dos dias, por mais de 2 semanas."
                    },
                    {
                        "title": "Perda de prazer:",
                        "text": "Não sentir alegria em coisas que antes eram prazerosas — incluindo o bebê."
                    },
                    {
                        "title": "Exaustão desproporcional:",
                        "text": "Fadiga além da esperada para a privação de sono — dificuldade de sair da cama mesmo quando há oportunidade de descanso."
                    },
                    {
                        "title": "Ansiedade intensa:",
                        "text": "Preocupação constante, dificuldade para relaxar, sensação de pânico, pensamentos catastróficos sobre o bebê."
                    },
                    {
                        "title": "Dificuldade de vínculo:",
                        "text": "Sentir-se distante, indiferente ou irritada com o bebê. Isso causa muita culpa — mas é sintoma, não caráter."
                    },
                    {
                        "title": "Pensamentos intrusivos:",
                        "text": "Imagens ou pensamentos repetitivos sobre algo ruim acontecer com o bebê ou consigo. São sintomas de ansiedade pós-parto — não intenção real."
                    },
                    {
                        "title": "Pensamentos de autolesão:",
                        "text": "Qualquer pensamento de se machucar ou machucar o bebê requer avaliação imediata. Não é julgamento — é cuidado."
                    }
                ]
            },
            {
                "title": "Tratamento: o que funciona",
                "paragraphs": [
                    "A DPP tem tratamento eficaz. As principais abordagens, segundo a FEBRASGO e o ACOG, incluem psicoterapia (especialmente Terapia Cognitivo-Comportamental — TCC — e Terapia Interpessoal), medicação antidepressiva (vários são compatíveis com amamentação — o médico indica o mais seguro), apoio social estruturado e grupos de suporte para mães.",
                    "O tratamento precoce está associado a recuperação mais rápida e menor impacto no desenvolvimento do bebê. Não espere 'melhorar sozinha' por semanas — busque avaliação ao reconhecer os sinais."
                ]
            },
            {
                "title": "Como buscar ajuda no Brasil",
                "paragraphs": [
                    "Pelo SUS: UBS (Unidade Básica de Saúde), CAPS (Centro de Atenção Psicossocial) ou maternidade de referência. Pelo convênio ou particular: obstetra, psicólogo ou psiquiatra perinatal. CVV: 188 (24 horas, gratuito, escuta qualificada). Se houver pensamentos de autolesão: pronto-socorro psiquiátrico ou SAMU (192)."
                ]
            }
        ],
        "body": "A depressão pós-parto (DPP) afeta entre 10% e 20% das mulheres no Brasil, segundo o Ministério da Saúde — ou seja, aproximadamente 1 em cada 5 a 10 mães. Apesar de ser a complicação de saúde mental mais comum do puerpério, continua sendo subdiagnosticada e estigmatizada. Reconhecê-la não é fraqueza: é o ato de cuidado mais importante que você pode ter consigo mesma.\n\nA DPP é diferente do baby blues. Enquanto o blues é uma reação hormonal breve (até 2 semanas), a DPP é uma condição clínica que persiste, se intensifica e interfere significativamente na vida diária. Tem causas biológicas, psicológicas e sociais — e tem tratamento eficaz.\n\nCausas e fatores de risco\n\nA DPP é multifatorial. Os principais fatores de risco identificados pela FEBRASGO e pela literatura científica incluem: histórico pessoal de depressão ou ansiedade, baixo suporte social, conflito conjugal, gravidez não planejada, complicações no parto, dificuldades com amamentação, privação severa de sono e fatores socioeconômicos como renda baixa e vulnerabilidade social.\n\nImportante: mesmo sem nenhum fator de risco aparente, qualquer mulher pode desenvolver DPP. A ausência de 'motivo aparente' não invalida o sofrimento.\n\nComo diferenciar baby blues de DPP\n\nBaby Blues: Surge nos primeiros 3 a 5 dias, é leve a moderado, e se resolve espontaneamente em até 2 semanas. Caracterizado por choro fácil, irritabilidade, ansiedade leve e oscilações de humor. Não requer tratamento específico — apenas apoio, descanso e suporte emocional.\n\nDepressão Pós-Parto: Surge a qualquer momento no primeiro ano após o parto (mais frequentemente entre 2 e 8 semanas). Persiste por mais de 2 semanas, é mais intensa e interfere na capacidade de cuidar de si e do bebê. Requer avaliação e tratamento profissional.\n\nPsicose Puerperal: Rara (1 a 2 casos por 1.000 nascimentos), mas grave. Caracterizada por alucinações, delírios, confusão e comportamento desorganizado. É uma emergência psiquiátrica — busque atendimento imediato.\n\nSinais e sintomas da DPP\n\nA Escala de Depressão Pós-Natal de Edimburgo (EPDS), validada em português e recomendada pelo Ministério da Saúde, é usada para rastreio. Os principais sintomas incluem:\n\nTristeza persistente: Sentir-se triste, vazia ou sem esperança na maior parte dos dias, por mais de 2 semanas.\n\nPerda de prazer: Não sentir alegria em coisas que antes eram prazerosas — incluindo o bebê.\n\nExaustão desproporcional: Fadiga além da esperada para a privação de sono — dificuldade de sair da cama mesmo quando há oportunidade de descanso.\n\nAnsiedade intensa: Preocupação constante, dificuldade para relaxar, sensação de pânico, pensamentos catastróficos sobre o bebê.\n\nDificuldade de vínculo: Sentir-se distante, indiferente ou irritada com o bebê. Isso causa muita culpa — mas é sintoma, não caráter.\n\nPensamentos intrusivos: Imagens ou pensamentos repetitivos sobre algo ruim acontecer com o bebê ou consigo. São sintomas de ansiedade pós-parto — não intenção real.\n\nPensamentos de autolesão: Qualquer pensamento de se machucar ou machucar o bebê requer avaliação imediata. Não é julgamento — é cuidado.\n\nTratamento: o que funciona\n\nA DPP tem tratamento eficaz. As principais abordagens, segundo a FEBRASGO e o ACOG, incluem psicoterapia (especialmente Terapia Cognitivo-Comportamental — TCC — e Terapia Interpessoal), medicação antidepressiva (vários são compatíveis com amamentação — o médico indica o mais seguro), apoio social estruturado e grupos de suporte para mães.\n\nO tratamento precoce está associado a recuperação mais rápida e menor impacto no desenvolvimento do bebê. Não espere 'melhorar sozinha' por semanas — busque avaliação ao reconhecer os sinais.\n\nComo buscar ajuda no Brasil\n\nPelo SUS: UBS (Unidade Básica de Saúde), CAPS (Centro de Atenção Psicossocial) ou maternidade de referência. Pelo convênio ou particular: obstetra, psicólogo ou psiquiatra perinatal. CVV: 188 (24 horas, gratuito, escuta qualificada). Se houver pensamentos de autolesão: pronto-socorro psiquiátrico ou SAMU (192).",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "reconhecer",
        "badge": "Importante"
    },
    {
        "id": "recuperacao-pos-cesariana",
        "title": "Recuperação após a cesariana: cuidando da cicatriz e do corpo.",
        "summary": "Orientações baseadas em evidências para uma recuperação segura após o parto cirúrgico.",
        "category": "Saúde Física",
        "tags": [
            "cesariana",
            "cicatriz",
            "recuperação",
            "cirurgia"
        ],
        "readTime": "12 min de leitura",
        "readingTimeMinutes": 12,
        "imageUrl": "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mulher em repouso confortável após procedimento médico.",
        "quote": "Cesariana é parto. Seu corpo passou por uma cirurgia de grande porte. Você merece o mesmo cuidado e respeito na recuperação.",
        "sections": [
            {
                "paragraphs": [
                    "A cesariana corresponde a mais de 55% dos partos no Brasil — uma das taxas mais altas do mundo, segundo dados do Ministério da Saúde. É uma cirurgia abdominal de grande porte que envolve incisão em 7 camadas de tecido: pele, tecido subcutâneo, fáscia, músculo reto abdominal, peritônio parietal, peritônio visceral e útero. A recuperação é mais longa e complexa que a do parto vaginal.",
                    "Compreender o processo de cicatrização e as limitações reais da recuperação ajuda a evitar complicações e a ter expectativas realistas sobre o tempo necessário."
                ]
            },
            {
                "title": "Fases da cicatrização da ferida cirúrgica",
                "paragraphs": [
                    "A cicatrização ocorre em fases bem definidas: fase inflamatória (dias 1 a 5) — vermelhidão, inchaço e dor são normais; fase proliferativa (dias 5 a 21) — formação de colágeno, a cicatriz pode parecer elevada e endurecida; fase de remodelação (3 semanas a 2 anos) — a cicatriz amadurece, clareia e amolece gradualmente. Cada fase tem cuidados específicos."
                ]
            },
            {
                "title": "Cuidados com a incisão nos primeiros dias",
                "items": [
                    {
                        "title": "Higiene da ferida:",
                        "text": "Lave com água corrente morna e sabonete neutro uma vez ao dia no banho. Seque com gaze estéril ou toalha limpa com toque suave. O Ministério da Saúde não recomenda uso rotineiro de antissépticos como álcool ou povidona na ferida cicatrizante."
                    },
                    {
                        "title": "Curativos:",
                        "text": "O curativo oclusivo é geralmente retirado após 24 a 48 horas. Após isso, a ferida pode ficar aberta ao ar ou com curativo simples, conforme orientação do seu profissional."
                    },
                    {
                        "title": "Observe sinais de infecção:",
                        "text": "Febre acima de 38°C, aumento de dor, secreção purulenta ou com odor, abertura da sutura (deiscência) ou vermelhidão crescente exigem avaliação médica imediata."
                    },
                    {
                        "title": "Evite umidade excessiva:",
                        "text": "Nos primeiros 10 a 14 dias, evite banhos de banheira, piscina e mar. Umidade prolongada retarda a cicatrização e aumenta risco de infecção."
                    }
                ]
            },
            {
                "title": "Limitações de movimento e atividades",
                "items": [
                    {
                        "title": "Primeiros 7 a 10 dias — repouso relativo:",
                        "text": "Suba e desça da cama com apoio dos braços, evitando contrair os abdominais. Para levantar, vire de lado primeiro e use os braços. Evite dirigir."
                    },
                    {
                        "title": "Primeiras 6 semanas — sem esforço abdominal:",
                        "text": "Sem levantamento de peso acima de 5 kg (exceto o bebê), sem exercícios abdominais, sem corrida ou atividades de impacto. A fascia abdominal leva 6 a 8 semanas para recuperar resistência estrutural."
                    },
                    {
                        "title": "Retorno ao trabalho:",
                        "text": "O Ministério da Saúde recomenda repouso de pelo menos 40 dias. Trabalhos que exijam esforço físico requerem avaliação médica individualizada."
                    },
                    {
                        "title": "Exercício Kegel:",
                        "text": "Pode e deve ser iniciado precocemente — a partir do 2º ao 3º dia pós-operatório, salvo complicações. Protege o assoalho pélvico e melhora circulação na região pélvica."
                    }
                ]
            },
            {
                "title": "Dor: o que esperar e como manejar",
                "paragraphs": [
                    "Dor é esperada e deve ser tratada ativamente — dor não controlada dificulta amamentação, mobilização e recuperação. O Ministério da Saúde recomenda analgesia multimodal: paracetamol + ibuprofeno em doses regulares nas primeiras 48 a 72 horas, com opioides apenas se necessário. Amamentação é compatível com esses analgésicos.",
                    "A dor tende a melhorar progressivamente. Se piorar após os primeiros dias, especialmente com febre ou outros sinais, busque avaliação."
                ]
            },
            {
                "title": "Cuidados com a cicatriz a longo prazo",
                "paragraphs": [
                    "Após 4 a 6 semanas, com a ferida totalmente fechada, você pode iniciar massagem da cicatriz — técnica recomendada pela fisioterapia pélvica para prevenir aderências e sensibilização dolorosa. A cicatriz deve ser protegida do sol por pelo menos 1 ano (protetor solar FPS 50+ ou cobertura física), pois a exposição solar precoce pode escurecê-la permanentemente."
                ]
            }
        ],
        "body": "A cesariana corresponde a mais de 55% dos partos no Brasil — uma das taxas mais altas do mundo, segundo dados do Ministério da Saúde. É uma cirurgia abdominal de grande porte que envolve incisão em 7 camadas de tecido: pele, tecido subcutâneo, fáscia, músculo reto abdominal, peritônio parietal, peritônio visceral e útero. A recuperação é mais longa e complexa que a do parto vaginal.\n\nCompreender o processo de cicatrização e as limitações reais da recuperação ajuda a evitar complicações e a ter expectativas realistas sobre o tempo necessário.\n\nFases da cicatrização da ferida cirúrgica\n\nA cicatrização ocorre em fases bem definidas: fase inflamatória (dias 1 a 5) — vermelhidão, inchaço e dor são normais; fase proliferativa (dias 5 a 21) — formação de colágeno, a cicatriz pode parecer elevada e endurecida; fase de remodelação (3 semanas a 2 anos) — a cicatriz amadurece, clareia e amolece gradualmente. Cada fase tem cuidados específicos.\n\nCuidados com a incisão nos primeiros dias\n\nHigiene da ferida: Lave com água corrente morna e sabonete neutro uma vez ao dia no banho. Seque com gaze estéril ou toalha limpa com toque suave. O Ministério da Saúde não recomenda uso rotineiro de antissépticos como álcool ou povidona na ferida cicatrizante.\n\nCurativos: O curativo oclusivo é geralmente retirado após 24 a 48 horas. Após isso, a ferida pode ficar aberta ao ar ou com curativo simples, conforme orientação do seu profissional.\n\nObserve sinais de infecção: Febre acima de 38°C, aumento de dor, secreção purulenta ou com odor, abertura da sutura (deiscência) ou vermelhidão crescente exigem avaliação médica imediata.\n\nEvite umidade excessiva: Nos primeiros 10 a 14 dias, evite banhos de banheira, piscina e mar. Umidade prolongada retarda a cicatrização e aumenta risco de infecção.\n\nLimitações de movimento e atividades\n\nPrimeiros 7 a 10 dias — repouso relativo: Suba e desça da cama com apoio dos braços, evitando contrair os abdominais. Para levantar, vire de lado primeiro e use os braços. Evite dirigir.\n\nPrimeiras 6 semanas — sem esforço abdominal: Sem levantamento de peso acima de 5 kg (exceto o bebê), sem exercícios abdominais, sem corrida ou atividades de impacto. A fascia abdominal leva 6 a 8 semanas para recuperar resistência estrutural.\n\nRetorno ao trabalho: O Ministério da Saúde recomenda repouso de pelo menos 40 dias. Trabalhos que exijam esforço físico requerem avaliação médica individualizada.\n\nExercício Kegel: Pode e deve ser iniciado precocemente — a partir do 2º ao 3º dia pós-operatório, salvo complicações. Protege o assoalho pélvico e melhora circulação na região pélvica.\n\nDor: o que esperar e como manejar\n\nDor é esperada e deve ser tratada ativamente — dor não controlada dificulta amamentação, mobilização e recuperação. O Ministério da Saúde recomenda analgesia multimodal: paracetamol + ibuprofeno em doses regulares nas primeiras 48 a 72 horas, com opioides apenas se necessário. Amamentação é compatível com esses analgésicos.\n\nA dor tende a melhorar progressivamente. Se piorar após os primeiros dias, especialmente com febre ou outros sinais, busque avaliação.\n\nCuidados com a cicatriz a longo prazo\n\nApós 4 a 6 semanas, com a ferida totalmente fechada, você pode iniciar massagem da cicatriz — técnica recomendada pela fisioterapia pélvica para prevenir aderências e sensibilização dolorosa. A cicatriz deve ser protegida do sol por pelo menos 1 ano (protetor solar FPS 50+ ou cobertura física), pois a exposição solar precoce pode escurecê-la permanentemente.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "cicatriz"
    },
    {
        "id": "assoalho-pelvico-pos-parto",
        "title": "Assoalho pélvico no pós-parto: por que cuidar e como.",
        "summary": "Entenda o que acontece com o assoalho pélvico e como recuperá-lo com segurança após o parto.",
        "category": "Saúde Física",
        "tags": [
            "assoalho pélvico",
            "Kegel",
            "incontinência",
            "fisioterapia pélvica"
        ],
        "readTime": "10 min de leitura",
        "readingTimeMinutes": 10,
        "imageUrl": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mulher em postura de bem-estar e cuidado corporal.",
        "quote": "O assoalho pélvico sustenta o seu mundo. Cuidar dele é cuidar da sua qualidade de vida.",
        "sections": [
            {
                "paragraphs": [
                    "O assoalho pélvico é um conjunto de músculos, ligamentos e fáscias que sustenta a bexiga, o útero e o reto. Durante a gestação, suporta o peso crescente do bebê — chegando a 3 a 4 kg no término — e durante o parto vaginal, sofre estiramento de até 3 vezes seu comprimento normal. Estudos de ressonância magnética mostram que em até 30% dos partos vaginais há algum grau de lesão muscular.",
                    "Tanto o parto vaginal quanto a cesariana podem afetar o assoalho pélvico — no caso da cesariana, pelo peso da gestação e pela pressão do segundo estágio do trabalho de parto, caso tenha ocorrido."
                ]
            },
            {
                "title": "Sinais de disfunção do assoalho pélvico",
                "paragraphs": [
                    "Muitas mulheres normalizam sintomas que têm tratamento eficaz. Fique atenta a:"
                ],
                "items": [
                    {
                        "title": "Incontinência urinária de esforço:",
                        "text": "Perda de urina ao tossir, espirrar, rir ou fazer esforço. Afeta até 35% das mulheres no pós-parto imediato. É tratável — não é 'normal' e não precisa ser tolerada."
                    },
                    {
                        "title": "Urgência miccional:",
                        "text": "Vontade súbita e intensa de urinar, difícil de adiar. Pode indicar bexiga hiperativa, tratável com fisioterapia."
                    },
                    {
                        "title": "Dor pélvica ou perineal:",
                        "text": "Dor persistente na região pélvica, períneo ou durante relações sexuais (dispareunia) após a cicatrização pode indicar disfunção muscular tratável."
                    },
                    {
                        "title": "Sensação de peso ou pressão vaginal:",
                        "text": "Sensação de 'algo saindo' pela vagina pode ser sinal de prolapso de órgãos pélvicos — condição tratável, mais comum com múltiplos partos vaginais."
                    }
                ]
            },
            {
                "title": "Exercícios de Kegel: como fazer corretamente",
                "paragraphs": [
                    "Os exercícios de Kegel — contrações voluntárias do assoalho pélvico — são recomendados pelo Ministério da Saúde e pela Fisioterapia desde os primeiros dias pós-parto. São seguros, discretos e podem ser feitos em qualquer posição."
                ],
                "items": [
                    {
                        "title": "Identifique o músculo correto:",
                        "text": "Imagine que está tentando interromper o fluxo de urina ou segurar gases. A contração deve ser interna — sem contrair barriga, glúteos ou coxas. Se contrair esses músculos, não está isolando o assoalho pélvico."
                    },
                    {
                        "title": "Contração rápida (Kegel rápido):",
                        "text": "Contraia e relaxe rapidamente, 10 vezes seguidas. Fortalece as fibras musculares rápidas, responsáveis pela continência em situações de esforço."
                    },
                    {
                        "title": "Contração sustentada (Kegel lento):",
                        "text": "Contraia e mantenha por 5 a 10 segundos, relaxe completamente por igual tempo. Repita 10 vezes. Fortalece as fibras lentas de sustentação postural."
                    },
                    {
                        "title": "Frequência recomendada:",
                        "text": "3 séries de 10 repetições, 3 vezes ao dia. Os efeitos começam a ser percebidos em 4 a 6 semanas de prática regular, segundo revisão Cochrane sobre exercícios pélvicos no pós-parto."
                    }
                ]
            },
            {
                "title": "Fisioterapia pélvica: quando buscar",
                "paragraphs": [
                    "O Ministério da Saúde e a FEBRASGO recomendam avaliação por fisioterapeuta especializado em saúde pélvica para todas as mulheres no pós-parto — especialmente se houver qualquer um dos sintomas acima, histórico de episiotomia ou laceração grau 3 ou 4, dificuldade para realizar os exercícios corretamente ou dor pélvica persistente.",
                    "A fisioterapia pélvica é disponível pelo SUS em algumas regiões e por convênios. O tratamento precoce é mais eficaz e previne cronificação das disfunções."
                ]
            }
        ],
        "body": "O assoalho pélvico é um conjunto de músculos, ligamentos e fáscias que sustenta a bexiga, o útero e o reto. Durante a gestação, suporta o peso crescente do bebê — chegando a 3 a 4 kg no término — e durante o parto vaginal, sofre estiramento de até 3 vezes seu comprimento normal. Estudos de ressonância magnética mostram que em até 30% dos partos vaginais há algum grau de lesão muscular.\n\nTanto o parto vaginal quanto a cesariana podem afetar o assoalho pélvico — no caso da cesariana, pelo peso da gestação e pela pressão do segundo estágio do trabalho de parto, caso tenha ocorrido.\n\nSinais de disfunção do assoalho pélvico\n\nMuitas mulheres normalizam sintomas que têm tratamento eficaz. Fique atenta a:\n\nIncontinência urinária de esforço: Perda de urina ao tossir, espirrar, rir ou fazer esforço. Afeta até 35% das mulheres no pós-parto imediato. É tratável — não é 'normal' e não precisa ser tolerada.\n\nUrgência miccional: Vontade súbita e intensa de urinar, difícil de adiar. Pode indicar bexiga hiperativa, tratável com fisioterapia.\n\nDor pélvica ou perineal: Dor persistente na região pélvica, períneo ou durante relações sexuais (dispareunia) após a cicatrização pode indicar disfunção muscular tratável.\n\nSensação de peso ou pressão vaginal: Sensação de 'algo saindo' pela vagina pode ser sinal de prolapso de órgãos pélvicos — condição tratável, mais comum com múltiplos partos vaginais.\n\nExercícios de Kegel: como fazer corretamente\n\nOs exercícios de Kegel — contrações voluntárias do assoalho pélvico — são recomendados pelo Ministério da Saúde e pela Fisioterapia desde os primeiros dias pós-parto. São seguros, discretos e podem ser feitos em qualquer posição.\n\nIdentifique o músculo correto: Imagine que está tentando interromper o fluxo de urina ou segurar gases. A contração deve ser interna — sem contrair barriga, glúteos ou coxas. Se contrair esses músculos, não está isolando o assoalho pélvico.\n\nContração rápida (Kegel rápido): Contraia e relaxe rapidamente, 10 vezes seguidas. Fortalece as fibras musculares rápidas, responsáveis pela continência em situações de esforço.\n\nContração sustentada (Kegel lento): Contraia e mantenha por 5 a 10 segundos, relaxe completamente por igual tempo. Repita 10 vezes. Fortalece as fibras lentas de sustentação postural.\n\nFrequência recomendada: 3 séries de 10 repetições, 3 vezes ao dia. Os efeitos começam a ser percebidos em 4 a 6 semanas de prática regular, segundo revisão Cochrane sobre exercícios pélvicos no pós-parto.\n\nFisioterapia pélvica: quando buscar\n\nO Ministério da Saúde e a FEBRASGO recomendam avaliação por fisioterapeuta especializado em saúde pélvica para todas as mulheres no pós-parto — especialmente se houver qualquer um dos sintomas acima, histórico de episiotomia ou laceração grau 3 ou 4, dificuldade para realizar os exercícios corretamente ou dor pélvica persistente.\n\nA fisioterapia pélvica é disponível pelo SUS em algumas regiões e por convênios. O tratamento precoce é mais eficaz e previne cronificação das disfunções.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "cuidar"
    },
    {
        "id": "cuidados-recem-nascido",
        "title": "Cuidados com o recém-nascido: o essencial para os primeiros dias.",
        "summary": "Orientações práticas baseadas na SBP e no Ministério da Saúde para os primeiros cuidados com o bebê.",
        "category": "Cuidados com o Bebê",
        "tags": [
            "recém-nascido",
            "cuidados",
            "banho",
            "coto umbilical",
            "sono seguro"
        ],
        "readTime": "13 min de leitura",
        "readingTimeMinutes": 13,
        "imageUrl": "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Bebê recém-nascido em momento de cuidado carinhoso.",
        "quote": "Você não precisa saber tudo para cuidar bem do seu bebê. Você só precisa estar presente, atenta e saber onde buscar ajuda.",
        "sections": [
            {
                "paragraphs": [
                    "Os primeiros dias com um recém-nascido são ao mesmo tempo intensos e desconcertantes. Dúvidas sobre banho, coto umbilical, choro, sono e alimentação são absolutamente normais — ninguém nasce sabendo. Este artigo reúne as orientações da Sociedade Brasileira de Pediatria (SBP) e do Ministério da Saúde para os cuidados mais frequentes."
                ]
            },
            {
                "title": "Banho: quando começar e como fazer",
                "paragraphs": [
                    "A OMS e a SBP recomendam adiar o primeiro banho por pelo menos 24 horas após o nascimento — de preferência 48 horas. O vérnix caseoso (substância branca que cobre o bebê) tem propriedades antimicrobianas, hidratantes e termoreguladoras. Removê-lo precocemente aumenta o risco de hipotermia e infecção."
                ],
                "items": [
                    {
                        "title": "Frequência:",
                        "text": "Banho completo 2 a 3 vezes por semana é suficiente para recém-nascidos saudáveis. A limpeza diária deve ser focada na área das fraldas após cada troca."
                    },
                    {
                        "title": "Temperatura da água:",
                        "text": "Entre 36°C e 37°C. Teste com o cotovelo ou termômetro — nunca com a mão, que tolera temperaturas mais altas."
                    },
                    {
                        "title": "Produtos:",
                        "text": "Use sabonete líquido infantil de pH neutro (pH 5,5 a 7,0), sem fragrância. Menos é mais — a pele do recém-nascido tem microbioma próprio que não deve ser perturbado."
                    },
                    {
                        "title": "Coto umbilical:",
                        "text": "Mantenha seco e exposto ao ar. O Ministério da Saúde orienta limpeza com álcool 70% após cada troca de fralda, movendo suavemente o coto. Cai espontaneamente entre o 7º e o 21º dia."
                    }
                ]
            },
            {
                "title": "Sono seguro: prevenção da morte súbita",
                "paragraphs": [
                    "A Síndrome da Morte Súbita do Lactente (SMSL) é a principal causa de morte em bebês de 1 a 12 meses em países desenvolvidos. A SBP e o Ministério da Saúde recomendam o protocolo ABC para sono seguro:"
                ],
                "items": [
                    {
                        "title": "A de Alone (sozinho):",
                        "text": "O bebê deve dormir no próprio berço ou moisés, no mesmo quarto dos pais, mas não na mesma cama. Co-sleeping aumenta significativamente o risco de SMSL e sufocamento acidental."
                    },
                    {
                        "title": "B de Back (de costas):",
                        "text": "Sempre posicione o bebê de costas para dormir — nunca de bruços ou de lado — até que ele consiga se virar sozinho (geralmente após os 4 a 6 meses)."
                    },
                    {
                        "title": "C de Crib (berço seguro):",
                        "text": "Superfície firme e plana, sem travesseiros, edredons, protetores de berço, pelúcias ou qualquer objeto macio. O berço deve seguir as normas ABNT de segurança."
                    },
                    {
                        "title": "Temperatura do quarto:",
                        "text": "Entre 20°C e 22°C. Bebês superaquecidos têm maior risco. Vista-os com uma camada a mais que você usaria — mas sem exagerar."
                    }
                ]
            },
            {
                "title": "Entendendo o choro do recém-nascido",
                "paragraphs": [
                    "O choro é a única forma de comunicação do recém-nascido. Não é possível 'mimar' um bebê respondendo ao choro — estudos longitudinais mostram que bebês cujo choro é atendido prontamente desenvolvem maior segurança emocional e choram menos aos 12 meses."
                ],
                "items": [
                    {
                        "title": "Fome:",
                        "text": "O choro mais frequente. Sinais pré-choro de fome: sugar o punho, virar a cabeça, bocejar. Ofereça o seio ou a mamadeira antes do choro intenso — é mais fácil para ambos."
                    },
                    {
                        "title": "Desconforto físico:",
                        "text": "Fralda suja, roupa apertada, calor ou frio, posição desconfortável. Verifique sistematicamente."
                    },
                    {
                        "title": "Cólica:",
                        "text": "Choro intenso, inconsolável, geralmente no fim do dia, em bebês de 2 a 16 semanas. Afeta cerca de 20% dos bebês. Estratégias: colo no ombro, movimento de balanço, barulho branco, massagem abdominal suave no sentido horário."
                    },
                    {
                        "title": "Necessidade de colo:",
                        "text": "Bebês têm necessidade biológica de contato. Colo, pele a pele e método canguru (preconizado pelo Ministério da Saúde) regulam temperatura, frequência cardíaca e estado emocional do bebê."
                    }
                ]
            },
            {
                "title": "Rastreios e vacinas essenciais",
                "paragraphs": [
                    "O Ministério da Saúde estabelece rastreios obrigatórios nos primeiros dias: Teste do Pezinho (entre o 3º e 5º dia de vida — rastreia hipotireoidismo, fenilcetonúria e outras doenças metabólicas), Teste da Orelhinha (otoemissões acústicas — rastreio de surdez), Teste do Olhinho (reflexo vermelho — rastreio de catarata e retinoblastoma) e Teste do Coraçãozinho (oximetria de pulso — rastreio de cardiopatias congênitas).",
                    "A primeira vacina — BCG e Hepatite B — é aplicada ainda na maternidade. Siga o calendário vacinal do SUS rigorosamente: é gratuito e protege contra doenças graves."
                ]
            }
        ],
        "body": "Os primeiros dias com um recém-nascido são ao mesmo tempo intensos e desconcertantes. Dúvidas sobre banho, coto umbilical, choro, sono e alimentação são absolutamente normais — ninguém nasce sabendo. Este artigo reúne as orientações da Sociedade Brasileira de Pediatria (SBP) e do Ministério da Saúde para os cuidados mais frequentes.\n\nBanho: quando começar e como fazer\n\nA OMS e a SBP recomendam adiar o primeiro banho por pelo menos 24 horas após o nascimento — de preferência 48 horas. O vérnix caseoso (substância branca que cobre o bebê) tem propriedades antimicrobianas, hidratantes e termoreguladoras. Removê-lo precocemente aumenta o risco de hipotermia e infecção.\n\nFrequência: Banho completo 2 a 3 vezes por semana é suficiente para recém-nascidos saudáveis. A limpeza diária deve ser focada na área das fraldas após cada troca.\n\nTemperatura da água: Entre 36°C e 37°C. Teste com o cotovelo ou termômetro — nunca com a mão, que tolera temperaturas mais altas.\n\nProdutos: Use sabonete líquido infantil de pH neutro (pH 5,5 a 7,0), sem fragrância. Menos é mais — a pele do recém-nascido tem microbioma próprio que não deve ser perturbado.\n\nCoto umbilical: Mantenha seco e exposto ao ar. O Ministério da Saúde orienta limpeza com álcool 70% após cada troca de fralda, movendo suavemente o coto. Cai espontaneamente entre o 7º e o 21º dia.\n\nSono seguro: prevenção da morte súbita\n\nA Síndrome da Morte Súbita do Lactente (SMSL) é a principal causa de morte em bebês de 1 a 12 meses em países desenvolvidos. A SBP e o Ministério da Saúde recomendam o protocolo ABC para sono seguro:\n\nA de Alone (sozinho): O bebê deve dormir no próprio berço ou moisés, no mesmo quarto dos pais, mas não na mesma cama. Co-sleeping aumenta significativamente o risco de SMSL e sufocamento acidental.\n\nB de Back (de costas): Sempre posicione o bebê de costas para dormir — nunca de bruços ou de lado — até que ele consiga se virar sozinho (geralmente após os 4 a 6 meses).\n\nC de Crib (berço seguro): Superfície firme e plana, sem travesseiros, edredons, protetores de berço, pelúcias ou qualquer objeto macio. O berço deve seguir as normas ABNT de segurança.\n\nTemperatura do quarto: Entre 20°C e 22°C. Bebês superaquecidos têm maior risco. Vista-os com uma camada a mais que você usaria — mas sem exagerar.\n\nEntendendo o choro do recém-nascido\n\nO choro é a única forma de comunicação do recém-nascido. Não é possível 'mimar' um bebê respondendo ao choro — estudos longitudinais mostram que bebês cujo choro é atendido prontamente desenvolvem maior segurança emocional e choram menos aos 12 meses.\n\nFome: O choro mais frequente. Sinais pré-choro de fome: sugar o punho, virar a cabeça, bocejar. Ofereça o seio ou a mamadeira antes do choro intenso — é mais fácil para ambos.\n\nDesconforto físico: Fralda suja, roupa apertada, calor ou frio, posição desconfortável. Verifique sistematicamente.\n\nCólica: Choro intenso, inconsolável, geralmente no fim do dia, em bebês de 2 a 16 semanas. Afeta cerca de 20% dos bebês. Estratégias: colo no ombro, movimento de balanço, barulho branco, massagem abdominal suave no sentido horário.\n\nNecessidade de colo: Bebês têm necessidade biológica de contato. Colo, pele a pele e método canguru (preconizado pelo Ministério da Saúde) regulam temperatura, frequência cardíaca e estado emocional do bebê.\n\nRastreios e vacinas essenciais\n\nO Ministério da Saúde estabelece rastreios obrigatórios nos primeiros dias: Teste do Pezinho (entre o 3º e 5º dia de vida — rastreia hipotireoidismo, fenilcetonúria e outras doenças metabólicas), Teste da Orelhinha (otoemissões acústicas — rastreio de surdez), Teste do Olhinho (reflexo vermelho — rastreio de catarata e retinoblastoma) e Teste do Coraçãozinho (oximetria de pulso — rastreio de cardiopatias congênitas).\n\nA primeira vacina — BCG e Hepatite B — é aplicada ainda na maternidade. Siga o calendário vacinal do SUS rigorosamente: é gratuito e protege contra doenças graves.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "essencial"
    },
    {
        "id": "retorno-trabalho-puerperio",
        "title": "Retorno ao trabalho após o parto: seus direitos e seu bem-estar.",
        "summary": "Entenda seus direitos trabalhistas, como preparar o retorno e cuidar de si nessa transição.",
        "category": "Vida e Trabalho",
        "tags": [
            "trabalho",
            "licença-maternidade",
            "direitos",
            "amamentação"
        ],
        "readTime": "10 min de leitura",
        "readingTimeMinutes": 10,
        "imageUrl": "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=900&q=80",
        "imageAlt": "Mulher em ambiente de trabalho em momento de equilíbrio e foco.",
        "quote": "Voltar ao trabalho não é abandonar o bebê. É uma transição que pode ser feita com planejamento, cuidado e respeito aos seus limites.",
        "sections": [
            {
                "paragraphs": [
                    "O retorno ao trabalho após a licença-maternidade é uma das transições mais emocionalmente complexas do pós-parto. Culpa, ansiedade de separação, dúvidas sobre amamentação e adaptação a uma nova rotina são sentimentos completamente normais. Conhecer seus direitos e planejar com antecedência reduz significativamente o estresse dessa transição."
                ]
            },
            {
                "title": "Seus direitos garantidos por lei",
                "items": [
                    {
                        "title": "Licença-maternidade:",
                        "text": "120 dias garantidos pela CLT (Art. 392) e Constituição Federal. Empresas participantes do Programa Empresa Cidadã (Lei 11.770/2008) oferecem 180 dias. O benefício é pago pelo INSS via empregador."
                    },
                    {
                        "title": "Estabilidade no emprego:",
                        "text": "A empregada gestante tem estabilidade desde a confirmação da gravidez até 5 meses após o parto (Súmula 244 do TST), mesmo em contrato temporário."
                    },
                    {
                        "title": "Intervalos para amamentação:",
                        "text": "Até que o filho complete 6 meses, a mãe tem direito a dois descansos especiais de 30 minutos cada durante a jornada de trabalho para amamentação (CLT, Art. 396). Esse prazo pode ser estendido por indicação médica."
                    },
                    {
                        "title": "Licença-paternidade:",
                        "text": "5 dias pela CLT; 20 dias para empresas do Programa Empresa Cidadã. Pai ou co-genitor também tem direito a faltar ao trabalho em consultas médicas da gestante."
                    }
                ]
            },
            {
                "title": "Amamentação e trabalho: é possível conciliar",
                "paragraphs": [
                    "A OMS e o Ministério da Saúde recomendam amamentação exclusiva até os 6 meses. Para mães que retornam ao trabalho antes disso, a ordenha e o armazenamento do leite são estratégias viáveis."
                ],
                "items": [
                    {
                        "title": "Ordene no trabalho:",
                        "text": "Use os intervalos garantidos por lei para ordenhar. Uma bomba de tirar leite elétrica dupla reduz o tempo de ordenha para 10 a 15 minutos por sessão."
                    },
                    {
                        "title": "Armazenamento correto do leite:",
                        "text": "Leite ordenhado pode ser mantido em temperatura ambiente por até 4 horas, refrigerado (0°C a 4°C) por até 5 dias, ou congelado (-20°C) por até 15 dias. Use potes esterilizados específicos para armazenamento."
                    },
                    {
                        "title": "Converse com RH:",
                        "text": "Negocie antecipadamente um espaço privado, higiênico e refrigerado para ordenha. Muitas empresas oferecem isso voluntariamente ou por obrigação em municípios com legislação específica."
                    },
                    {
                        "title": "Aceite a adaptação gradual:",
                        "text": "Bebês em desmame por volta dos 4 a 6 meses (ao retorno da mãe) podem precisar de 1 a 2 semanas para se adaptar à mamadeira. Introduza a mamadeira gradualmente antes do retorno."
                    }
                ]
            },
            {
                "title": "Bem-estar emocional na transição",
                "paragraphs": [
                    "Sentir culpa ao retornar ao trabalho é extremamente comum — mas culpa não é evidência de que você está fazendo algo errado. Estudos mostram que filhos de mães que trabalham têm desenvolvimento equivalente ao de filhos de mães que ficam em casa, quando há cuidado de qualidade e vínculo seguro.",
                    "Se o impacto emocional for intenso — choro frequente, dificuldade de concentração, ansiedade severa — considere apoio psicológico. A transição profissional é também uma transição identitária, e merece cuidado."
                ]
            }
        ],
        "body": "O retorno ao trabalho após a licença-maternidade é uma das transições mais emocionalmente complexas do pós-parto. Culpa, ansiedade de separação, dúvidas sobre amamentação e adaptação a uma nova rotina são sentimentos completamente normais. Conhecer seus direitos e planejar com antecedência reduz significativamente o estresse dessa transição.\n\nSeus direitos garantidos por lei\n\nLicença-maternidade: 120 dias garantidos pela CLT (Art. 392) e Constituição Federal. Empresas participantes do Programa Empresa Cidadã (Lei 11.770/2008) oferecem 180 dias. O benefício é pago pelo INSS via empregador.\n\nEstabilidade no emprego: A empregada gestante tem estabilidade desde a confirmação da gravidez até 5 meses após o parto (Súmula 244 do TST), mesmo em contrato temporário.\n\nIntervalos para amamentação: Até que o filho complete 6 meses, a mãe tem direito a dois descansos especiais de 30 minutos cada durante a jornada de trabalho para amamentação (CLT, Art. 396). Esse prazo pode ser estendido por indicação médica.\n\nLicença-paternidade: 5 dias pela CLT; 20 dias para empresas do Programa Empresa Cidadã. Pai ou co-genitor também tem direito a faltar ao trabalho em consultas médicas da gestante.\n\nAmamentação e trabalho: é possível conciliar\n\nA OMS e o Ministério da Saúde recomendam amamentação exclusiva até os 6 meses. Para mães que retornam ao trabalho antes disso, a ordenha e o armazenamento do leite são estratégias viáveis.\n\nOrdene no trabalho: Use os intervalos garantidos por lei para ordenhar. Uma bomba de tirar leite elétrica dupla reduz o tempo de ordenha para 10 a 15 minutos por sessão.\n\nArmazenamento correto do leite: Leite ordenhado pode ser mantido em temperatura ambiente por até 4 horas, refrigerado (0°C a 4°C) por até 5 dias, ou congelado (-20°C) por até 15 dias. Use potes esterilizados específicos para armazenamento.\n\nConverse com RH: Negocie antecipadamente um espaço privado, higiênico e refrigerado para ordenha. Muitas empresas oferecem isso voluntariamente ou por obrigação em municípios com legislação específica.\n\nAceite a adaptação gradual: Bebês em desmame por volta dos 4 a 6 meses (ao retorno da mãe) podem precisar de 1 a 2 semanas para se adaptar à mamadeira. Introduza a mamadeira gradualmente antes do retorno.\n\nBem-estar emocional na transição\n\nSentir culpa ao retornar ao trabalho é extremamente comum — mas culpa não é evidência de que você está fazendo algo errado. Estudos mostram que filhos de mães que trabalham têm desenvolvimento equivalente ao de filhos de mães que ficam em casa, quando há cuidado de qualidade e vínculo seguro.\n\nSe o impacto emocional for intenso — choro frequente, dificuldade de concentração, ansiedade severa — considere apoio psicológico. A transição profissional é também uma transição identitária, e merece cuidado.",
        "author": {
            "name": "Equipe Maia",
            "role": "editorial"
        },
        "status": "published",
        "source": "maia-seed",
        "highlightWord": "direitos"
    }
]

LEGACY_SEED_CONTENT_IDS = {"rede-de-apoio"}


def now_iso():
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def serialize_firestore_value(value):
    if isinstance(value, dict):
        return {key: serialize_firestore_value(current_value) for key, current_value in value.items()}

    if isinstance(value, list):
        return [serialize_firestore_value(item) for item in value]

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return value


def error_response(message, http_status=status.HTTP_400_BAD_REQUEST, code="request_error"):
    return Response(
        {
            "erro": message,
            "code": code,
            "status": http_status,
        },
        status=http_status,
    )


def success_response(payload=None, http_status=status.HTTP_200_OK):
    return Response(payload or {"mensagem": "Operacao realizada com sucesso."}, status=http_status)


def get_db():
    return get_firestore_client()


def get_document_payload(snapshot):
    if not snapshot.exists:
        return None

    data = snapshot.to_dict() or {}
    data.setdefault("id", snapshot.id)

    return serialize_firestore_value(data)


def list_collection(collection_name, predicate=None):
    items = []

    for snapshot in get_db().collection(collection_name).stream():
        item = get_document_payload(snapshot)

        if item and (predicate is None or predicate(item)):
            items.append(item)

    return items


def sort_by_created_at(items, reverse=True):
    return sorted(items, key=lambda item: item.get("createdAt") or "", reverse=reverse)


def get_user(uid):
    return get_document_payload(get_db().collection("users").document(uid).get())


def current_user(request):
    return get_user(request.user.uid) or {}


def user_roles(user):
    roles = user.get("roles")

    if isinstance(roles, list):
        return [role for role in roles if isinstance(role, str)]

    if isinstance(roles, str):
        return [roles]

    return []


def is_professional_or_admin(user, request):
    return user_is_admin(request.user) or "PRO" in user_roles(user)


def is_pending_professional(user, request):
    return (
        not user_is_admin(request.user)
        and "PRO" in user_roles(user)
        and user.get("professionalVerificationStatus") != "verified"
    )


def get_content_image_payload(data):
    tags = data.get("tags") if isinstance(data.get("tags"), list) else []
    searchable = " ".join(
        [
            str(data.get("category") or ""),
            str(data.get("title") or ""),
            " ".join(str(tag) for tag in tags),
        ]
    ).lower()

    if "sono" in searchable or "descanso" in searchable or "cansaco" in searchable:
        preset = CONTENT_IMAGE_PRESETS["sono"]
    elif "respir" in searchable or "ansiedade" in searchable or "medo" in searchable:
        preset = CONTENT_IMAGE_PRESETS["respiracao"]
    elif "prepar" in searchable or "gesta" in searchable or "bebe" in searchable:
        preset = CONTENT_IMAGE_PRESETS["preparacao"]
    elif "apoio" in searchable or "rede" in searchable or "culpa" in searchable:
        preset = CONTENT_IMAGE_PRESETS["apoio"]
    else:
        preset = CONTENT_IMAGE_PRESETS["default"]

    return {
        "imageUrl": data.get("imageUrl") or preset["imageUrl"],
        "imageAlt": data.get("imageAlt") or preset["imageAlt"],
    }


def ensure_admin(request):
    if user_is_admin(request.user):
        return None

    return error_response("Voce nao tem permissao para acessar esta area.", status.HTTP_403_FORBIDDEN)


def ensure_content_seeded():
    db = get_db()
    current_seed_ids = {content["id"] for content in SEED_CONTENTS}

    for content_id in LEGACY_SEED_CONTENT_IDS - current_seed_ids:
        db.collection(CONTENT_COLLECTION).document(content_id).delete()

    for content in SEED_CONTENTS:
        ref = db.collection(CONTENT_COLLECTION).document(content["id"])
        snapshot = ref.get()
        existing = snapshot.to_dict() if snapshot.exists else {}

        ref.set(
            {
                **content,
                **get_content_image_payload(content),
                "createdAt": existing.get("createdAt") or server_timestamp(),
                "updatedAt": server_timestamp(),
            }
        )


def check_in_payload(data, uid, existing=None):
    existing = existing or {}
    emotion = (
        data.get("emotion")
        or data.get("emotionId")
        or data.get("humor")
        or existing.get("emotion")
        or existing.get("emotionId")
    )

    if not emotion:
        return None

    intensity = data.get("intensity", data.get("energy", data.get("energia", existing.get("intensity"))))
    energy = data.get("energy", intensity if intensity is not None else existing.get("energy"))
    sleep_quality = (
        data.get("sleepQuality")
        or data.get("sleep")
        or data.get("sono")
        or existing.get("sleepQuality")
    )
    received_support = (
        data.get("receivedSupport")
        or data.get("support")
        or data.get("apoioRecebido")
        or existing.get("receivedSupport")
    )
    tags = data.get("tags") or data.get("feelings") or data.get("sentimentos") or existing.get("tags") or []
    note = data.get("note") if "note" in data else data.get("observacao", existing.get("note", ""))

    if not isinstance(tags, list):
        tags = []

    payload = {
        **existing,
        "userId": uid,
        "emotion": emotion,
        "emotionId": data.get("emotionId") or emotion,
        "intensity": intensity,
        "energy": energy,
        "sleepQuality": sleep_quality,
        "receivedSupport": received_support,
        "tags": [tag for tag in tags if isinstance(tag, str)][:10],
        "note": note,
        "recordedAt": data.get("recordedAt") or data.get("date") or existing.get("recordedAt") or now_iso(),
        "updatedAt": server_timestamp(),
    }

    return {key: value for key, value in payload.items() if value is not None}


class CheckInListView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        admin_user = user_is_admin(request.user)
        requested_user_id = request.GET.get("userId")

        items = list_collection(
            CHECK_IN_COLLECTION,
            lambda item: item.get("status") != "deleted"
            and (
                item.get("userId") == request.user.uid
                or (admin_user and (not requested_user_id or item.get("userId") == requested_user_id))
            ),
        )

        return success_response({"checkIns": sort_by_created_at(items)})

    def post(self, request):
        payload = check_in_payload(request.data, request.user.uid)

        if not payload:
            return error_response("Informe o humor principal do check-in.")

        ref = get_db().collection(CHECK_IN_COLLECTION).document()
        payload = {
            **payload,
            "id": ref.id,
            "createdAt": server_timestamp(),
            "status": "active",
        }
        ref.set(payload)

        return success_response({"checkIn": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class CheckInDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_check_in(self, request, check_in_id):
        ref = get_db().collection(CHECK_IN_COLLECTION).document(check_in_id)
        item = get_document_payload(ref.get())

        if not item or item.get("status") == "deleted":
            return ref, None, error_response("Check-in nao encontrado.", status.HTTP_404_NOT_FOUND)

        if item.get("userId") != request.user.uid and not user_is_admin(request.user):
            return ref, item, error_response(
                "Voce nao tem permissao para acessar este check-in.",
                status.HTTP_403_FORBIDDEN,
            )

        return ref, item, None

    def get(self, request, check_in_id):
        _, item, permission_error = self.get_check_in(request, check_in_id)

        if permission_error:
            return permission_error

        return success_response({"checkIn": item})

    def patch(self, request, check_in_id):
        ref, item, permission_error = self.get_check_in(request, check_in_id)

        if permission_error:
            return permission_error

        payload = check_in_payload(request.data, request.user.uid, item)

        if not payload:
            return error_response("Informe o humor principal do check-in.")

        ref.update(payload)

        return success_response({"checkIn": get_document_payload(ref.get())})

    def put(self, request, check_in_id):
        return self.patch(request, check_in_id)

    def delete(self, request, check_in_id):
        ref, _, permission_error = self.get_check_in(request, check_in_id)

        if permission_error:
            return permission_error

        ref.update({"status": "deleted", "deletedAt": server_timestamp(), "updatedAt": server_timestamp()})

        return success_response({"mensagem": "Check-in removido."})


class NavigationView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = current_user(request)
        roles = set(user_roles(user))
        items = [
            {"id": "home", "href": "/home", "label": "Home"},
            {"id": "community", "href": "/comunidade", "label": "Comunidade"},
            {"id": "contents", "href": "/conteudos", "label": "Conteudos"},
            {"id": "profile", "href": "/perfil", "label": "Perfil"},
            {"id": "more", "href": "/mais", "label": "Mais"},
        ]

        if "PUE" in roles or user_is_admin(request.user):
            items.insert(1, {"id": "history", "href": "/historico", "label": "Historico"})

        if user_is_admin(request.user):
            items.append({"id": "admin", "href": "/admin", "label": "Admin"})

        return success_response({"navigation": items})


class CheckInSummaryView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.GET.get("period", "weekly")
        days = 30 if period == "monthly" else 7
        start = datetime.utcnow() - timedelta(days=days)
        admin_user = user_is_admin(request.user)
        requested_user_id = request.GET.get("userId")
        check_ins = list_collection(
            CHECK_IN_COLLECTION,
            lambda item: item.get("status") != "deleted"
            and (
                item.get("userId") == request.user.uid
                or (admin_user and (not requested_user_id or item.get("userId") == requested_user_id))
            ),
        )
        recent = []

        for item in check_ins:
            recorded_at = str(item.get("recordedAt") or item.get("createdAt") or "")

            try:
                parsed_date = datetime.fromisoformat(recorded_at.replace("Z", "+00:00")).replace(tzinfo=None)
            except ValueError:
                parsed_date = datetime.utcnow()

            if parsed_date >= start:
                recent.append(item)

        emotion_frequency = {}
        sleep_scores = {"poor": 1, "Pouco sono": 1, "interrupted": 2, "Sono interrompido": 2, "rested": 3, "Consegui descansar": 3}
        sleep_total = 0
        sleep_count = 0
        intensity_total = 0
        intensity_count = 0
        tags = {}

        for item in recent:
            emotion = item.get("emotion") or item.get("emotionId")
            if emotion:
                emotion_frequency[emotion] = emotion_frequency.get(emotion, 0) + 1

            sleep = item.get("sleepQuality")
            if sleep in sleep_scores:
                sleep_total += sleep_scores[sleep]
                sleep_count += 1

            try:
                intensity_total += int(item.get("intensity") or item.get("energy") or 0)
                intensity_count += 1
            except (TypeError, ValueError):
                pass

            for tag in item.get("tags") or []:
                tags[tag] = tags.get(tag, 0) + 1

        recurring_patterns = [
            {"tag": tag, "count": count}
            for tag, count in sorted(tags.items(), key=lambda current: current[1], reverse=True)
            if count > 1
        ][:5]
        top_emotion = max(emotion_frequency, key=emotion_frequency.get) if emotion_frequency else None
        insight_message = (
            "Percebemos alguns registros recorrentes. Se isso persistir, considere buscar apoio profissional."
            if recurring_patterns
            else "Continue registrando seus sentimentos para acompanhar sua semana com mais clareza."
        )

        if top_emotion:
            insight_message = (
                f"{top_emotion} apareceu com mais frequencia nos seus check-ins. "
                "Observe esse padrao com cuidado e acolhimento."
            )

        summary = {
            "period": period,
            "totalCheckIns": len(recent),
            "emotionFrequency": emotion_frequency,
            "averageSleep": round(sleep_total / sleep_count, 2) if sleep_count else None,
            "averageIntensity": round(intensity_total / intensity_count, 2) if intensity_count else None,
            "recentCheckIns": sort_by_created_at(recent)[:5],
            "recurringPatterns": recurring_patterns,
            "insight": {"message": insight_message},
        }

        return success_response({"summary": summary, **summary})


class ContentsListView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_content_seeded()
        items = list_collection(
            CONTENT_COLLECTION,
            lambda item: item.get("status", "published") == "published"
            or user_is_admin(request.user)
            or (item.get("author") or {}).get("uid") == request.user.uid,
        )

        return success_response({"contents": sort_by_created_at(items, reverse=False)})

    def post(self, request):
        user = current_user(request)

        if not is_professional_or_admin(user, request):
            return error_response("Somente profissionais ou administradores podem criar conteudos.", status.HTTP_403_FORBIDDEN)

        title = request.data.get("title")

        if not title:
            return error_response("Titulo e obrigatorio.")

        ref = get_db().collection(CONTENT_COLLECTION).document()
        payload = {
            "id": ref.id,
            "title": title,
            "summary": request.data.get("summary") or "",
            "category": request.data.get("category") or "Geral",
            "tags": request.data.get("tags") if isinstance(request.data.get("tags"), list) else [],
            "readingTimeMinutes": request.data.get("readingTimeMinutes") or request.data.get("readingTime") or 5,
            "body": request.data.get("body") or "",
            "author": {
                "uid": request.user.uid,
                "name": user.get("fullName") or "Maia",
                "role": user.get("profileCode") or "PRO",
            },
            **get_content_image_payload(request.data),
            "status": request.data.get("status", "published") if user_is_admin(request.user) else "pending-review",
            "createdAt": server_timestamp(),
            "updatedAt": server_timestamp(),
        }
        ref.set(payload)

        return success_response({"content": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class ContentImageUploadView(APIView):
    authentication_classes = [FirebaseAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, content_id):
        ref = get_db().collection(CONTENT_COLLECTION).document(content_id)
        item = get_document_payload(ref.get())

        if not item:
            return error_response("Conteudo nao encontrado.", status.HTTP_404_NOT_FOUND)

        author_uid = (item.get("author") or {}).get("uid")

        if author_uid != request.user.uid and not user_is_admin(request.user):
            return error_response("Voce nao tem permissao para alterar esta imagem.", status.HTTP_403_FORBIDDEN)

        image = request.FILES.get("image") or request.FILES.get("file")

        if not image:
            return error_response("Envie uma imagem para o conteudo.")

        content_type = image.content_type or mimetypes.guess_type(image.name)[0] or ""

        if content_type not in ALLOWED_IMAGE_TYPES:
            return error_response("Envie apenas imagens JPG, PNG ou WebP.", status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        if image.size > MAX_AVATAR_SIZE_BYTES:
            return error_response("A imagem deve ter no maximo 5 MB.", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

        try:
            bucket = get_storage_bucket()
            token = str(uuid.uuid4())
            extension = ALLOWED_IMAGE_TYPES[content_type]
            storage_path = f"contents/{content_id}/{uuid.uuid4().hex}{extension}"
            blob = bucket.blob(storage_path)
            blob.metadata = {"firebaseStorageDownloadTokens": token}
            blob.upload_from_file(image, content_type=content_type)

            image_url = (
                f"https://firebasestorage.googleapis.com/v0/b/{settings.FIREBASE_STORAGE_BUCKET}/o/"
                f"{quote(storage_path, safe='')}?alt=media&token={token}"
            )
            ref.update(
                {
                    "imageUrl": image_url,
                    "imageAlt": request.data.get("imageAlt") or item.get("imageAlt") or item.get("title") or "Imagem do conteudo Maia",
                    "imageStoragePath": storage_path,
                    "updatedAt": server_timestamp(),
                }
            )

            return success_response({"content": get_document_payload(ref.get())})
        except FirebaseNotConfiguredError as exc:
            return error_response(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            return error_response("Nao foi possivel salvar a imagem do conteudo.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContentDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_content(self, request, content_id):
        ensure_content_seeded()
        ref = get_db().collection(CONTENT_COLLECTION).document(content_id)
        item = get_document_payload(ref.get())

        if not item:
            return ref, None, error_response("Conteudo nao encontrado.", status.HTTP_404_NOT_FOUND)

        if (
            item.get("status") != "published"
            and not user_is_admin(request.user)
            and (item.get("author") or {}).get("uid") != request.user.uid
        ):
            return ref, item, error_response("Conteudo indisponivel.", status.HTTP_404_NOT_FOUND)

        return ref, item, None

    def get(self, request, content_id):
        _, item, permission_error = self.get_content(request, content_id)

        if permission_error:
            return permission_error

        return success_response({"content": item})

    def patch(self, request, content_id):
        ref, item, permission_error = self.get_content(request, content_id)

        if permission_error:
            return permission_error

        user = current_user(request)
        author_uid = (item.get("author") or {}).get("uid")

        if author_uid != request.user.uid and not user_is_admin(request.user):
            return error_response("Voce nao tem permissao para editar este conteudo.", status.HTTP_403_FORBIDDEN)

        allowed = {"title", "summary", "category", "tags", "readingTimeMinutes", "body", "status"}
        payload = {key: value for key, value in request.data.items() if key in allowed}

        if "status" in payload and not user_is_admin(request.user):
            payload["status"] = "pending-review"

        payload["updatedAt"] = server_timestamp()
        payload["reviewedBy"] = request.user.uid if user_is_admin(request.user) else item.get("reviewedBy")
        ref.update(payload)

        return success_response({"content": get_document_payload(ref.get()), "user": user})

    def put(self, request, content_id):
        return self.patch(request, content_id)

    def delete(self, request, content_id):
        ref, _, permission_error = self.get_content(request, content_id)

        if permission_error:
            return permission_error

        if not user_is_admin(request.user):
            return error_response("Somente administradores podem remover conteudos.", status.HTTP_403_FORBIDDEN)

        ref.update({"status": "archived", "updatedAt": server_timestamp()})

        return success_response({"mensagem": "Conteudo arquivado."})


RECOMMENDATION_PATTERN_RULES = [
    {
        "id": "sono-baixo-recorrente",
        "label": "Sono baixo ou descanso insuficiente",
        "threshold": 1,
        "keywords": ["sono", "descanso", "cansaco", "cansada", "exausta", "exaustao", "interrompido", "poor"],
        "signals": ["sono", "descanso", "energia"],
        "contentTags": ["sono", "descanso", "recuperacao", "energia"],
        "contentIds": ["sono-descanso-puerperio", "nutricao-recuperacao"],
    },
    {
        "id": "ansiedade-ou-medo",
        "label": "Ansiedade, medo ou pensamentos acelerados",
        "threshold": 1,
        "keywords": ["ansiedade", "ansiosa", "medo", "panico", "panic", "preocupada", "pensativa", "respiracao"],
        "signals": ["ansiedade", "respiracao", "autocuidado"],
        "contentTags": ["ansiedade", "respiracao", "bem-estar mental", "autocuidado", "emocoes"],
        "contentIds": ["respiracao-para-ansiedade", "navegando-nas-emocoes"],
    },
    {
        "id": "tristeza-recorrente",
        "label": "Tristeza ou melancolia recorrente",
        "threshold": 1,
        "keywords": ["triste", "tristeza", "melanc", "desesperanca", "isolada", "sozinha"],
        "signals": ["acolhimento", "autocompaixao", "saude mental"],
        "contentTags": ["saude mental", "autocompaixao", "bem-estar mental", "puerperio", "emocoes"],
        "contentIds": ["navegando-nas-emocoes", "depressao-pos-parto", "sinais-alerta-puerperio"],
    },
    {
        "id": "apoio-insuficiente",
        "label": "Rede de apoio ausente ou insuficiente",
        "threshold": 1,
        "keywords": ["sem apoio", "apoio insuficiente", "nao recebi apoio", "sozinha", "sobrecarga"],
        "signals": ["apoio", "rede", "relacionamento"],
        "contentTags": ["apoio", "rede", "relacionamento", "autocompaixao"],
        "contentIds": ["relacionamento-durante-puerperio", "navegando-nas-emocoes"],
    },
    {
        "id": "recuperacao-fisica",
        "label": "Recuperacao fisica e cicatrizacao",
        "threshold": 1,
        "keywords": ["dor", "perineo", "cicatriz", "cicatrizacao", "cesarea", "cesariana", "sangramento", "assoalho"],
        "signals": ["recuperacao", "saude fisica", "cicatrizacao"],
        "contentTags": ["recuperacao", "perineo", "cicatrizacao", "assoalho pelvico", "saude fisica"],
        "contentIds": ["recuperacao-fisica-perineal", "recuperacao-pos-cesariana", "assoalho-pelvico-pos-parto"],
    },
    {
        "id": "amamentacao",
        "label": "Duvidas ou desafios na amamentacao",
        "threshold": 1,
        "keywords": ["amamentacao", "aleitamento", "pega", "leite", "lactacao", "mama", "mamilo"],
        "signals": ["amamentacao", "aleitamento", "bebe"],
        "contentTags": ["amamentacao", "aleitamento", "bebe", "lactacao"],
        "contentIds": ["amamentacao-guia-pratico"],
    },
    {
        "id": "cuidados-bebe",
        "label": "Cuidados com o bebe",
        "threshold": 1,
        "keywords": ["bebe", "recem-nascido", "choro", "colica", "banho", "coto", "vacina"],
        "signals": ["bebe", "cuidados", "sono seguro"],
        "contentTags": ["recem-nascido", "cuidados", "sono seguro", "bebe"],
        "contentIds": ["cuidados-recem-nascido"],
    },
    {
        "id": "alimentacao-e-energia",
        "label": "Energia baixa e alimentacao",
        "threshold": 1,
        "keywords": ["energia", "fome", "alimentacao", "nutricao", "fraca", "exausta", "recuperacao"],
        "signals": ["energia", "nutricao", "recuperacao"],
        "contentTags": ["nutricao", "energia", "recuperacao", "bem-estar"],
        "contentIds": ["nutricao-recuperacao"],
    },
    {
        "id": "relacionamento-intimidade",
        "label": "Relacionamento e intimidade em transicao",
        "threshold": 1,
        "keywords": ["relacionamento", "parceiro", "intimidade", "sexo", "libido", "divisao"],
        "signals": ["relacionamento", "apoio", "intimidade"],
        "contentTags": ["relacionamento", "apoio", "puerperio"],
        "contentIds": ["relacionamento-durante-puerperio"],
    },
    {
        "id": "retorno-trabalho",
        "label": "Retorno ao trabalho e direitos",
        "threshold": 1,
        "keywords": ["trabalho", "licenca", "direitos", "retorno", "emprego", "rh"],
        "signals": ["trabalho", "direitos", "amamentacao"],
        "contentTags": ["trabalho", "licenca-maternidade", "direitos", "amamentacao"],
        "contentIds": ["retorno-trabalho-puerperio"],
    },
    {
        "id": "preparacao-jornada",
        "label": "Preparacao para o puerperio",
        "threshold": 1,
        "keywords": ["gestante", "preparacao", "gravidez", "parto", "jornada"],
        "signals": ["preparacao", "puerperio", "apoio"],
        "contentTags": ["preparacao", "puerperio", "apoio"],
        "contentIds": ["preparando-sua-jornada"],
    },
]


def normalize_pattern_text(value):
    if value is None:
        return ""

    text = unicodedata.normalize("NFKD", str(value).lower())

    return "".join(character for character in text if not unicodedata.combining(character))


def recommendation_number(value):
    if value is None:
        return None

    try:
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None


def recommendation_search_text(check_in):
    tags = check_in.get("tags") if isinstance(check_in.get("tags"), list) else []
    parts = [
        check_in.get("emotion"),
        check_in.get("emotionId"),
        check_in.get("sleepQuality"),
        check_in.get("receivedSupport"),
        check_in.get("note"),
        " ".join(str(tag) for tag in tags),
    ]

    return normalize_pattern_text(" ".join(str(part) for part in parts if part))


def check_in_has_low_sleep(check_in, search_text):
    sleep = normalize_pattern_text(check_in.get("sleepQuality"))

    return (
        sleep in {"poor", "pouco sono", "sono interrompido", "interrupted"}
        or "pouco sono" in search_text
        or "sono ruim" in search_text
        or "sono interrompido" in search_text
    )


def check_in_has_support_gap(check_in, search_text):
    support = normalize_pattern_text(check_in.get("receivedSupport"))

    return (
        support in {"no", "nao", "não", "none", "sem apoio"}
        or "sem apoio" in search_text
        or "nao recebi apoio" in search_text
        or "apoio insuficiente" in search_text
    )


def add_recommendation_pattern(context, rule, strength):
    if strength <= 0:
        return

    context["patterns"].append(
        {
            "id": rule["id"],
            "label": rule["label"],
            "strength": strength,
            "signals": rule["signals"],
        }
    )

    for signal in rule["signals"]:
        normalized_signal = normalize_pattern_text(signal)
        context["signals"].add(normalized_signal)
        context["contentWeights"][normalized_signal] += 2 + strength

    for tag in rule["contentTags"]:
        context["contentWeights"][normalize_pattern_text(tag)] += 3 + strength

    for content_id in rule["contentIds"]:
        context["preferredContentIds"][content_id] += 6 + strength


def build_recommendation_context(check_ins, user):
    context = {
        "signals": set(),
        "patterns": [],
        "contentWeights": Counter(),
        "preferredContentIds": Counter(),
    }
    search_texts = [recommendation_search_text(item) for item in check_ins]
    tag_counter = Counter()
    intensity_values = []
    high_intensity_count = 0
    low_sleep_count = 0
    support_gap_count = 0

    for item, search_text in zip(check_ins, search_texts):
        for tag in item.get("tags") or []:
            normalized_tag = normalize_pattern_text(tag)

            if normalized_tag:
                tag_counter[normalized_tag] += 1

        intensity = recommendation_number(item.get("intensity") or item.get("energy"))

        if intensity is not None:
            intensity_values.append(intensity)

            if intensity >= 4:
                high_intensity_count += 1

        if check_in_has_low_sleep(item, search_text):
            low_sleep_count += 1

        if check_in_has_support_gap(item, search_text):
            support_gap_count += 1

    for rule in RECOMMENDATION_PATTERN_RULES:
        strength = sum(
            1
            for search_text in search_texts
            if any(keyword in search_text for keyword in rule["keywords"])
        )

        if rule["id"] == "sono-baixo-recorrente":
            strength = max(strength, low_sleep_count)
        elif rule["id"] == "apoio-insuficiente":
            strength = max(strength, support_gap_count)

        if strength >= rule["threshold"]:
            add_recommendation_pattern(context, rule, strength)

    average_intensity = sum(intensity_values) / len(intensity_values) if intensity_values else None

    if high_intensity_count >= 2 or (average_intensity is not None and average_intensity >= 4):
        add_recommendation_pattern(
            context,
            {
                "id": "intensidade-alta-recorrente",
                "label": "Registros com intensidade alta",
                "signals": ["autocuidado", "saude e seguranca", "apoio profissional"],
                "contentTags": ["saude e seguranca", "saude mental", "autocuidado"],
                "contentIds": ["sinais-alerta-puerperio", "respiracao-para-ansiedade"],
            },
            high_intensity_count or 1,
        )

    for tag, count in tag_counter.items():
        if count > 1:
            context["signals"].add(tag)
            context["contentWeights"][tag] += count

    roles = set(user_roles(user))
    profile_code = normalize_pattern_text(user.get("profileCode"))

    if not check_ins and (roles.intersection({"DSM", "DS"}) or profile_code in {"dsm", "ds"}):
        add_recommendation_pattern(
            context,
            next(rule for rule in RECOMMENDATION_PATTERN_RULES if rule["id"] == "preparacao-jornada"),
            1,
        )

    if not context["signals"]:
        context["signals"].update({"autocuidado", "puerperio"})
        context["contentWeights"].update({"autocuidado": 2, "puerperio": 2})
        context["preferredContentIds"].update({"navegando-nas-emocoes": 3, "preparando-sua-jornada": 2})

    context["patterns"] = sorted(context["patterns"], key=lambda item: item["strength"], reverse=True)[:5]

    return context


def content_recommendation_score(content, context):
    content_id = content.get("id")
    tags = {
        normalize_pattern_text(tag)
        for tag in content.get("tags") or []
        if normalize_pattern_text(tag)
    }
    searchable = normalize_pattern_text(
        " ".join(
            str(value)
            for value in [
                content.get("title"),
                content.get("summary"),
                content.get("category"),
                content.get("body"),
            ]
            if value
        )
    )
    score = context["preferredContentIds"].get(content_id, 0)

    for signal, weight in context["contentWeights"].items():
        if signal in tags:
            score += weight * 3
        elif signal and signal in searchable:
            score += weight

    return score


class RecommendationsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_content_seeded()
        user = current_user(request)

        if not (user.get("privacy") or {}).get("allowPersonalizedRecommendations", True):
            contents = list_collection(CONTENT_COLLECTION, lambda item: item.get("status", "published") == "published")[:3]
            return success_response({"recommendations": contents, "signals": [], "patterns": []})

        check_ins = sort_by_created_at(
            list_collection(
                CHECK_IN_COLLECTION,
                lambda item: item.get("userId") == request.user.uid and item.get("status") != "deleted",
            )
        )[:10]
        recommendation_context = build_recommendation_context(check_ins, user)
        contents = list_collection(CONTENT_COLLECTION, lambda item: item.get("status", "published") == "published")
        ranked = []

        for content in contents:
            score = content_recommendation_score(content, recommendation_context)
            ranked.append((score, content))

        recommendations = [
            {
                **content,
                "recommendationScore": score,
                "matchedPatterns": [pattern["id"] for pattern in recommendation_context["patterns"]],
            }
            for score, content in sorted(ranked, key=lambda item: (item[0], item[1].get("title") or ""), reverse=True)
            if score > 0
        ][:4]

        if not recommendations:
            recommendations = contents[:4]

        return success_response(
            {
                "recommendations": recommendations,
                "signals": sorted(recommendation_context["signals"]),
                "patterns": recommendation_context["patterns"],
                "message": "Selecionamos conteudos a partir de padroes dos seus registros, sem fazer diagnosticos.",
            }
        )


class CommunityPostsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = list_collection(COMMUNITY_POST_COLLECTION, lambda item: item.get("status", "active") == "active")

        return success_response({"posts": sort_by_created_at(items)})

    def post(self, request):
        body = request.data.get("body") or request.data.get("message")
        title = request.data.get("title")

        if not title or not body:
            return error_response("Titulo e mensagem sao obrigatorios.")

        user = current_user(request)

        if is_pending_professional(user, request):
            return error_response(
                "Seu perfil profissional ainda esta em analise. Enquanto isso, voce pode ler a comunidade e enviar conteudos para revisao.",
                status.HTTP_403_FORBIDDEN,
            )

        anonymous = bool(request.data.get("anonymous"))
        ref = get_db().collection(COMMUNITY_POST_COLLECTION).document()
        payload = {
            "id": ref.id,
            "authorId": request.user.uid,
            "authorName": "Usuario com identidade protegida" if anonymous else user.get("fullName", "Maia"),
            "authorRole": user.get("profileCode", "PUE"),
            "anonymous": anonymous,
            "category": request.data.get("category") or "apoio",
            "title": title,
            "body": body,
            "tags": request.data.get("tags") if isinstance(request.data.get("tags"), list) else [],
            "supportCount": 0,
            "commentsCount": 0,
            "status": "active",
            "createdAt": server_timestamp(),
            "updatedAt": server_timestamp(),
        }
        ref.set(payload)

        return success_response({"post": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class CommunityPostDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_post(self, post_id):
        ref = get_db().collection(COMMUNITY_POST_COLLECTION).document(post_id)
        post = get_document_payload(ref.get())

        if not post or post.get("status") not in {"active", "hidden"}:
            return ref, None

        return ref, post

    def get(self, request, post_id):
        _, post = self.get_post(post_id)

        if not post or (post.get("status") == "hidden" and not user_is_admin(request.user)):
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        comments = list_collection(
            COMMUNITY_COMMENT_COLLECTION,
            lambda item: item.get("postId") == post_id and item.get("status", "active") == "active",
        )

        return success_response({"post": post, "comments": sort_by_created_at(comments, reverse=False)})

    def patch(self, request, post_id):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        ref, post = self.get_post(post_id)

        if not post:
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status")

        if status_value not in {"active", "hidden", "removed"}:
            return error_response("Status de publicacao invalido.")

        ref.update({"status": status_value, "moderatedBy": request.user.uid, "updatedAt": server_timestamp()})
        get_db().collection(ADMIN_ACTION_COLLECTION).document().set(
            {
                "type": "community-post-moderation",
                "targetId": post_id,
                "status": status_value,
                "adminId": request.user.uid,
                "createdAt": server_timestamp(),
            }
        )

        return success_response({"post": get_document_payload(ref.get())})

    def delete(self, request, post_id):
        ref, post = self.get_post(post_id)

        if not post:
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        if post.get("authorId") != request.user.uid and not user_is_admin(request.user):
            return error_response("Voce nao tem permissao para remover esta publicacao.", status.HTTP_403_FORBIDDEN)

        ref.update({"status": "removed", "updatedAt": server_timestamp()})

        return success_response({"mensagem": "Publicacao removida."})


class CommunityCommentCreateView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post_ref = get_db().collection(COMMUNITY_POST_COLLECTION).document(post_id)
        post = get_document_payload(post_ref.get())

        if not post or post.get("status") != "active":
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        body = request.data.get("body") or request.data.get("message")

        if not body:
            return error_response("Mensagem da resposta e obrigatoria.")

        user = current_user(request)

        if is_pending_professional(user, request):
            return error_response(
                "Seu perfil profissional ainda esta em analise. Aguarde a verificacao para responder na comunidade.",
                status.HTTP_403_FORBIDDEN,
            )

        ref = get_db().collection(COMMUNITY_COMMENT_COLLECTION).document()
        payload = {
            "id": ref.id,
            "postId": post_id,
            "authorId": request.user.uid,
            "authorName": user.get("fullName", "Maia"),
            "authorRole": user.get("profileCode", "PUE"),
            "body": body,
            "helpfulCount": 0,
            "status": "active",
            "createdAt": server_timestamp(),
            "updatedAt": server_timestamp(),
        }
        ref.set(payload)
        post_ref.update({"commentsCount": int(post.get("commentsCount") or 0) + 1, "updatedAt": server_timestamp()})

        return success_response({"comment": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class CommunitySupportView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        db = get_db()
        post_ref = db.collection(COMMUNITY_POST_COLLECTION).document(post_id)
        post = get_document_payload(post_ref.get())

        if not post or post.get("status") != "active":
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        support_id = f"{post_id}_{request.user.uid}"
        support_ref = db.collection(COMMUNITY_SUPPORT_COLLECTION).document(support_id)
        supported = support_ref.get().exists
        support_count = int(post.get("supportCount") or 0)

        if supported:
            support_ref.delete()
            support_count = max(support_count - 1, 0)
            next_supported = False
        else:
            support_ref.set(
                {
                    "id": support_id,
                    "postId": post_id,
                    "userId": request.user.uid,
                    "createdAt": server_timestamp(),
                }
            )
            support_count += 1
            next_supported = True

        post_ref.update({"supportCount": support_count, "updatedAt": server_timestamp()})

        return success_response({"supported": next_supported, "supportCount": support_count})


class CommentFeedbackView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        ref = get_db().collection(COMMUNITY_COMMENT_COLLECTION).document(comment_id)
        comment = get_document_payload(ref.get())

        if not comment:
            return error_response("Resposta nao encontrada.", status.HTTP_404_NOT_FOUND)

        delta = 1 if request.data.get("helpful", True) else -1
        ref.update(
            {
                "helpfulCount": int(comment.get("helpfulCount") or 0) + delta,
                "updatedAt": server_timestamp(),
            }
        )

        return success_response({"comment": get_document_payload(ref.get())})


class NotificationPreferencesView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        target_user_id = request.GET.get("userId") if user_is_admin(request.user) else None
        user = get_user(target_user_id) if target_user_id else current_user(request)

        return success_response({"preferences": user.get("notificationSummary") or {}})

    def put(self, request):
        allowed = {"dailyCheckInEnabled", "pushEnabled", "timezone", "dailyCheckInTime"}
        target_user_id = request.data.get("userId") if user_is_admin(request.user) else None
        current = get_user(target_user_id) if target_user_id else current_user(request)
        requested_timezone = request.data.get("timezone")
        requested_time = request.data.get("dailyCheckInTime")

        if requested_timezone:
            try:
                ZoneInfo(requested_timezone)
            except ZoneInfoNotFoundError:
                return error_response(
                    "Fuso horario invalido.",
                    code="invalid_notification_timezone",
                )

        if requested_time:
            try:
                datetime.strptime(requested_time, "%H:%M")
            except (TypeError, ValueError):
                return error_response(
                    "Horario de lembrete invalido. Use o formato HH:MM.",
                    code="invalid_notification_time",
                )

        preferences = {
            **(current.get("notificationSummary") or {}),
            **{key: value for key, value in request.data.items() if key in allowed},
        }
        preferences.setdefault("timezone", "America/Sao_Paulo")
        preferences.setdefault("dailyCheckInTime", "20:00")
        get_db().collection("users").document(target_user_id or request.user.uid).update(
            {"notificationSummary": preferences, "updatedAt": server_timestamp()}
        )

        return success_response({"preferences": preferences})


class NotificationSubscriptionView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        provider = str(request.data.get("provider") or WEB_NOTIFICATION_PROVIDER).strip().lower()
        platform = str(request.data.get("platform") or "").strip().lower()
        endpoint = request.data.get("endpoint")
        token = str(request.data.get("token") or "").strip()
        keys = request.data.get("keys") if isinstance(request.data.get("keys"), dict) else {}

        if provider in NATIVE_NOTIFICATION_PROVIDERS:
            if not token:
                return error_response(
                    "Token nativo da subscription e obrigatorio.",
                    code="notification_token_required",
                )

            subscription_id = uuid.uuid5(uuid.NAMESPACE_URL, f"{provider}:{token}").hex
            ref = get_db().collection(NOTIFICATION_SUBSCRIPTION_COLLECTION).document(subscription_id)
            existing = get_document_payload(ref.get())
            ref.set(
                {
                    "id": subscription_id,
                    "userId": request.user.uid,
                    "provider": provider,
                    "platform": platform or "native",
                    "token": token,
                    "status": "active",
                    "createdAt": existing.get("createdAt") if existing else server_timestamp(),
                    "updatedAt": server_timestamp(),
                },
                merge=True,
            )

            return success_response({"subscription": get_document_payload(ref.get())}, status.HTTP_201_CREATED)

        if not endpoint:
            return error_response(
                "Endpoint da subscription e obrigatorio.",
                code="notification_endpoint_required",
            )

        if not keys.get("auth") or not keys.get("p256dh"):
            return error_response(
                "Chaves da subscription sao obrigatorias.",
                code="notification_keys_required",
            )

        subscription_id = uuid.uuid5(uuid.NAMESPACE_URL, endpoint).hex
        ref = get_db().collection(NOTIFICATION_SUBSCRIPTION_COLLECTION).document(subscription_id)
        existing = get_document_payload(ref.get())
        ref.set(
            {
                "id": subscription_id,
                "userId": request.user.uid,
                "provider": WEB_NOTIFICATION_PROVIDER,
                "endpoint": endpoint,
                "keys": keys,
                "status": "active",
                "createdAt": existing.get("createdAt") if existing else server_timestamp(),
                "updatedAt": server_timestamp(),
            },
            merge=True,
        )

        return success_response({"subscription": get_document_payload(ref.get())}, status.HTTP_201_CREATED)

    def delete(self, request):
        deleted = 0

        for subscription in list_collection(
            NOTIFICATION_SUBSCRIPTION_COLLECTION,
            lambda item: item.get("userId") == request.user.uid,
        ):
            get_db().collection(NOTIFICATION_SUBSCRIPTION_COLLECTION).document(subscription["id"]).delete()
            deleted += 1

        return success_response({"deleted": deleted})


def get_user_local_now(user, utc_now=None):
    preferences = user.get("notificationSummary") or {}
    timezone_name = preferences.get("timezone") or "America/Sao_Paulo"

    try:
        user_timezone = ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError:
        user_timezone = ZoneInfo("America/Sao_Paulo")

    current_utc = utc_now or datetime.now(ZoneInfo("UTC"))

    if current_utc.tzinfo is None:
        current_utc = current_utc.replace(tzinfo=ZoneInfo("UTC"))

    return current_utc.astimezone(user_timezone)


def user_notification_is_due(user, local_now):
    preferences = user.get("notificationSummary") or {}
    configured_time = preferences.get("dailyCheckInTime") or "20:00"

    try:
        reminder_time = datetime.strptime(configured_time, "%H:%M").time()
    except (TypeError, ValueError):
        reminder_time = datetime.strptime("20:00", "%H:%M").time()

    local_date = local_now.date().isoformat()
    last_sent_date = preferences.get("lastDailyCheckInNotificationDate")

    return local_now.time() >= reminder_time and last_sent_date != local_date


def user_has_check_in_on_local_date(user_id, local_now, check_ins):
    for check_in in check_ins:
        if check_in.get("userId") != user_id or check_in.get("status") == "deleted":
            continue

        recorded_at = check_in.get("recordedAt") or check_in.get("createdAt")

        if not recorded_at:
            continue

        try:
            recorded_datetime = datetime.fromisoformat(str(recorded_at).replace("Z", "+00:00"))

            if recorded_datetime.tzinfo is None:
                recorded_datetime = recorded_datetime.replace(tzinfo=ZoneInfo("UTC"))

            if recorded_datetime.astimezone(local_now.tzinfo).date() == local_now.date():
                return True
        except (TypeError, ValueError):
            continue

    return False


def send_native_push_notification(subscription, payload):
    token = subscription.get("token")

    if not token:
        raise ValueError("Token FCM ausente.")

    message = messaging.Message(
        android=messaging.AndroidConfig(
            notification=messaging.AndroidNotification(
                tag=payload["tag"],
            ),
            ttl=timedelta(seconds=3600),
        ),
        data={
            "tag": payload["tag"],
            "type": payload["type"],
            "url": payload["url"],
        },
        notification=messaging.Notification(
            title=payload["title"],
            body=payload["body"],
        ),
        token=token,
    )
    return messaging.send(message)


def firebase_error_indicates_expired_token(exc):
    message = str(exc).lower()

    return (
        "registration-token-not-registered" in message
        or "requested entity was not found" in message
        or "invalid registration token" in message
    )


class NotificationDispatchView(APIView):
    def post(self, request):
        configured_secret = getattr(settings, "NOTIFICATION_DISPATCH_SECRET", "")
        request_secret = request.headers.get("X-Maia-Dispatch-Secret", "")

        if configured_secret and request_secret != configured_secret:
            return error_response("Chave de disparo invalida.", status.HTTP_403_FORBIDDEN)

        users = list_collection(
            "users",
            lambda user: (user.get("notificationSummary") or {}).get("dailyCheckInEnabled")
            and (user.get("notificationSummary") or {}).get("pushEnabled")
            and user.get("status", "active") == "active",
        )
        check_ins = list_collection(CHECK_IN_COLLECTION)
        due_users = []

        for user in users:
            user_id = user.get("id") or user.get("authUid")

            if not user_id:
                continue

            local_now = get_user_local_now(user)

            if not user_notification_is_due(user, local_now):
                continue

            if user_has_check_in_on_local_date(user_id, local_now, check_ins):
                continue

            due_users.append((user_id, user, local_now))

        enabled_user_ids = {user_id for user_id, _, _ in due_users}
        subscriptions = list_collection(
            NOTIFICATION_SUBSCRIPTION_COLLECTION,
            lambda item: item.get("userId") in enabled_user_ids and item.get("status", "active") == "active",
        )
        payload = json.dumps(
            {
                "title": "Maia",
                "body": "Um check-in gentil pode ajudar voce a perceber como esta hoje.",
                "url": "/check-in",
                "tag": "maia-daily-check-in",
                "type": "daily-check-in",
            }
        )
        payload_data = json.loads(payload)
        web_subscriptions = [
            subscription
            for subscription in subscriptions
            if subscription.get("provider", WEB_NOTIFICATION_PROVIDER) == WEB_NOTIFICATION_PROVIDER
        ]
        native_subscriptions = [
            subscription
            for subscription in subscriptions
            if subscription.get("provider") in NATIVE_NOTIFICATION_PROVIDERS
        ]
        webpush = None
        WebPushException = Exception
        skipped_web_push = False

        if web_subscriptions:
            if settings.VAPID_PRIVATE_KEY:
                try:
                    from pywebpush import WebPushException, webpush
                except ImportError:
                    return error_response(
                        "Dependencia pywebpush indisponivel.",
                        status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
            else:
                skipped_web_push = True

        sent = 0
        native_sent = 0
        web_sent = 0
        failed = 0
        expired = 0
        notified_user_ids = set()

        for subscription in subscriptions:
            try:
                if subscription.get("provider") in NATIVE_NOTIFICATION_PROVIDERS:
                    send_native_push_notification(subscription, payload_data)
                    native_sent += 1
                elif webpush:
                    webpush(
                        subscription_info={
                            "endpoint": subscription.get("endpoint"),
                            "keys": subscription.get("keys") or {},
                        },
                        data=payload,
                        vapid_private_key=settings.VAPID_PRIVATE_KEY,
                        vapid_claims={"sub": settings.VAPID_CLAIMS_EMAIL},
                        ttl=3600,
                    )
                    web_sent += 1
                else:
                    failed += 1
                    continue

                sent += 1
                notified_user_ids.add(subscription.get("userId"))
            except firebase_exceptions.FirebaseError as exc:
                failed += 1

                if firebase_error_indicates_expired_token(exc):
                    get_db().collection(NOTIFICATION_SUBSCRIPTION_COLLECTION).document(
                        subscription["id"]
                    ).delete()
                    expired += 1
            except ValueError:
                failed += 1
            except WebPushException as exc:
                failed += 1
                response_status = getattr(getattr(exc, "response", None), "status_code", None)

                if response_status in {404, 410}:
                    get_db().collection(NOTIFICATION_SUBSCRIPTION_COLLECTION).document(
                        subscription["id"]
                    ).delete()
                    expired += 1

        for user_id, user, local_now in due_users:
            if user_id not in notified_user_ids:
                continue

            preferences = {
                **(user.get("notificationSummary") or {}),
                "lastDailyCheckInNotificationDate": local_now.date().isoformat(),
                "lastDailyCheckInNotificationAt": now_iso(),
            }
            get_db().collection("users").document(user_id).update(
                {
                    "notificationSummary": preferences,
                    "updatedAt": server_timestamp(),
                }
            )

        return success_response(
            {
                "eligibleUsers": len(users),
                "dueUsers": len(due_users),
                "sent": sent,
                "nativeSent": native_sent,
                "webSent": web_sent,
                "failed": failed,
                "expiredSubscriptions": expired,
                "skippedWebPush": skipped_web_push,
                "subscriptions": len(subscriptions),
                "nativeSubscriptions": len(native_subscriptions),
                "webSubscriptions": len(web_subscriptions),
            }
        )


class AdminMetricsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        users = list_collection("users")
        posts = list_collection(COMMUNITY_POST_COLLECTION)
        check_ins = list_collection(CHECK_IN_COLLECTION)

        return success_response(
            {
                "metrics": {
                    "usersCount": len(users),
                    "pendingProfessionalsCount": len(
                        [user for user in users if user.get("professionalVerificationStatus") == "pending"]
                    ),
                    "communityPostsCount": len(posts),
                    "checkInsCount": len(check_ins),
                }
            }
        )


class AdminProfessionalVerificationsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        users = list_collection(
            "users",
            lambda user: user.get("profileCode") == "PRO"
            and user.get("professionalVerificationStatus") in {"pending", "verified", "rejected"},
        )

        return success_response({"professionalVerifications": sort_by_created_at(users)})


class AdminProfessionalVerificationDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, verification_id):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        next_status = request.data.get("status")
        reason = (request.data.get("reason") or "").strip()

        if next_status not in {"verified", "rejected", "pending"}:
            return error_response(
                "Status de validacao invalido.",
                code="invalid_professional_verification_status",
            )

        if next_status == "rejected" and len(reason) < 8:
            return error_response(
                "Informe uma justificativa com pelo menos 8 caracteres para rejeitar.",
                code="professional_rejection_reason_required",
            )

        user_ref = get_db().collection("users").document(verification_id)
        previous_user = get_document_payload(user_ref.get())

        if not previous_user:
            return error_response(
                "Profissional nao encontrado.",
                status.HTTP_404_NOT_FOUND,
                code="professional_not_found",
            )

        if previous_user.get("profileCode") != "PRO":
            return error_response(
                "Este usuario nao possui perfil profissional.",
                status.HTTP_409_CONFLICT,
                code="user_is_not_professional",
            )

        professional = previous_user.get("professional") or {}

        if next_status == "verified":
            required_fields = ("registrationNumber", "council", "state", "specialty")
            missing_fields = [field for field in required_fields if not professional.get(field)]

            if missing_fields:
                return error_response(
                    "Complete os dados profissionais antes da aprovacao.",
                    status.HTTP_409_CONFLICT,
                    code="professional_profile_incomplete",
                )

        user_ref.update(
            {
                "professionalVerificationStatus": next_status,
                "professional": {
                    **professional,
                    "verifiedAt": server_timestamp() if next_status == "verified" else None,
                    "verifiedBy": request.user.uid if next_status == "verified" else None,
                    "reviewedAt": server_timestamp(),
                    "reviewedBy": request.user.uid,
                    "rejectionReason": reason if next_status == "rejected" else "",
                },
                "updatedAt": server_timestamp(),
            }
        )
        get_db().collection(ADMIN_ACTION_COLLECTION).document().set(
            {
                "type": "professional-verification",
                "targetId": verification_id,
                "previousStatus": previous_user.get("professionalVerificationStatus", "pending"),
                "nextStatus": next_status,
                "reason": reason,
                "adminId": request.user.uid,
                "createdAt": server_timestamp(),
            }
        )

        return success_response({"message": "Validacao profissional atualizada.", "user": get_document_payload(user_ref.get())})


class AdminActionsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        return success_response({"actions": sort_by_created_at(list_collection(ADMIN_ACTION_COLLECTION))[:25]})


class AdminCommunityPostsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        return success_response({"posts": sort_by_created_at(list_collection(COMMUNITY_POST_COLLECTION))})


class AdminUsersView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        profile_code = request.GET.get("profileCode")
        status_value = request.GET.get("status")
        query = (request.GET.get("q") or "").strip().lower()

        users = list_collection(
            "users",
            lambda user: (
                (not profile_code or user.get("profileCode") == profile_code)
                and (not status_value or user.get("status") == status_value)
                and (
                    not query
                    or query in str(user.get("fullName") or "").lower()
                    or query in str(user.get("email") or "").lower()
                )
            ),
        )

        return success_response({"users": sort_by_created_at(users)})


class AdminUserDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        user = get_user(user_id)

        if not user:
            return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

        return success_response({"user": user})

    def patch(self, request, user_id):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        next_status = request.data.get("status")

        if next_status not in {"active", "blocked", "pending-deletion"}:
            return error_response("Status de usuario invalido.")

        user_ref = get_db().collection("users").document(user_id)
        previous_user = get_document_payload(user_ref.get())

        if not previous_user:
            return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

        if user_id == request.user.uid and next_status != "active":
            return error_response("Voce nao pode bloquear sua propria conta administrativa.")

        user_ref.update({"status": next_status, "updatedAt": server_timestamp()})

        try:
            get_firebase_auth().update_user(user_id, disabled=next_status != "active")
        except Exception:
            pass

        get_db().collection(ADMIN_ACTION_COLLECTION).document().set(
            {
                "type": "user-status",
                "targetId": user_id,
                "previousStatus": previous_user.get("status"),
                "nextStatus": next_status,
                "reason": request.data.get("reason") or "",
                "adminId": request.user.uid,
                "createdAt": server_timestamp(),
            }
        )

        return success_response({"user": get_document_payload(user_ref.get())})


class AdminCommunityCommentsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        post_id = request.GET.get("postId")
        comments = list_collection(
            COMMUNITY_COMMENT_COLLECTION,
            lambda item: not post_id or item.get("postId") == post_id,
        )

        return success_response({"comments": sort_by_created_at(comments, reverse=False)})


class AdminCommunityCommentDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, comment_id):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        status_value = request.data.get("status")

        if status_value not in {"active", "hidden", "removed"}:
            return error_response("Status de comentario invalido.")

        ref = get_db().collection(COMMUNITY_COMMENT_COLLECTION).document(comment_id)
        comment = get_document_payload(ref.get())

        if not comment:
            return error_response("Comentario nao encontrado.", status.HTTP_404_NOT_FOUND)

        ref.update({"status": status_value, "moderatedBy": request.user.uid, "updatedAt": server_timestamp()})
        get_db().collection(ADMIN_ACTION_COLLECTION).document().set(
            {
                "type": "community-comment-moderation",
                "targetId": comment_id,
                "postId": comment.get("postId"),
                "status": status_value,
                "adminId": request.user.uid,
                "createdAt": server_timestamp(),
            }
        )

        return success_response({"comment": get_document_payload(ref.get())})


class PrivacyExportView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.GET.get("userId") if user_is_admin(request.user) else request.user.uid

        export_payload = {
            "user": get_user(user_id),
            "checkIns": list_collection(CHECK_IN_COLLECTION, lambda item: item.get("userId") == user_id),
            "communityPosts": list_collection(COMMUNITY_POST_COLLECTION, lambda item: item.get("authorId") == user_id),
            "communityComments": list_collection(COMMUNITY_COMMENT_COLLECTION, lambda item: item.get("authorId") == user_id),
            "notificationSubscriptions": list_collection(
                NOTIFICATION_SUBSCRIPTION_COLLECTION,
                lambda item: item.get("userId") == user_id,
            ),
            "exportedAt": now_iso(),
        }

        return success_response({"export": export_payload})


class PrivacyDeleteRequestView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_ref = get_db().collection("users").document(request.user.uid)

        if not user_ref.get().exists:
            return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

        requested_at = now_iso()
        user_ref.update(
            {
                "status": "pending-deletion",
                "deleteRequestedAt": server_timestamp(),
                "updatedAt": server_timestamp(),
            }
        )

        return success_response(
            {
                "mensagem": "Solicitacao de exclusao registrada.",
                "deleteRequest": {
                    "status": "pending-deletion",
                    "requestedAt": requested_at,
                },
            }
        )


class UserAvatarUploadView(APIView):
    authentication_classes = [FirebaseAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, uid):
        if request.user.uid != uid and not user_is_admin(request.user):
            return error_response("Voce nao tem permissao para alterar esta foto.", status.HTTP_403_FORBIDDEN)

        image = request.FILES.get("image") or request.FILES.get("file") or request.FILES.get("avatar")

        if not image:
            return error_response("Envie uma foto de perfil.")

        content_type = image.content_type or mimetypes.guess_type(image.name)[0] or ""

        if content_type not in ALLOWED_IMAGE_TYPES:
            return error_response("Envie apenas fotos em JPG, PNG ou WebP.", status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        if image.size > MAX_AVATAR_SIZE_BYTES:
            return error_response("A foto deve ter no maximo 5 MB.", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

        try:
            bucket = get_storage_bucket()
            token = str(uuid.uuid4())
            extension = ALLOWED_IMAGE_TYPES[content_type]
            storage_path = f"profile-avatars/{uid}/{uuid.uuid4().hex}{extension}"
            blob = bucket.blob(storage_path)
            blob.metadata = {"firebaseStorageDownloadTokens": token}
            blob.upload_from_file(image, content_type=content_type)

            avatar_url = (
                f"https://firebasestorage.googleapis.com/v0/b/{settings.FIREBASE_STORAGE_BUCKET}/o/"
                f"{quote(storage_path, safe='')}?alt=media&token={token}"
            )
            user_ref = get_db().collection("users").document(uid)
            user_ref.update(
                {
                    "avatarUrl": avatar_url,
                    "avatarStoragePath": storage_path,
                    "updatedAt": server_timestamp(),
                }
            )

            return success_response({"avatarUrl": avatar_url, "user": get_document_payload(user_ref.get())})
        except FirebaseNotConfiguredError as exc:
            return error_response(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            return error_response("Nao foi possivel salvar a foto de perfil.", status.HTTP_500_INTERNAL_SERVER_ERROR)
