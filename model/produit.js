import connectionPromise from '../connexion.js';

/**
 * Retourne une liste de tous les produits dans la base de données.
 * @returns Une liste de tous les produits.
 */
export const getProduit = async () => {
    let connection = await connectionPromise;
    
    let results = await connection.all(
        'SELECT id_produit, nom, chemin_image, printf("%.2f", prix) AS prix FROM produit;'
    );
    
    return results;
}