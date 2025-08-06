# front/Dockerfile
FROM node:20

WORKDIR /app

# Copie les fichiers nécessaires pour l’installation
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
