// Liste de tous les boutons de supression du panier
let boutonsDelete = document.querySelectorAll('.panier input[type=button]');

// Bouton de soumission du panier
let boutonSoumettre = document.getElementById('soumettre');

// Bouton pour vider le panier
let boutonVider = document.getElementById('vider');

// Entête du tableau du panier
let thead = document.querySelector('.panier thead');

// Corps du tableau du panier
let tbody = document.querySelector('.panier tbody');

/**
 * Vide le panier dans l'interface graphique.
 */
const emptyPanierClient = () => {
    // Vider le tableau
    tbody.innerHTML = '';

    // Cacher l'entête du tableau
    thead.classList.add('hidden');

    // Désactiver les boutons de soumission et pour vider
    boutonSoumettre.setAttribute('disabled', 'disabled');
    boutonVider.setAttribute('disabled', 'disabled');
}

/**
 * Retire un produit du panier sur le serveur.
 * @param {MouseEvent} event Objet d'information sur l'événement.
 */
const removeFromPanier = async (event) => {
    let data = {
        idProduit: parseInt(event.target.parentNode.parentNode.dataset.idProduit)
    }

    let response = await fetch('/panier', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        event.target.parentNode.parentNode.remove();
        if (tbody.children.length <= 0) {
            emptyPanierClient();
        }
    }
}

/**
 * Soumission du panier sur le serveur.
 */
const addCommande = async () => {
    let response = await fetch('/commande', {
        method: 'POST'
    });

    if (response.ok) {
        emptyPanierClient();
    }
}

/**
 * Vider le panier sur le serveur.
 */
const emptyPanier = async () => {
    let response = await fetch('/panier', {
        method: 'DELETE'
    });

    if (response.ok) {
        emptyPanierClient();
    }
}

// Ajoute l'exécution de la fonction "removeFromPanier" pour chaque bouton de 
// suppression du panier lorsque l'on clique dessus.
for (let bouton of boutonsDelete) {
    bouton.addEventListener('click', removeFromPanier)
}

// Ajoute l'exécution de la fonction "addCommande" sur le bouton de 
// soumission du panier.
boutonSoumettre.addEventListener('click', addCommande);

// Ajoute l'exécution de la fonction "emptyPanier" sur le bouton pour vider le 
// panier.
boutonVider.addEventListener('click', emptyPanier);
