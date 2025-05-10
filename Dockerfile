# Dockerfile for Express API server
FROM node:22-alpine
WORKDIR /app
COPY package.json /app
RUN apk update && apk add --no-cache git
RUN npm install
COPY . /app
COPY .env /app/
CMD ["npm", "start"]