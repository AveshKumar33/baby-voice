# Use Node 20 Alpine for lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install global dependencies (optional)
RUN npm install -g @nestjs/cli

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 4000  
# change to 3002 for voice-service

# Use dev command for hot reload
CMD ["npm", "run", "start:dev"]
