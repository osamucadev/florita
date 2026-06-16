# 🧠 Florita: Decisões de Engenharia, Arquitetura e Produto

Como este projeto representa a construção de um ecossistema completo de produto (Front-end + Back-end), eu tomei decisões estratégicas para balancear a confiabilidade dos dados, a viabilidade técnica dentro do prazo de 72 horas e, acima de tudo, a melhor experiência possível para o usuário final.

Abaixo, detalho as escolhas de arquitetura e produto que guiaram a minha engenharia antes de iniciar a codificação.

---

### 📝 Nota de Transparência (Adendo Especial)

**Por que a arquitetura foi pivotada para NoSQL:**
O rascunho inicial do meu planejamento mental considerava o uso do PostgreSQL, que é o banco relacional sugerido como padrão no escopo geral do desafio. No entanto, ao revisar minuciosamente os critérios específicos e a essência técnica da oportunidade (**Desenvolvedor Full-stack com foco em NoSQL**), eu mudei a estratégia de dados imediatamente para o **MongoDB**. 

Eu fiz questão de registrar este adendo de forma transparente porque a adaptabilidade rápida a novos requisitos é a realidade do dia a dia na engenharia de software. Essa mudança acabou se provando a melhor decisão técnica possível, dado que a flexibilidade de documentos do MongoDB resolve de forma muito mais elegante e performática o armazenamento de cargas complexas e aninhadas de uma API de dicionário do que um banco relacional convencional.

---

### 1. Desapegando do Firebase: Por que decidi ir de Node.js + Redis + Docker + MongoDB?
No meu primeiro momento de concepção do produto, considerei utilizar o **Firebase (Firestore + Cloud Functions + Hosting)**. Afinal, a plataforma do Google oferece infraestrutura pronta com CDN, cache automatizado e deploys em segundos. 

No entanto, eu percebi que uma arquitetura *Serverless/BaaS* (Backend as a Service) mascararia o meu domínio sobre conceitos fundamentais de infraestrutura e banco de dados exigidos pelo desafio e pelo mercado. Optei por seguir a stack sugerida e focar no ecossistema NoSQL por três argumentos:

* **Controle Granular e Performance:** A manipulação nativa de Headers HTTP (`x-cache` e `x-response-time`) exigida no edital se torna muito mais limpa e transparente utilizando uma API própria[cite: 1]. Eu escolhi o **Express** ao invés do NestJS por ser uma tecnologia de altíssima performance que eu domino a fundo, permitindo-me demonstrar boas práticas de arquitetura limpa (SOLID) sem me prender a padrões rígidos de um framework que eu não utilizo no dia a dia.
* **Persistência de Dados Orientada a Documentos (NoSQL):** Em total alinhamento com os requisitos arquiteturais de bancos de dados NoSQL, optei por utilizar o **MongoDB** via Mongoose. Como os retornos da API do dicionário possuem estruturas aninhadas complexas (como múltiplos arrays de fonéticas, sinônimos e definições), o modelo NoSQL evita a complexidade e a perda de performance de junções relacionais (JOINs) desnecessárias, permitindo consultas ultra velozes, indexação eficiente para paginação por cursor e um mapeamento totalmente natural de documentos JSON.
* **Performance Real com Redis:** A implementação manual e em camadas do **Redis** para cache de dados garante que a latência caie para níveis próximos a zero (HIT)[cite: 1]. Isso blinda a aplicação contra limites de taxa (*rate limiting*) da API pública externa.
* **Portabilidade Absoluta com Docker:** Eu orquestrei toda a infraestrutura (MongoDB, Redis, API Express e Web Next.js) em um ambiente `docker-compose`[cite: 1]. Dessa forma, o avaliador consegue rodar o ecossistema inteiro localmente com apenas um comando, sem depender de chaves de provedores de nuvem ou configurações complexas na máquina[cite: 1].

### 2. Fonte de Dados Inteligente: Garantindo 100% de Confiabilidade
As instruções originais sugeriam o uso de uma lista genérica do repositório `dwyl/english-words`. Em uma análise técnica minuciosa, eu decidi mudar a estratégia e extrair o arquivo `english.txt` diretamente do repositório oficial da **Free Dictionary API**.

* **Por que fiz essa troca?** Utilizar a lista oficial garante que 100% das palavras cadastradas localmente no meu banco de dados NoSQL de busca (`GET /entries/en`) possuam definições válidas na API externa[cite: 1]. Isso elimina falsos positivos na busca interna e melhora drasticamente a experiência do usuário (UX), evitando cenários frustrantes de "No Definitions Found".

### 3. Regra de Negócio Precisa para o Histórico (UX)
Eu defini uma regra estrita para a alimentação do histórico do usuário: o termo consultado **só será registrado no histórico quando o usuário efetivamente clicar na palavra** (seja nas sugestões da busca ou na listagem geral) para abrir o modal de definição. 
* Se o usuário apenas visualizar a palavra em uma lista de sugestões na tela, ela não será salva. O histórico do *Florita* foi desenhado para refletir o que o usuário realmente estudou ou consultou, mantendo seus dados limpos e relevantes.

### 4. Inteligência na Busca: Debounce e Roadmaps de Engenharia
Para evitar o desperdício de processamento no backend e requisições desnecessárias a cada tecla digitada, eu estruturei o campo de pesquisa utilizando **Debounce**. O sistema aguarda o usuário pausar a digitação por alguns milissegundos para disparar as sugestões automaticamente.
* **Busca Tolerante a Falhas (Visão de Futuro):** Eu planejei a documentação prevendo a implementação de algoritmos de busca difusa (*Fuzzy Search*, como *Levenshtein Distance*) no banco local. Isso foi pensado para que, mesmo que o usuário cometa um erro de digitação (typos ou acentos acidentais), o sistema ainda seja capaz de sugerir o termo correto de forma resiliente.

### 5. Imersão de Marca: A Identidade Visual da Flora Energia
Eu fiz questão de estudar o produto de energia renovável e a identidade visual da **Flora** para aplicá-los diretamente no ecossistema do *Florita*. 
* **Paleta de Cores Oficial:** Utilizei os hexadecimais exatos da marca para compor a interface no Tailwind: o Roxo Elétrico (`#5E00FA`), o Verde Geração (`#56FF65`), o fundo Off-White (`#F6F4FC`) e variações escuras para contraste de texto.
* **Micro-interações e Fluidez:** Adicionei transições e animações com *Framer Motion* (como o botão de favoritar pulsando em escala ao ser clicado e mudando de cor), atendendo ao requisito de enriquecer a experiência visual.

### 6. O "Apagão na Rede Elétrica": Transformando Erros em Experiência
Em vez de exibir um erro genérico na tela caso o servidor backend sofra alguma instabilidade (estado de erro obrigatório no edital), eu desenhei uma tela de tratamento bem-humorada conectada ao modelo de negócios da Flora (geração distribuída de créditos de energia):

> 🌑 **Opa! Tivemos uma queda de tensão na rede...**
> 
> *Parece que nossos painéis solares pegaram uma nuvem passageira ou alguém puxou o cabo da tomada do servidor Florita. Nossa equipe de engenheiros de geração já foi acionada para restabelecer os créditos de energia!*
> 
> *Código do incidente: [HASH_DO_ERRO]*

### 7. Segurança Visível no Teste: Sessão Expirada Express
Para fins de validação e auditoria do teste prático, eu configurei o tempo de expiração do token JWT para **5 minutos** via variável de ambiente (`.env`). Dessa forma, os avaliadores conseguirão ver em tempo real o mecanismo de segurança funcionando e o sistema redirecionando automaticamente para a tela de login após a expiração, sem que precisem esperar 24 horas para testar a robustez da validação.

### 8. Transparência sobre o Processo de Desenvolvimento
Eu prezo pela total honestidade no meu fluxo de trabalho: **eu utilizei Inteligência Artificial generativa neste projeto**. No entanto, a divisão de papéis ficou muito clara: **eu atuei como o cérebro e a IA atuou como os músculos**. Toda a parte de engenharia de requisitos, design de produto, regras de negócio, modelagem do banco e tomadas de decisão arquiteturais listadas aqui foram concebidas exclusivamente por mim. A IA foi utilizada estritamente como um acelerador de produtividade para digitação de código, ajudando-me a entregar um software de altíssimo nível dentro do prazo desafiador de 72 horas.