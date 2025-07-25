# Guide de Test Local - Wallete

## Prérequis

1. **PostgreSQL installé** sur votre machine locale
2. **Node.js** (version 18 ou plus récente)
3. **npm** ou **yarn**

## Étapes d'installation

### 1. Cloner et installer le projet

```bash
# Cloner le projet
git clone [URL_DU_PROJET]
cd wallete

# Installer les dépendances
npm install
```

### 2. Configurer la base de données PostgreSQL

#### Créer une base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE wallete_local;

# Quitter psql
\q
```

#### Importer les données de test

```bash
# Importer le fichier SQL avec les données de test
psql -U postgres -d wallete_local -f wallete_database.sql
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/wallete_local
JWT_SECRET=votre_secret_jwt_tres_securise
NODE_ENV=development
```

### 4. Lancer l'application

```bash
# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur : `http://localhost:5000`

## Comptes de test disponibles

### Compte Administrateur
- **Email** : admin@wallete.com
- **Mot de passe** : admin123
- **Portefeuille** : 10,000 FC et 5,000 USD

### Comptes Clients
- **Email** : client1@test.com
- **Mot de passe** : client123
- **Portefeuille** : 1,000 FC et 500 USD

- **Email** : client2@test.com
- **Mot de passe** : client123
- **Portefeuille** : 2,000 FC et 1,000 USD

## Tests à effectuer

### Tests Administrateur
1. **Connexion** avec admin@wallete.com
2. **Créer de la monnaie** (FC ou USD)
3. **Créditer un compte client** avec l'email d'un client
4. **Voir l'historique** des transactions

### Tests Client
1. **Connexion** avec client1@test.com
2. **Voir le portefeuille** et les soldes
3. **Transférer de l'argent** vers client2@test.com
4. **Acheter des produits** dans la boutique
5. **Consulter l'historique** des transactions

## Fonctionnalités disponibles

### Pour l'Administrateur :
- ✅ Tableau de bord avec le titre "Bienvenu administrateur général"
- ✅ Création de monnaie électronique (FC/USD)
- ✅ Crédit de comptes clients
- ✅ Gestion des produits
- ✅ Visualisation des transactions

### Pour les Clients :
- ✅ Portefeuille multi-devises (FC/USD)
- ✅ Transferts entre clients
- ✅ Boutique intégrée
- ✅ Historique des transactions
- ✅ Notifications en temps réel

## Résolution des problèmes

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré
- Vérifiez les paramètres de connexion dans `.env`
- Assurez-vous que la base de données `wallete_local` existe

### L'application ne démarre pas
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez que le port 5000 est libre
- Consultez les logs dans le terminal

### Problèmes de connexion
- Utilisez exactement les emails et mots de passe fournis
- Vérifiez que les données de test ont été importées correctement

## Support

En cas de problème, vérifiez :
1. Les logs dans le terminal
2. La console du navigateur (F12)
3. Que tous les prérequis sont installés