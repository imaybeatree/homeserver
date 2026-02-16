FROM node:22-alpine

WORKDIR /app

# Copy all package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY homeapp/package*.json ./homeapp/

# Install dependencies for all parts
RUN npm install && npm install --prefix backend && npm install --prefix homeapp

# Copy the rest of the project
COPY . .

# Expose your ports
EXPOSE 3000
EXPOSE 5173

# Start both servers
CMD ["npm", "start"]
