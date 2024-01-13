// Liste de tous les <select> pour les commandes
let selects = document.querySelectorAll('.commande select');

/**
 * Modifie l'état d'une commande sur le serveur.
 * @param {InputEvent} event Objet d'information sur l'événement.
 */
const modifyEtatCommande = async (event) => {
    let data = {
        idCommande: parseInt(event.target.parentNode.parentNode.dataset.idCommande),
        idEtatCommande: parseInt(event.target.value)
    };

    await fetch('/commande', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// Ajoute l'exécution de la fonction "modifyEtatCommande" pour chaque <select> 
// lorsque son état change.
for (let select of selects) {
    select.addEventListener('change', modifyEtatCommande)
}