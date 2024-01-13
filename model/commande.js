import connectionPromise from '../connexion.js';

/**
 * Retourne une liste de toutes les commandes ainsi que tous les produits 
 * qu'elles contiennent dans la base de données.
 * @returns Une liste de toutes les commandes ainsi que tous les produits qu'elles contiennent.
 */
export const getCommande = async () => {
    let connection = await connectionPromise;
    
    // Recherche des commandes et des produits à l'intérieur des commandes
    let results = await connection.all(
        `SELECT commande.id_commande, date, id_etat_commande,
            produit.id_produit, chemin_image, produit.nom, quantite
        FROM commande
        INNER JOIN commande_produit ON commande.id_commande = commande_produit.id_commande
        INNER JOIN produit ON commande_produit.id_produit = produit.id_produit
        WHERE id_etat_commande <> 1
        ORDER BY commande.id_commande;`
    );

    /* Construction d'une liste de commandes plus simple à utiliser en 
    Javascript. La liste aura le format suivant:
    [
        {
            id_commande: ?,
            date: ?,
            id_etat_commande: ?,
            produit: [
                {
                    id_produit: ?,
                    chemin_image: ?,
                    nom: ?,
                    quantite: ?,
                },
                ...
            ]
        },
        ...
    ]*/
    // Dernier identifiant sur lequel on a bouclé
    let lastId = -1;

    // Nouvelle liste de commandes
    let commandes = [];
    for (const row of results) {
        // Si c'est la première fois qu'on rencontre l'identifiant de la 
        // commande, on lui crée une entrée dans notre tableau de commandes.
        if (lastId != row.id_commande) {
            lastId = row.id_commande;
            commandes.push({
                id_commande: row.id_commande,
                date: (new Date(row.date)).toLocaleString('fr-ca'),
                id_etat_commande: row.id_etat_commande,
                produit: []
            });
        }

        // On ajoute les données des produits dans la commande.
        commandes[commandes.length - 1].produit.push({
            id_produit: row.id_produit,
            chemin_image: row.chemin_image,
            nom: row.nom,
            quantite: row.quantite
        });
    }

    return commandes;
}

/**
 * Retourne une liste de toutes les commandes de l'utilisateur ainsi que tous les produits 
 * qu'elles contiennent dans la base de données.
 * @returns Une liste de toutes les commandes de l'utilisateur ainsi que tous les produits qu'elles contiennent.
 */
export const getCommandeOfUser = async (id_utilisateur) => {
    let connection = await connectionPromise;
    
    // Recherche des commandes et des produits à l'intérieur des commandes
    let results = await connection.all(
        `SELECT commande.id_commande, commande.id_utilisateur, date, id_etat_commande,
            produit.id_produit, chemin_image, produit.nom, quantite
        FROM commande
        INNER JOIN commande_produit ON commande.id_commande = commande_produit.id_commande
        INNER JOIN produit ON commande_produit.id_produit = produit.id_produit
        WHERE id_etat_commande <> 1
        AND commande.id_utilisateur = ?
        ORDER BY commande.id_commande;`,
        [id_utilisateur]
    );

    // Dernier identifiant sur lequel on a bouclé
    let lastId = -1;

    // Nouvelle liste de commandes
    let commandes = [];
    for (const row of results) {
        // Si c'est la première fois qu'on rencontre l'identifiant de la 
        // commande, on lui crée une entrée dans notre tableau de commandes.
        if (lastId != row.id_commande) {
            lastId = row.id_commande;
            commandes.push({
                id_commande: row.id_commande,
                date: (new Date(row.date)).toLocaleString('fr-ca'),
                id_etat_commande: row.id_etat_commande,
                produit: []
            });
        }

        // On ajoute les données des produits dans la commande.
        commandes[commandes.length - 1].produit.push({
            id_produit: row.id_produit,
            chemin_image: row.chemin_image,
            nom: row.nom,
            quantite: row.quantite
        });
    }

    return commandes;
}

/**
 * Soumet le panier en ajoutant une commande comprenant les données du panier 
 * et en vidant le panier dans la base de données.
 */
export const soumettreCommande = async () => {
    let connection = await connectionPromise;

    // Modifie la commande de panier pour la soumettre.
    let result = await connection.run(
        `UPDATE commande
        SET id_etat_commande = 2, date = ?
        WHERE id_etat_commande = 1`,
        [Date.now()]
    );

    return result.lastID
}

/**
 * Modifie l'état d'une commande dans la base de données.
 * @param {Number} idCommande Identifiant de la commande à modifier.
 * @param {Number} idEtat Nouvel identifiant de l'état de la commande.
 */
export const modifyEtatCommande = async (idCommande, idEtat) => {
    let connection = await connectionPromise;

    await connection.run(
        'UPDATE commande SET id_etat_commande = ? WHERE id_commande = ?',
        [idEtat, idCommande]
    )
}

/**
 * Retourne une liste de tous les états de commande dans la base de données.
 * @returns Une liste de tous les états de commande.
 */
export const getEtatCommande = async () => {
    let connection = await connectionPromise;

    let results = await connection.all(
        'SELECT * FROM etat_commande WHERE id_etat_commande <> 1'
    );

    return results;
}