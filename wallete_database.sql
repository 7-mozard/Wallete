-- Base de données complète pour l'application Wallete
-- Ce fichier contient toutes les tables, enums, et données nécessaires

-- Suppression des tables existantes (optionnel - pour réinitialisation complète)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Suppression des types énumérés existants
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS currency CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Création des types énumérés
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE currency AS ENUM ('FC', 'USD');
CREATE TYPE transaction_type AS ENUM ('deposit', 'transfer', 'purchase', 'money_creation');

-- Table des utilisateurs
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    role user_role NOT NULL DEFAULT 'client',
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table des portefeuilles
CREATE TABLE wallets (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance_fc NUMERIC(12,2) DEFAULT '0',
    balance_usd NUMERIC(12,2) DEFAULT '0',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table des produits
CREATE TABLE products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    currency currency NOT NULL DEFAULT 'FC',
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table des transactions
CREATE TABLE transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    type transaction_type NOT NULL,
    from_user_id VARCHAR REFERENCES users(id),
    to_user_id VARCHAR REFERENCES users(id),
    amount NUMERIC(12,2) NOT NULL,
    currency currency NOT NULL,
    description TEXT,
    product_id VARCHAR REFERENCES products(id),
    status VARCHAR NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table des notifications
CREATE TABLE notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Insertion des données initiales

-- Compte administrateur par défaut
INSERT INTO users (id, email, password, first_name, last_name, role, is_blocked, created_at, updated_at) VALUES 
('admin-uuid-001', 'admin@wallete.com', '$2b$10$n7V5VmmYZuJDHsQeLjzBiOajuHo0.CSvMJZwDa3Vt1XYSfbZEbhGu', 'Admin', 'Wallete', 'admin', false, now(), now());

-- Portefeuille admin avec des fonds initiaux
INSERT INTO wallets (id, user_id, balance_fc, balance_usd, created_at, updated_at) VALUES 
('wallet-admin-001', 'admin-uuid-001', '10000.00', '5000.00', now(), now());

-- Quelques produits d'exemple pour la boutique
INSERT INTO products (id, name, description, price, currency, stock, image_url, is_active, created_at, updated_at) VALUES 
('product-001', 'Smartphone Samsung Galaxy', 'Téléphone intelligent dernière génération avec écran AMOLED', '850000.00', 'FC', 15, null, true, now(), now()),
('product-002', 'Ordinateur Portable Dell', 'Laptop 15 pouces avec processeur Intel i7, 16GB RAM, 512GB SSD', '1200000.00', 'FC', 8, null, true, now(), now()),
('product-003', 'Montre Apple Watch', 'Montre connectée avec GPS et suivi de la santé', '450.00', 'USD', 12, null, true, now(), now()),
('product-004', 'Écouteurs Bluetooth', 'Écouteurs sans fil avec réduction de bruit active', '150000.00', 'FC', 25, null, true, now(), now()),
('product-005', 'Tablette iPad Pro', 'Tablette professionnelle 12.9 pouces avec stylet inclus', '800.00', 'USD', 6, null, true, now(), now());

-- Exemple de client test (optionnel)
INSERT INTO users (id, email, password, first_name, last_name, role, is_blocked, created_at, updated_at) VALUES 
('client-uuid-001', 'client@test.com', '$2b$10$n7V5VmmYZuJDHsQeLjzBiOajuHo0.CSvMJZwDa3Vt1XYSfbZEbhGu', 'Client', 'Test', 'client', false, now(), now()),
('client-uuid-002', 'client2@test.com', '$2b$10$n7V5VmmYZuJDHsQeLjzBiOajuHo0.CSvMJZwDa3Vt1XYSfbZEbhGu', 'Client', 'Deux', 'client', false, now(), now());

-- Portefeuille client test avec quelques fonds
INSERT INTO wallets (id, user_id, balance_fc, balance_usd, created_at, updated_at) VALUES 
('wallet-client-001', 'client-uuid-001', '50000.00', '100.00', now(), now()),
('wallet-client-002', 'client-uuid-002', '100000.00', '200.00', now(), now());

-- Quelques notifications d'exemple
INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES 
('notif-001', 'admin-uuid-001', 'Bienvenue sur Wallete', 'Votre compte administrateur a été créé avec succès. Vous pouvez maintenant gérer la plateforme.', false, now()),
('notif-002', 'client-uuid-001', 'Compte créé', 'Bienvenue sur Wallete ! Votre portefeuille électronique est maintenant actif.', false, now()),
('notif-003', 'client-uuid-001', 'Crédit de bienvenue', 'Vous avez reçu un crédit de bienvenue de 50,000 FC et 100 USD.', false, now());

-- Exemple de transactions
INSERT INTO transactions (id, type, from_user_id, to_user_id, amount, currency, description, product_id, status, created_at) VALUES 
('trans-001', 'money_creation', null, 'admin-uuid-001', '10000.00', 'FC', 'Création initiale de monnaie électronique FC', null, 'completed', now()),
('trans-002', 'money_creation', null, 'admin-uuid-001', '5000.00', 'USD', 'Création initiale de monnaie électronique USD', null, 'completed', now()),
('trans-003', 'deposit', 'admin-uuid-001', 'client-uuid-001', '50000.00', 'FC', 'Crédit de bienvenue pour nouveau client', null, 'completed', now()),
('trans-004', 'deposit', 'admin-uuid-001', 'client-uuid-001', '100.00', 'USD', 'Crédit de bienvenue USD pour nouveau client', null, 'completed', now());

-- Instructions d'utilisation en commentaire
/*
INSTRUCTIONS D'IMPORTATION ET D'UTILISATION :

1. Prérequis :
   - PostgreSQL installé localement
   - Node.js version 18 ou supérieure
   - npm ou yarn

2. Importation de la base de données :
   psql -U votre_utilisateur -d votre_base_de_donnees -f wallete_database.sql

3. Configuration de l'environnement :
   Créer un fichier .env à la racine du projet avec :
   DATABASE_URL=postgresql://utilisateur:mot_de_passe@localhost:5432/wallete
   JWT_SECRET=votre-secret-jwt-tres-securise
   NODE_ENV=development

4. Installation des dépendances :
   npm install

5. Lancement de l'application :
   npm run dev

6. Comptes de test disponibles :

   ADMINISTRATEUR :
   - Email: admin@wallete.com
   - Mot de passe: admin123
   - Solde: 10,000 FC + 5,000 USD

   CLIENT TEST :
   - Email: client@test.com
   - Mot de passe: admin123
   - Solde: 50,000 FC + 100 USD

7. Fonctionnalités disponibles :
   
   ADMIN :
   - Créer de la monnaie électronique
   - Gérer les utilisateurs (voir, bloquer, supprimer)
   - Créditer les comptes après dépôts
   - Gérer les produits de la boutique
   - Voir l'historique des transactions
   
   CLIENT :
   - Consulter le solde du portefeuille
   - Transférer de l'argent vers d'autres clients
   - Acheter des produits dans la boutique
   - Voir l'historique des transactions
   - Recevoir des notifications

8. Structure de la base de données :
   - users: Comptes utilisateurs avec rôles (admin/client)
   - wallets: Portefeuilles avec soldes FC et USD
   - products: Catalogue de produits pour la boutique
   - transactions: Historique complet des transactions
   - notifications: Système de notifications temps réel

Note: Les mots de passe sont hashés avec bcrypt. Le mot de passe "admin123" 
correspond au hash stocké en base de données.
*/