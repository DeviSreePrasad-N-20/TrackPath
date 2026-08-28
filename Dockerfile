# ==========================================
# TrackPath Production Multi-Stage Dockerfile
# ==========================================

# Step 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm install
COPY frontend-react/ ./
RUN npm run build

# Step 2: Production Server
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy backend source & compiled frontend assets
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend-react/dist ./frontend-react/dist

EXPOSE 5000

CMD ["node", "backend/server.js"]
