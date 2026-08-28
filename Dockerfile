# ==========================================
# TrackPath Production Multi-Stage Dockerfile
# ==========================================

# Step 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm install
COPY frontend-react/ ./
RUN npm run build

# Step 2: Production Server
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies (including native build tools for better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source & data
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend-react/dist ./frontend-react/dist

EXPOSE 5000

CMD ["node", "backend/server.js"]
