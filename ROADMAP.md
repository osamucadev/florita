# 🗺️ Florita: Roadmap Granular de Desenvolvimento

Este documento apresenta o mapeamento completo e o checklist de engenharia para o ecossistema **Florita** (Front-end + Back-end). O planejamento foi estruturado de forma granular para garantir a cobertura de todos os requisitos de negócio, critérios de qualidade, segurança e tratamento de estados exigidos no edital.

---

## 🏗️ 1. Infraestrutura & Banco de Dados (Back-End)

- [ ] **Configuração do Ambiente Docker**
  - [x] Criar `Dockerfile` otimizado para o Back-end (Node.js/Express).
  - [x] Criar `Dockerfile` otimizado para o Front-end (Next.js 15).
  - [x] Estruturar o `docker-compose.yml` integrando: API, Web, PostgreSQL e Redis.
- [ ] **Modelagem do Banco de Dados (PostgreSQL)**
  - [ ] Tabela `users`: ID, nome, e-mail (chave primária/única), senha criptografada, timestamps.
  - [ ] Tabela `history`: ID, user_id (FK), palavra, adicionado_em (timestamp).
  - [ ] Tabela `favorites`: ID, user_id (FK), palavra, adicionado_em (timestamp).
  - [ ] Tabela `dictionary_words`: ID, palavra (com índice para busca rápida).
- [ ] **Script de Carga Automatizada (Seed - Obrigatório 3)**
  - [ ] Implementar script Node.js usando *Streams* para ler o arquivo `english.txt` oficial da Free Dictionary API sem estourar a memória RAM.
  - [ ] Implementar inserção em lote (*Bulk Insert*) para popular a tabela `dictionary_words` de forma performática.

---

## 🔐 2. Autenticação & Segurança (Back & Front)

### Fluxo de Cadastro (Signup)
- [ ] **Back-End (`POST /auth/signup`)**:
  - [ ] Validar se o e-mail já existe (retornar ` status 400` amigável caso exista).
  - [ ] Criptografar a senha com `bcrypt` antes de salvar.
  - [ ] Gerar token JWT contendo ID e nome, configurando expiração para 5 minutos (via `.env`).
  - [ ] Retornar o ID do usuário, nome e o token imediatamente para logar o usuário após o cadastro.
- [ ] **Front-End (Tela de Cadastro)**:
  - [ ] Criar formulário completo com TypeScript consistente (sem uso de `any`).
  - [ ] Implementar validação em tempo real (*Client-Side*) com feedback visual ao desfocar do campo (*On Blur*).
  - [ ] **Regra de Nome:** Mínimo de 2 caracteres (evitar iniciais avulsas).
  - [ ] **Regra de E-mail:** Validação por expressão regular (`texto@texto.tld`).
  - [ ] **Regra de Senha (Checklist Dinâmico):** Exigir em tela: mínimo de 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial (restringindo caracteres de controle inválidos).
  - [ ] Bloquear o botão de envio até que todo o formulário esteja 100% válido.

### Fluxo de Login (Signin)
- [ ] **Back-End (`POST /auth/signin`)**:
  - [ ] Validar credenciais e retornar `status 400` com mensagem humanizada caso falhe.
  - [ ] Retornar o token JWT e dados do usuário.
- [ ] **Front-End (Tela de Login)**:
  - [ ] Formulário com validações de e-mail e senha antes do envio.
  - [ ] Armazenar o token JWT de forma segura e gerenciar o estado global de autenticação (Zustand).

### Mecanismos de Logout (Saída do Sistema)
- [ ] **Logout Manual (Nocaute Ativo)**:
  - [ ] Botão "Sair" na interface.
  - [ ] **UX de Confirmação:** Interromper a ação e exibir um modal/alerta perguntando se o usuário realmente deseja encerrar a sessão, evitando cliques acidentais.
  - [ ] Limpar tokens, estados locais e redirecionar para `/login`.
- [ ] **Logout por Inatividade Real (Segurança Automatizada)**:
  - [ ] Criar um *listener* global no Next.js monitorando eventos de interação real (movimento do mouse, cliques e digitação).
  - [ ] **Regra dos 5 minutos:** Caso o usuário fique completamente inativo por 5 minutos (tempo sincronizado com a expiração do JWT), o sistema limpa o token local automaticamente.
  - [ ] Redirecionar para a tela de login exibindo a mensagem: *"Sua sessão expirou por inatividade para a sua segurança"*.

---

## ⚡ 3. Motor de Busca & Paginação por Cursor

- [ ] **Back-End (`GET /entries/en`)**:
  - [ ] Implementar busca na tabela local usando filtros textuais baseados no parâmetro `?search=`.
  - [ ] **Paginação por Cursor (Diferencial):** Abandonar o `offset` tradicional. Codificar o ponteiro de paginação (última palavra do bloco) em uma string **Base64** enviada nos campos `next` e `previous`.
  - [ ] Retornar a estrutura exata exigida pelo edital: `results`, `totalDocs`, `previous`, `next`, `hasNext`, `hasPrev`.
- [ ] **Front-End (Campo de Busca Inteligente)**:
  - [ ] Desenvolver campo de busca responsivo (Mobile/Desktop).
  - [ ] Implementar **Debounce**: Aguardar o usuário pausar a digitação por alguns milissegundos para disparar automaticamente a listagem de sugestões.
  - [ ] Tratar o evento do clique no botão "Pesquisar" ou o clique no `Enter` para disparar a busca imediatamente.
  - [ ] *Roadmap de Futuro (Documentado):* Previsão de uso de algoritmo Fuzzy Search (distância de Levenshtein) no banco para tolerar erros de digitação e acentos acidentais.

---

## 📖 4. Detalhes da Palavra & Regra de Histórico

- [ ] **Back-End (`GET /entries/en/:word`)**:
  - [ ] **Camada de Cache (Redis):** Checar se a palavra existe no cache.
    - [ ] **Se HIT:** Retornar o JSON do cache e injetar o header `x-cache: HIT`.
    - [ ] **Se MISS:** Fazer a requisição HTTP (Proxy) para a Free Dictionary API, salvar o JSON inteiro no Redis com TTL adequado e injetar o header `x-cache: MISS`.
  - [ ] **Mapeamento de Performance:** Calcular a duração exata da requisição e injetar o header `x-response-time` com o valor em milissegundos.
  - [ ] **Regra Estrita do Histórico:** Gravar o acesso na tabela `history` atrelando o `user_id` e a palavra consultada com o timestamp atual.
- [ ] **Front-End (Modal de Detalhes - UX Premium)**:
  - [ ] Isolar o Modal como *Client Component* (`'use client'`) mantendo a listagem principal como *Server Component*.
  - [ ] Renderizar de forma organizada os dados obrigatórios: Fonética, Definições, Exemplos de uso e Sinônimos.
  - [ ] Adicionar botão de reprodução de áudio caso a URL do `.mp3` fonético esteja disponível; tratar o estado caso o array de fonética venha vazio (ex: palavras compostas).

---

## ⭐️ 5. Gerenciamento de Palavras Favoritas

- [ ] **Back-End (`POST` e `DELETE /entries/en/:word/favorite`)**:
  - [ ] Criar endpoints para salvar e remover palavras da tabela `favorites`.
- [ ] **Front-End (Lista e Ações de Favoritos)**:
  - [ ] Exibir botão dinâmico de favoritar/desfavoritar dentro do modal de detalhes.
  - [ ] **Animação de Micro-interação:** Utilizar *Framer Motion* para fazer o ícone de coração/estrela pulsar em escala (efeito de expansão suave de `1.0` para `1.1`) e transicionar as cores da marca (Roxo para Verde Elétrico) de forma fluida.
  - [ ] **UX de Dupla Confirmação:** Ao clicar para remover uma palavra da lista de favoritas (ação destrutiva), interceptar o clique e exibir um modal de confirmação: *"Deseja realmente remover esta palavra dos seus favoritos?"*. Só proceder com a requisição se o usuário confirmar.

---

## 🎨 6. Qualidade de UI/UX, Estados e Imersão de Marca

- [ ] **Identidade Visual Flora Energia**
  - [ ] Configurar no Tailwind CSS a paleta extraída da marca: Roxo Elétrico (`#5E00FA`), Verde Geração (`#56FF65`), Fundo Off-White (`#F6F4FC`) e Texto Escuro de Alto Contraste (`#1A0A3A`).
  - [ ] Garantir HTML semântico e tags ARIA para buscar score Lighthouse de Acessibilidade $\ge 90$.
- [ ] **Tratamento Universal de Três Estados Críticos (Obrigatório)**:
  - [ ] **Loading State:** Implementar *Skeletons Shimmer* elegantes durante o carregamento das listas e do modal, evitando travamentos visuais.
  - [ ] **Empty State Temático (Energia Renovável):** Se não houver dados, exibir mensagens personalizadas alinhadas ao negócio da Flora:
    - [ ] *Favoritos vazio:* 🔋 *"Sua bateria de termos salvos está descarregada! Explore o dicionário e favorite palavras para carregar seu deck de estudos."*
    - [ ] *Histórico vazio:* ☀️ *"Céu limpo e sem registros por aqui! Comece a pesquisar termos para gerar seus primeiros créditos de conhecimento."*
  - [ ] **Error State (O Apagão na Rede Elétrica):** Em caso de queda do backend ou erro 500, interceptar com uma tela estilizada:
    - [ ] *Mensagem:* 🌑 *"Opa! Tivemos uma queda de tensão na rede... Parece que nossos painéis solares pegaram uma nuvem passageira ou alguém puxou o cabo da tomada do servidor Florita. Nossa equipe de engenheiros de geração já foi acionada para reestabelecer os créditos de energia! Código do incidente: [HASH]"*
- [ ] **Agrupamento de Histórico Avançado**:
  - [ ] Na tela de histórico, processar a lista cronologicamente e renderizar os blocos separados por cabeçalhos temporais como no navegador: *"Hoje"*, *"Ontem"*, *"Semana Passada"*, *"Há mais tempo"*.

---

## 👤 7. Perfil do Usuário & Garantia de Qualidade

- [ ] **Visualização e Edição de Perfil (`GET /user/me`)**
  - [ ] Renderizar os dados do usuário autenticado.
  - [ ] Implementar fluxo de edição simples para alteração cadastral do nome (última feature a ser lapidada).
- [ ] **Testes Unitários (Diferencial Backend)**
  - [ ] Escrever testes unitários para validar se os controladores respondem com os status codes corretos (`200`, `204`, `400`).
  - [ ] Testar isoladamente as funções utilitárias de codificação/decodificação do cursor em Base64.