# 🗺️ Florita: Roadmap Granular de Desenvolvimento

Este documento apresenta o mapeamento completo e o checklist de engenharia para o ecossistema **Florita** (Front-end + Back-end). O planejamento foi estruturado de forma granular para garantir a cobertura de todos os requisitos de negócio, critérios de qualidade, segurança e tratamento de estados exigidos no edital.

## 🏗️ 1. Infraestrutura & Banco de Dados (Back-End)

- [x] **Configuração do Ambiente Docker**
  - [x] Criar `Dockerfile` otimizado para o Back-end (Node.js/Express).
  - [x] Criar `Dockerfile` otimizado para o Front-end (Next.js 15).
  - [x] Estruturar o `docker-compose.yml` integrando: API, Web, MongoDB e Redis.
- [x] **Modelagem do Banco de Dados (MongoDB)**
  - [x] Collection `users`: ID, nome, e-mail (índice único), senha criptografada, timestamps.
  - [x] Collection `history`: ID, user_id (ref), palavra, timestamps.
  - [x] Collection `favorites`: ID, user_id (ref), palavra, timestamps.
  - [x] Collection `dicitionaries`: ID, palavra (com índice para busca rápida).
- [x] **Script de Carga Automatizada (Seed)**
  - [x] Implementar script Node.js usando Streams para ler o `english.txt` oficial sem estourar a memória RAM.
  - [x] Implementar inserção em lote (Bulk Insert) para popular a collection `dicitionaries`.
  - [x] Filtrar palavras inválidas: rejeitar entradas que começam com hífen, contêm espaços, `&` ou pontuação.
  - [x] Garantir idempotência com índice único (reruns não duplicam dados).

## 🔐 2. Autenticação & Segurança (Back & Front)

### Fluxo de Cadastro (Signup)

- [x] **Back-End (`POST /auth/signup`)**
  - [x] Validar se o e-mail já existe (retornar status 400 amigável caso exista).
  - [x] Criptografar a senha com `bcrypt` antes de salvar.
  - [x] Gerar token JWT contendo ID e nome, com expiração configurável via `.env`.
  - [x] Retornar o ID do usuário, nome e o token imediatamente após o cadastro.
- [x] **Front-End (Tela de Cadastro)**
  - [x] Formulário completo com TypeScript consistente (sem uso de `any`).
  - [x] Validação em tempo real com feedback visual ao desfocar do campo (on blur).
  - [x] Regra de Nome: mínimo de 2 caracteres.
  - [x] Regra de E-mail: validação por expressão regular.
  - [x] Regra de Senha: checklist dinâmico com 8+ caracteres, maiúscula, número e caractere especial.
  - [x] Botão bloqueado até o formulário estar 100% válido.

### Fluxo de Login (Signin)

- [x] **Back-End (`POST /auth/signin`)**
  - [x] Validar credenciais e retornar status 400 com mensagem humanizada caso falhe.
  - [x] Retornar o token JWT e dados do usuário.
- [x] **Front-End (Tela de Login)**
  - [x] Formulário com validação antes do envio.
  - [x] Token JWT armazenado via localStorage com gerenciamento de estado global por Zustand.

### Mecanismos de Logout

- [x] **Logout Manual**
  - [x] Botão "Sair" no header das páginas internas.
  - [x] Limpeza do token e estado local com redirect para `/`.
- [x] **Logout por Inatividade Real**
  - [x] Listener global monitorando `mousemove`, `mousedown`, `keydown`, `touchstart` e `scroll`.
  - [x] Timer de 5 minutos resetado a cada interação real. Token ativo enquanto o usuário estiver navegando.
  - [x] Redirect para `/` com query param `?reason=inactivity` e mensagem explicativa na tela de login.
- [x] **Interceptação de Token Expirado (401)**
  - [x] Qualquer chamada à API que retorne 401 limpa o storage e redireciona para `/?reason=expired`.
  - [x] Mensagem explicativa exibida na tela de login.

## ⚡ 3. Motor de Busca & Paginação por Cursor

- [x] **Back-End (`GET /entries/en`)**
  - [x] Busca por prefixo usando range no índice `{ word: 1 }` via `$gte` / `$lt`.
  - [x] Paginação por cursor em Base64 (diferencial): campos `next`, `previous`, `hasNext`, `hasPrev`.
  - [x] Cache Redis por chave dinâmica com TTL de 5 minutos.
  - [x] Headers `x-cache` e `x-response-time` em todas as respostas.
- [x] **Front-End (Campo de Busca)**
  - [x] Campo de busca responsivo com debounce de 350ms via `useRef`.
  - [x] Dropdown de sugestões com animação de entrada/saída via Framer Motion.
  - [x] Submit por Enter navega diretamente para a primeira sugestão.

## 📖 4. Detalhes da Palavra & Regra de Histórico

- [x] **Back-End (`GET /entries/en/:word`)**
  - [x] Cache Redis com TTL de 24h. Header `x-cache: HIT/MISS` e `x-response-time`.
  - [x] Proxy transparente para a Free Dictionary API.
  - [x] Registro no histórico apenas na primeira visualização por usuário (upsert com `$setOnInsert`).
- [x] **Front-End (Detalhes da Palavra)**
  - [x] Componente `WordDetails` compartilhado entre modal e página completa.
  - [x] Renderização de fonética, definições, exemplos e sinônimos.
  - [x] Reprodução de áudio via `<Audio>` nativo quando disponível.
  - [x] Múltiplas entradas colapsadas em accordion com animação de altura.
  - [x] `WordModal` como bottom sheet no mobile e modal centralizado no desktop.

## ⭐️ 5. Gerenciamento de Palavras Favoritas

- [x] **Back-End**
  - [x] `POST /entries/en/:word/favorite`: salva com trava atômica contra duplicidade (índice único).
  - [x] `DELETE /entries/en/:word/unfavorite`: remove e retorna 404 se não existia.
- [x] **Front-End**
  - [x] Botão de favoritar/desfavoritar no `WordDetails` com animação de pulso via Framer Motion.
  - [x] Transição de cor de `#BFB3DA` para `#5E00FA` ao favoritar.
  - [x] Modal de confirmação antes de desfavoritar na tela de favoritos.
  - [x] Remoção otimista da lista sem refetch.

## 🎨 6. Qualidade de UI/UX, Estados e Imersão de Marca

- [x] **Identidade Visual Flora Energia**
  - [x] Paleta configurada: Roxo Elétrico (`#5E00FA`), Verde Geração (`#56FF65`), Fundo Off-White (`#F6F4FC`), Texto (`#1F0A3D`).
  - [x] Tipografia editorial: Playfair Display (serif) para títulos, Geist Sans para interface.
  - [x] Linguagem temática: "painel de geração", "créditos de conhecimento", "queda de tensão".
  - [x] Rodapé global: "Powered by Samuel Caetité · Google Developer Expert".
- [x] **Tratamento Universal de Três Estados**
  - [x] Loading: skeletons com `animate-pulse` em todas as telas.
  - [x] Empty state temático em histórico, favoritos e dicionário.
  - [x] Error state com metáfora de "apagão na rede" em todas as telas.
- [x] **Agrupamento de Histórico**
  - [x] Histórico agrupado por período: "Hoje", "Ontem", "Esta semana", "Há mais tempo".

## 👤 7. Perfil do Usuário & Garantia de Qualidade

- [x] **Perfil do Usuário (`GET /user/me`)**
  - [x] Endpoint implementado retornando id, nome, e-mail e createdAt.
  - [x] Iniciais do usuário exibidas no avatar do header.
- [ ] **Edição de Perfil**
  - [ ] Fluxo de edição do nome na tela de perfil.
- [ ] **Testes Unitários (Diferencial Backend)**
  - [ ] Testes para os controllers validando status codes `200`, `204` e `400`.
  - [ ] Testes para as funções de codificação/decodificação do cursor em Base64.