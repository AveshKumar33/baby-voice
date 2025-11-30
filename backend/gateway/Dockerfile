# gateway/Dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package.json first to leverage caching
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

EXPOSE 4000
CMD ["npm", "run", "start:dev"]  # or start:prod depending on your setup
