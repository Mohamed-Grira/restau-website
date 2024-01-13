// Importation des modules nécessaires
import connectionPromise from '../connexion.js'; // Module de connexion à la base de données
import bcrypt from 'bcrypt'; // Module de hachage de mot de passe

// Fonction pour ajouter un utilisateur à la base de données
export async function addUtilisateur(courriel, motDePasse, prenom, nom) {
    const connection = await connectionPromise; // Établir une connexion à la base de données

    // Hacher le mot de passe avant de l'ajouter à la base de données
    let hash = await bcrypt.hash(motDePasse, 10);

    // Exécuter la requête d'insertion dans la table utilisateur
    await connection.run(
        `INSERT INTO utilisateur(id_type_utilisateur, courriel, mot_de_passe, prenom, nom)
        VALUES(?, ?, ?, ?, ?)`,
        [1, courriel, hash, prenom, nom]
    );
}

// Fonction pour récupérer un utilisateur par son identifiant
export async function getUtilisateurParId(idUtilisateur) {
    const connection = await connectionPromise; // Établir une connexion à la base de données

    // Exécuter la requête de sélection dans la table utilisateur par l'identifiant
    let utilisateur = await connection.get(
        `SELECT *
        FROM utilisateur
        WHERE id_utilisateur = ?`,
        [idUtilisateur]
    );

    return utilisateur;
}

// Fonction pour récupérer un utilisateur par son courriel
export async function getUtilisateurParCourriel(courriel) {
    const connection = await connectionPromise; // Établir une connexion à la base de données

    // Exécuter la requête de sélection dans la table utilisateur par le courriel
    let utilisateur = await connection.get(
        `SELECT *
        FROM utilisateur
        WHERE courriel = ?`,
        [courriel]
    );

    return utilisateur;
}