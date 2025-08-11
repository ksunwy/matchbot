FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g @nestjs/cli
RUN npm install
RUN npm run build


COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]
