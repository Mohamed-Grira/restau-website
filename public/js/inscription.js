const formAuth = document.getElementById('form-auth');
const inputCourriel = document.getElementById('input-courriel');
const inputMotDePasse = document.getElementById('input-mot-de-passe');
const inputPrenom = document.getElementById('input-prenom');
const inputNom = document.getElementById('input-nom');
const formErreur = document.getElementById('form-erreur');

async function inscription(event) {
    event.preventDefault();

    let data = {
        courriel: inputCourriel.value,
        motDePasse: inputMotDePasse.value,
        prenom: inputPrenom.value,
        nom: inputNom.value
    };

    let response = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if(response.ok) {
        location.replace('/connexion');
    }
    else if(response.status === 400) {
        formErreur.innerText = 'Le courriel et mot de pass doit etre minimum 8 caractères'
    }
    else if(response.status === 409) {
        formErreur.innerText = 'L\'identifiant existe déjà'
    } else {
        formErreur.innerText = 'Il y a une erreur intern de serveur'
    }
}

formAuth.addEventListener('submit', inscription)