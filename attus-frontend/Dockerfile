FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Faz o build de produção do Angular 17
RUN npm run build -- --configuration=production

FROM nginx:alpine

# Remove configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos da build para o Nginx (o caminho do browser builder do Angular 17)
COPY --from=build /app/dist/attus-frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
