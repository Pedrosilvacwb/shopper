FROM node:18

WORKDIR /api

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

CMD [ "npm", "run", "start:dev" ]