FROM node:lts

ENV MONGODB_URI=""

COPY . /app

WORKDIR /app

RUN npm ci \
    && npm run build

ENTRYPOINT ["npm", "start"]
