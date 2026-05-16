# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Adjust the build step if your app doesn't need it (e.g., plain Express)
RUN npm run build || echo "No build step, proceeding"

# ---------- Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
