import { existsSync } from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Constante indiquant si la base de données existe au démarrage du serveur 
 * ou non.
 */
const IS_NEW = !existsSync(process.env.DB_FILE)

/**
 * Crée une base de données par défaut pour le serveur. Des données fictives
 * pour tester le serveur y ont été ajouté.
 */
const createDatabase = async (connectionPromise) => {
    let connection = await connectionPromise;

    await connection.exec(
        `CREATE TABLE type_utilisateur(
			id_type_utilisateur INTEGER PRIMARY KEY,
			nom TEXT NOT NULL
		);
		
		CREATE TABLE etat_commande(
			id_etat_commande INTEGER PRIMARY KEY,
			nom TEXT NOT NULL
		);
		
		CREATE TABLE produit(
			id_produit INTEGER PRIMARY KEY,
			nom TEXT,
			chemin_image TEXT,
			prix REAL
		);
		
		CREATE TABLE utilisateur(
			id_utilisateur INTEGER PRIMARY KEY,
			id_type_utilisateur INTEGER,
			courriel TEXT,
			mot_de_passe TEXT,
			prenom TEXT,
			nom TEXT,
			FOREIGN KEY(id_type_utilisateur)
			REFERENCES type_utilisateur(id_type_utilisateur)
		);
		
		CREATE TABLE commande(
			id_commande INTEGER PRIMARY KEY,
			id_utilisateur INTEGER,
			id_etat_commande INTEGER,
			date INTEGER,
			FOREIGN KEY(id_utilisateur)
			REFERENCES utilisateur(id_utilisateur),
			FOREIGN KEY(id_etat_commande)
			REFERENCES etat_commande(id_etat_commande)
		);
		
		CREATE TABLE commande_produit(
			id_commande INTEGER,
			id_produit INTEGER,
			quantite INTEGER,
			PRIMARY KEY(id_commande, id_produit),
			FOREIGN KEY(id_commande)
			REFERENCES commande(id_commande),
			FOREIGN KEY(id_produit)
			REFERENCES produit(id_produit)
		);
		
		INSERT INTO type_utilisateur(nom) VALUES('client');
		INSERT INTO type_utilisateur(nom) VALUES('administrateur');
		
		INSERT INTO etat_commande(nom) VALUES('panier');
		INSERT INTO etat_commande(nom) VALUES('cuisine');
		INSERT INTO etat_commande(nom) VALUES('livraison');
		INSERT INTO etat_commande(nom) VALUES('terminée');
		
		INSERT INTO utilisateur(id_type_utilisateur, courriel, mot_de_passe, prenom, nom)
		VALUES(1, 'test@test.com', 'Test1234', 'Test', 'Test');

		INSERT INTO produit(nom, chemin_image, prix) VALUES
            ('Espresso', './img/espresso.jpg', 2.50),
            ('Latté', './img/latte.jpg', 3.85),
            ('Cappuccino', './img/cappuccino.jpg', 3.85),
            ('Americano', './img/americano.jpg', 2.80),
            ('Décaféiné', './img/decaf.jpg', 3.80),
            ('Thé Earl Grey', './img/earlgray.jpg', 2.35),
            ('Thé Chai', './img/chai.jpg', 2.35),
            ('Thé vert', './img/vert.jpg', 2.35),
            ('Thé à la menthe', './img/menthe.jpg', 2.35),
            ('Thé London Fog', './img/londonfog.jpg', 4.30),
            ('Thé matcha', './img/matcha.jpg', 4.30),
            ('Latté sur glace', './img/latteglace.jpg', 3.95),
            ('Frappé Moka', './img/frappemoka.jpg', 4.00),
            ('Chocolat chaud', './img/chocolat.jpg', 4.00),
            ('Chocolat blanc chaud', './img/chocolatblanc.jpg', 2.85);`
    );

    return connection;
}

// Base de données dans un fichier
let connectionPromise = open({
    filename: process.env.DB_FILE,
    driver: sqlite3.Database
});

// Si le fichier de base de données n'existe pas, on crée la base de données
// et on y insère des données fictive de test.
if (IS_NEW) {
    connectionPromise = createDatabase(connectionPromise);
}

export default connectionPromise;