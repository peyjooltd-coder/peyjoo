FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/src ./src
COPY src/data/mockData.js ./frontend-data/mockData.js
RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/divar.db
ENV UPLOADS_PATH=/app/data/uploads
EXPOSE 3001
CMD ["sh", "-c", "node src/db/seed.js && node src/index.js"]
