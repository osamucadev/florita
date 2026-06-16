FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Garante que o Next.js vai rodar em modo de desenvolvimento e escutar todas as interfaces
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]