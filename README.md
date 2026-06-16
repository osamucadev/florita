# 🌸 Florita

> Um ecossistema de busca de alta performance, proxy e gerenciamento de dicionário de inglês, imerso na identidade e nos conceitos de energia renovável da **Flora**.

## 🌐 Deploy

| Serviço | URL |
|---|---|
| Frontend | https://florita-ruddy.vercel.app |
| API | https://florita-production.up.railway.app |
| Documentação Swagger | https://florita-production.up.railway.app/api-docs |

## 💡 O Porquê do Nome

O nome **Florita** nasce da fusão entre a marca **Flora** e o sufixo latino *-ita*, frequentemente utilizado na mineralogia para batizar cristais e elementos naturais da terra (como a *Fluorita*).

Assim como a Flora transforma recursos naturais em créditos de energia limpa para simplificar a vida do consumidor, o **Florita** funciona como um catalisador de conhecimento: ele lapida uma base bruta de centenas de milhares de palavras em inglês, transformando-as em um fluxo de dados fluido, rápido e sustentável para o aprendizado do usuário.

## 🚀 Tecnologias Utilizadas

O ecossistema foi projetado como um **Monorepo** utilizando as tecnologias mais robustas do mercado para garantir escalabilidade e performance:

- **Back-end:** Node.js + Express (controle granular de headers, cache e proxy)
- **Banco de Dados NoSQL:** MongoDB + Mongoose (persistência orientada a documentos)
- **Camada de Cache:** Redis (latência próxima a zero para requisições repetidas, com headers `x-cache` e `x-response-time`)
- **Front-end:** Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Zustand + Framer Motion
- **Containerização:** Docker + Docker Compose (ambiente 100% portável e isolado)
- **Documentação:** OpenAPI 3.0 via Swagger UI em `/api-docs`

## 🏗️ Como Rodar o Projeto Localmente

### 1. Subir o ecossistema

Graças à orquestração com Docker, um único comando na raiz do projeto sobe tudo (MongoDB, Redis, API e Web):

```bash
docker compose up --build
```

Após o carregamento:

- Frontend disponível em: `http://localhost:3000`
- API disponível em: `http://localhost:3333`
- Documentação Swagger em: `http://localhost:3333/api-docs`

### 2. Popular o banco de palavras (obrigatório na primeira execução)

Com os containers em pé, execute o seed em outro terminal para importar as palavras do dicionário:

```bash
docker exec -it florita_api node scripts/seed.js
```

O script baixa a lista oficial da Free Dictionary API, filtra entradas inválidas e insere aproximadamente 166 mil palavras no MongoDB via bulk insert com streams. A operação leva alguns minutos. É idempotente: pode ser executada mais de uma vez sem duplicar dados.

## 🧠 Decisões de Engenharia e Roadmap

Para avaliar os critérios técnicos profundos, os tratamentos de estados (Loading, Empty, Erro) e a paginação por cursor, consulte os documentos dedicados na raiz:

- [📝 Detalhes e Especificações Técnicas (TECHNICAL_CHALLENGE.md)](./TECHNICAL_CHALLENGE.md)
- [🧠 Diretrizes e Decisões de Arquitetura (DECISIONS.md)](./DECISIONS.md)
- [🗺️ Checklist Granular de Desenvolvimento (ROADMAP.md)](./ROADMAP.md)