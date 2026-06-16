FROM node:20-alpine

RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3333

CMD ["npm", "run", "dev"]