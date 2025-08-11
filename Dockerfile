FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g @nestjs/cli
RUN npm install


COPY . .

RUN npx nest build


CMD ["node", "dist/main.js"]
