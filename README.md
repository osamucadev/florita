# 🌸 Florita

> Um ecossistema de busca de alta performance, proxy e gerenciamento de dicionário de inglês, imerso na identidade e nos conceitos de energia renovável da **Flora**.

---

## 💡 O Porquê do Nome (A Essência do Produto)

O nome **Florita** nasce da fusão entre a marca **Flora** e o sufixo latino *-ita*, frequentemente utilizado na mineralogia para batizar cristais e elementos naturais da terra (como a *Fluorita*). 

Assim como a Flora transforma recursos naturais em créditos de energia limpa para simplificar a vida do consumidor, o **Florita** funciona como um catalisador de conhecimento: ele lapida uma base bruta de centenas de milhares de palavras em inglês, transformando-as em um fluxo de dados fluido, rápido e sustentável para o aprendizado do usuário. 

---

## 🚀 Tecnologias Utilizadas

O ecossistema foi projetado como um **Monorepo** utilizando as tecnologias mais robustas do mercado para garantir escalabilidade e performance:

* **Back-end:** Node.js + Express (API de altíssima performance e controle granular)
* **Banco de Dados NoSQL:** MongoDB + Mongoose (Persistência escalável orientada a documentos)
* **Camada de Cache:** Redis (Latência próxima a zero para requisições repetidas)
* **Front-end:** Next.js 15 + React + Tailwind CSS (Interface imersiva na paleta oficial da Flora)
* **Containerização:** Docker + Docker Compose (Ambiente 100% portável e isolado)

---

## 🏗️ Como Rodar o Projeto Localmente

Graças à orquestração com Docker, você só precisa de **um único comando** na raiz do projeto para subir todo o ecossistema (Banco NoSQL, Cache, API e Web):

    docker compose up --build

Após o carregamento, a API estará respondendo em: http://localhost:3333/

---

## 🧠 Decisões de Engenharia e Roadmap

Para avaliar os critérios técnicos profundos, os tratamentos de estados (Loading, Empty, Erro) e a paginação por cursor, consulte os nossos documentos dedicados na raiz:
* [📝 Detalhes e Especificações Técnicas (TECHNICAL_CHALLENGE.md)](./TECHNICAL_CHALLENGE.md)
* [🧠 Diretrizes e Decisões de Arquitetura (DECISIONS.md)](./DECISIONS.md)
* [🗺️ Checklist Granular de Desenvolvimento (ROADMAP.md)](./ROADMAP.md)