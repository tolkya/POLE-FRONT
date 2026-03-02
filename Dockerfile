FROM node:22-alpine

# Variable passée depuis docker-compose (via .env ou .env.dev)
ARG API_BASE_URL=https://localhost

WORKDIR /app

# Installe Angular CLI globalement
RUN npm install -g @angular/cli

# Copie uniquement les fichiers de dépendances en premier (optimise le cache Docker)
COPY package*.json ./

# Installe les dépendances npm
RUN npm install

# Copie le reste du code source
COPY . .

# Injecte l'URL du back en remplaçant le placeholder dans les fichiers environment Angular
RUN sed -i "s|__API_BASE_URL__|${API_BASE_URL}|g" src/environments/environment.ts src/environments/environment.development.ts

# Expose le port de dev Angular
EXPOSE 4200

# Lance le serveur de développement en écoutant sur toutes les interfaces (obligatoire dans Docker)
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
