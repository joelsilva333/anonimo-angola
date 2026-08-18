# Novas funcionalidades — Apoio Emocional (IA) e Publicidade

## 1. Chat de Apoio Emocional (OpenAI)

**Ficheiros adicionados:**
- `src/app/api/ai/chat/route.ts` — rota de servidor que fala com a OpenAI. A chave da API nunca é exposta ao browser.
- `src/app/hooks/use-support-chat.ts` — hook que trata do streaming da resposta.
- `src/app/home/support/page.tsx` — página do chat (rota `/home/support`, já protegida pelo teu `middleware.ts` porque começa por `/home`).
- `src/app/interfaces/chat.ts`
- Item novo no menu (`src/app/ui/Menu.tsx`) a apontar para `/home/support`.

**O que precisas de fazer:**
1. Corre `npm install` (ou `yarn install`) para instalar o pacote `openai` que adicionei ao `package.json`.
2. Cria uma conta/API key na OpenAI (platform.openai.com) e define a variável de ambiente:
   ```
   OPENAI_API_KEY="sk-..."
   ```
   no teu `.env` local e nas variáveis de ambiente da Vercel (ou onde fizeres deploy). **Nunca** uses o prefixo `NEXT_PUBLIC_` nesta variável — se o fizeres, a chave fica visível no browser.
3. Por defeito uso o modelo `gpt-4o-mini` (mais barato, boa qualidade para conversação). Podes trocar no `route.ts` se preferires outro modelo.

**Sobre a segurança emocional (importante, não é opcional):**
- A rota intercepta mensagens com sinais de risco (ideação suicida, autoagressão) **antes** de irem para a OpenAI, e responde sempre com uma mensagem fixa que indica o INEMA (111) e incentiva a procurar alguém de confiança ou um profissional. Isto evita depender só do comportamento do modelo em momentos críticos.
- A lista de padrões de deteção está em `CRISIS_PATTERNS` no `route.ts`. Vale a pena reveres e ampliares com termos/gírias usadas em Angola, e testares com casos reais antes de lançar.
- Recomendo genuinamente falar com alguém com formação em saúde mental (mesmo que seja só uma consulta) para rever o tom das respostas antes de lançares isto para utilizadores reais — é um espaço sensível.
- O custo da API da OpenAI escala com o uso. Como a rota já exige o cookie `aa_token` (ou seja, só utilizadores autenticados), tens alguma proteção contra abuso, mas vale a pena adicionar um limite diário por utilizador se o volume crescer.

## 2. Publicidade / Patrocínios (geridos por ti)

Optei por guardar os patrocinadores no **Firestore** (já tens o Firebase configurado no projecto, só estava a ser usado para autenticação). Isto permite-te adicionar/remover/pausar anúncios directamente na consola do Firebase, sem precisar de fazer deploy nem mexer no backend externo.

**Ficheiros adicionados:**
- `src/app/interfaces/sponsor.ts`
- `src/app/hooks/get-sponsors.ts`
- `src/app/ui/SponsorBanner.tsx`
- `src/app/lib/firebase.ts` — adicionei `export const db = getFirestore(app)`
- `src/app/home/page.tsx` — insere um banner a cada 4 posts do feed (ajustável via `POSTS_BETWEEN_SPONSORS`)

**O que precisas de fazer:**
1. Na consola do Firebase, ativa o **Firestore Database** (se ainda não estiver activo).
2. Cria a colecção `sponsors`. Cada documento deve ter os campos:
   | Campo | Tipo | Obrigatório | Exemplo |
   |---|---|---|---|
   | `name` | string | sim | `"Loja XPTO"` |
   | `imageUrl` | string | sim | `"https://.../logo.png"` |
   | `link` | string | sim | `"https://loja-xpto.co.ao"` |
   | `ctaLabel` | string | não | `"Ver ofertas"` |
   | `active` | boolean | sim | `true` |
   | `startDate` | string (ISO) | não | `"2026-08-01"` |
   | `endDate` | string (ISO) | não | `"2026-09-01"` |

   Para desativar um anúncio, basta mudar `active` para `false` — não precisas de apagar o documento.

3. Define regras de segurança no Firestore para que **qualquer pessoa possa ler**, mas **ninguém possa escrever** a partir do cliente (só tu, pela consola):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /sponsors/{sponsorId} {
         allow read: if true;
         allow write: if false;
       }
     }
   }
   ```
4. Como uso `unoptimized` no `next/image` (consistente com o resto do teu projecto), não precisas de adicionar o domínio das imagens dos patrocinadores ao `next.config.ts`.

**Transparência:** o banner mostra sempre a etiqueta "Publicidade" no topo — é importante manter isso visível para a confiança dos utilizadores e para cumprires boas práticas de publicidade nativa.

## Próximos passos sugeridos (não implementados ainda)
- Página simples de administração para geres os patrocinadores sem abrir a consola do Firebase.
- Limite de mensagens diárias por utilizador no chat de apoio emocional.
- Registo (mesmo que anónimo) de quantas vezes o aviso de crise é acionado, para perceberes o impacto real — isto é sensível, por isso pensa bem em como (ou se) guardas esse dado.
