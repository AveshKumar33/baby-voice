# voice-service/Dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
CMD ["node", "index.js"]  # replace index.js with your entrypoint
