# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar resto do código e compilar
COPY . .
RUN npm run build

# Production Stage com Nginx
FROM nginx:alpine

# Copiar o ficheiro de configuração customizado do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar a build estática do React para a pasta html do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
