# ============================================================
# STAGE DEV — ng serve avec hot reload
# ============================================================
FROM node:22-alpine AS dev

# Variable passée depuis docker-compose (via .env ou .env.dev)
ARG API_BASE_URL=

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


# ============================================================
# STAGE BUILD — Compile Angular en fichiers statiques
# ============================================================
FROM node:22-alpine AS build

ARG API_BASE_URL=

WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm install

COPY . .

# Injecte l'URL du back
RUN sed -i "s|__API_BASE_URL__|${API_BASE_URL}|g" src/environments/environment.ts src/environments/environment.development.ts

# Compile Angular en mode production (fichiers JS/CSS minifiés)
RUN ng build --configuration production


# ============================================================
# STAGE PROD — Nginx sert les fichiers statiques compilés
# ============================================================
FROM nginx:alpine AS prod

# Supprime la config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copie la config Nginx pour Angular (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les fichiers compilés par Angular depuis le stage build
COPY --from=build /app/dist/POLE-FRONT/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
