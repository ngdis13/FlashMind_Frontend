# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install -g expo-cli
RUN npm install
COPY . .

RUN npm run web:build || npx expo export --platform web

# 2. Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
