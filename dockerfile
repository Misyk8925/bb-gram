FROM node:19-alpine

COPY package.json /app/
COPY src /app/src
COPY eslint.config.mjs /app/
COPY tsconfig.json /app/
COPY tsconfig.build.json /app/
COPY jest-setup.ts /app/


WORKDIR /app

RUN npm install

CMD ['npm', 'run', 'start']