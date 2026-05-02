FROM node:20-alpine AS builder
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем всё остальное
COPY . .

# Сборка веба (добавляем CI=true для стабильности)
ENV CI=true
RUN npx expo export --platform web

# Раздача через Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
