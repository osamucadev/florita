# 🧠 Florita: Decisões de Engenharia, Arquitetura e Produto

Como este projeto representa a construção de um ecossistema completo de produto (Front-end + Back-end), tomei decisões estratégicas para balancear a confiabilidade dos dados, a viabilidade técnica dentro do prazo e, acima de tudo, a melhor experiência possível para o usuário final.

Abaixo detalho as escolhas de arquitetura e produto que guiaram a engenharia do projeto.

### 📝 Nota de Transparência

**Por que a arquitetura foi pivotada para NoSQL:** o rascunho inicial considerava o uso do PostgreSQL. No entanto, ao revisar os critérios específicos da vaga (Desenvolvedor Full-stack com foco em NoSQL), mudei a estratégia imediatamente para o **MongoDB**. Essa mudança se provou a melhor decisão técnica possível: a flexibilidade de documentos do MongoDB resolve de forma mais elegante e performática o armazenamento de cargas aninhadas de uma API de dicionário do que um banco relacional convencional.

### 1. Por que Node.js + Express + Redis + MongoDB + Docker?

No primeiro momento de concepção, considerei o **Firebase (Firestore + Cloud Functions + Hosting)**. A plataforma oferece infraestrutura pronta com CDN e deploys em segundos. No entanto, uma arquitetura Serverless/BaaS mascararia o domínio sobre conceitos fundamentais de infraestrutura exigidos pelo desafio. Optei pela stack sugerida por quatro razões:

- **Controle granular de performance:** a manipulação nativa dos headers HTTP (`x-cache` e `x-response-time`) exigida no edital fica muito mais limpa com uma API própria. Escolhi o Express ao invés do NestJS por ser uma tecnologia que domino a fundo, permitindo demonstrar boas práticas de arquitetura (SOLID) sem me prender a padrões rígidos de um framework que não utilizo no dia a dia.
- **Persistência orientada a documentos:** os retornos da Free Dictionary API possuem estruturas aninhadas complexas (múltiplos arrays de fonéticas, sinônimos e definições). O MongoDB via Mongoose evita JOINs desnecessários, permite indexação eficiente para paginação por cursor e mapeia naturalmente o JSON da API externa.
- **Cache em camadas com Redis:** a implementação manual do Redis garante latência próxima a zero nos HITs e blinda a aplicação contra rate limiting da API pública externa.
- **Portabilidade absoluta com Docker:** todo o ecossistema (MongoDB, Redis, API e Web) foi orquestrado em `docker-compose`. O avaliador sobe tudo com um único comando, sem dependência de chaves de provedores de nuvem.

### 2. Fonte de Dados: Por que Substituí a Lista do `dwyl/english-words`?

As instruções originais sugeriam a lista genérica do repositório `dwyl/english-words`. Decidi usar o arquivo `english.txt` diretamente do repositório oficial da **Free Dictionary API** por uma razão técnica objetiva: garantir que 100% das palavras cadastradas localmente possuam definições válidas na API externa, eliminando falsos positivos e evitando o cenário frustrante de "No Definitions Found" para o usuário.

Além disso, implementei um filtro no seed que rejeita entradas inválidas presentes na própria lista oficial: palavras que começam com hífen, contêm espaços, `&` ou pontuação. Essas entradas existem na fonte mas não retornam definições na API, então poluiriam a experiência sem agregar valor.

### 3. Regra de Negócio do Histórico

O termo consultado só é registrado no histórico quando o usuário efetivamente clica na palavra para abrir o modal ou a página de detalhes. Visualizar a palavra em uma lista de sugestões não gera registro.

Adicionalmente, o histórico registra cada palavra apenas uma vez por usuário via `updateOne` com `upsert: true` e `$setOnInsert`. Isso evita entradas duplicadas mesmo que o usuário consulte a mesma palavra múltiplas vezes. Usuários diferentes podem ter a mesma palavra em seus respectivos históricos: a chave composta `{ userId, word }` garante o isolamento correto.

### 4. Debounce no Campo de Busca

Para evitar requisições desnecessárias a cada tecla digitada, o campo de pesquisa usa debounce de 350ms implementado via `useRef` no React, sem dependências externas. O padrão escolhido foi `useRef` + `useEffect` em vez de `useCallback` + função utilitária, porque o React 18+ não consegue analisar as dependências de funções externas passadas ao `useCallback`, gerando warnings de lint.

**Visão de futuro documentada:** implementação de Fuzzy Search (distância de Levenshtein) no banco local para tolerar erros de digitação e acentos acidentais.

### 5. Identidade Visual da Flora Energia

Estudei o produto de energia renovável e a identidade visual da Flora para aplicá-los diretamente no Florita:

- **Paleta oficial:** Roxo Elétrico (`#5E00FA`), Verde Geração (`#56FF65`), Fundo Off-White (`#F6F4FC`) e Texto Escuro (`#1F0A3D`).
- **Tipografia editorial:** Playfair Display para títulos (serif com estilo italic), Geist Sans para interface. A combinação cria um tom de publicação técnica de luxo em vez de um app comum.
- **Linguagem temática:** toda a UI usa metáforas do setor elétrico: "painel de geração", "créditos de conhecimento", "queda de tensão na rede", "bateria descarregada". A identidade aparece na linguagem, não só na paleta.
- **Micro-interações:** Framer Motion no botão de favoritar (pulso em escala + transição de cor), no dropdown de sugestões (fade + slide), nas transições de página e no accordion de entradas adicionais.

### 6. O "Apagão na Rede Elétrica": Erros como Experiência

Em vez de erros genéricos, todos os estados de erro da interface usam a metáfora do setor elétrico:

> 🌑 Queda de tensão na rede. Parece que nossos painéis solares pegaram uma nuvem passageira. Nossa equipe de engenheiros já foi acionada para restabelecer os créditos de energia.

### 7. Segurança de Sessão em Duas Camadas

O token JWT foi configurado para expirar em **5 minutos** via variável de ambiente, permitindo que os avaliadores testem o mecanismo de segurança em tempo real. A gestão de sessão opera em duas camadas independentes:

- **Inatividade real:** um listener global monitora `mousemove`, `mousedown`, `keydown`, `touchstart` e `scroll`. O timer de 5 minutos é resetado a cada interação. Se o usuário ficar inativo, é deslogado automaticamente com mensagem explicativa na tela de login. O token permanece ativo enquanto o usuário navegar pela interface, mesmo sem fazer buscas.
- **Token expirado em chamada de API:** qualquer resposta 401 do backend limpa o localStorage e redireciona para `/?reason=expired`, com mensagem específica informando o motivo do encerramento da sessão.

### 8. Transparência sobre o Processo de Desenvolvimento

Utilizei Inteligência Artificial generativa neste projeto. A divisão de papéis foi clara: **eu atuei como o arquiteto e a IA como o executor**. Todas as decisões de engenharia, regras de negócio, modelagem do banco, escolhas arquiteturais e direção de produto documentadas aqui foram concebidas por mim. A IA foi utilizada como acelerador de produtividade para escrita de código, viabilizando a entrega de um produto de alto nível dentro do prazo de 72 horas.