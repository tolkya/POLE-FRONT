# ============================================================
# STAGE DEV — ng serve avec hot reload
# ============================================================
FROM node:22-alpine AS dev

WORKDIR /app

# Installe Angular CLI globalement
RUN npm install -g @angular/cli

# Copie uniquement les fichiers de dépendances en premier (optimise le cache Docker)
COPY package*.json ./

# Installe les dépendances npm
RUN npm install

# Copie le reste du code source
COPY . .

# En dev, les fichiers environment.*.ts sont montés via volume depuis l'hôte.
# Pas besoin de sed ici — environment.development.ts contient déjà la bonne URL.

# Expose le port de dev Angular
EXPOSE 4200

# Lance le serveur de développement en écoutant sur toutes les interfaces (obligatoire dans Docker)
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--ssl"]


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
