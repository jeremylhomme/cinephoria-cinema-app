# Cinéphoria

Cinéphoria est une plateforme complète de gestion de cinéma comprenant une application web, une application mobile et une application de bureau. Elle permet aux utilisateurs de consulter les films à l'affiche, de réserver des billets, et aux employés de gérer les salles et les séances.

Liens des documents:

Charte graphique :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/charte-graphique-cinephoria.pdf

Documentation technique :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/documentation-technique.pdf

Gestion de projet :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/gestion-de-projet.pdf

Manuel d'utilisation :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/manuel-d-utilisation.pdf

Maquettes application bureautique :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/maquettes-dektop-app.pdf

Maquettes application mobile :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/maquettes-mobile-app_compressed.pdf

Maquettes application web :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/maquettes-web-app_compressed.pdf

Wireframes application bureautique :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/wireframes-desktop-app_compressed.pdf

Wireframs application mobile :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/wireframes-mobile-app_compressed.pdf

Wireframes application web :
https://cinephoriamedia.s3.us-east-2.amazonaws.com/Documents/wireframes-web-app_compressed.pdf

Transactions sql :
https://github.com/jeremylhomme/cinephoria-cinema-app/tree/main/web-app/sql

## Structure du projet

Le projet est divisé en trois parties principales :

- `web-app/`: Application web (frontend React et backend Node.js)
- `mobile-app/`: Application mobile (React Native)
- `desktop-app/`: Application de bureau (Electron)

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Docker et Docker Compose
- MySQL
- MongoDB

## Installation et déploiement local

### Application Web

1. Naviguez vers le dossier `web-app/`

2. Copiez `.example.env` vers `.env` et configurez les variables d'environnement

3. Installez les dépendances :
   npm install

4. Lancez les conteneurs Docker :
   docker-compose -f docker-compose-dev.yml up -d

5. Appliquez les migrations Prisma :
   npx prisma migrate dev

6. Lancez le serveur de développement :
   npm run dev

L'application web sera accessible à l'adresse `http://localhost:5173`

### Application Mobile

1. Naviguez vers le dossier `mobile-app/`

2. Copiez `.example.env` vers `.env` et configurez les variables d'environnement

3. Installez les dépendances :
   npm install

4. Lancez l'application :
   npm start

Suivez les instructions d'Expo pour lancer l'application sur un émulateur ou un appareil physique.

### Application de Bureau

1. Naviguez vers le dossier `desktop-app/`

2. Copiez `.example.env` vers `.env` et configurez les variables d'environnement

3. Installez les dépendances :
   npm install

4. Lancez l'application :
   npm start

## Tests

Les tests sont exécutés dans un environnement Docker isolé pour assurer la cohérence et la reproductibilité.

Pour lancer les tests :

1. Assurez-vous d'être dans le dossier racine du projet `web-app/`

2. Créez un fichier `.env.docker.test` basé sur `.example.env.docker.test` et configurez les variables d'environnement nécessaires pour les tests.

3. Lancez les conteneurs Docker pour les tests :
   docker-compose -f docker-compose-test.yml up -d --build

4. Exécutez les tests :
   npm run test

Cette commande va :

- Lancer les conteneurs nécessaires
- Exécuter les migrations de base de données
- Lancer les différents types de tests (unitaires, fonctionnels, intégration)

5. Pour exécuter un type de test spécifique, vous pouvez utiliser :
   npm run test:unit # pour les tests unitaires
   npm run test:functional # pour les tests fonctionnels
   npm run test:integration # pour les tests d'intégration

6. Une fois les tests terminés, vous pouvez arrêter et supprimer les conteneurs :
   npm run docker:test:down

Les résultats des tests seront affichés dans la console.

Note : Assurez-vous que Docker est en cours d'exécution sur votre machine avant de lancer les tests.
