const formAuth = document.getElementById('form-auth');
const inputCourriel = document.getElementById('input-courriel');
const inputMotDePasse = document.getElementById('input-mot-de-passe');
const formErreur = document.getElementById('form-erreur');

async function connexion(event) {
    event.preventDefault();

    let data = {
        courriel: inputCourriel.value,
        motDePasse: inputMotDePasse.value
    };

    let response = await fetch('/api/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if(response.ok) {
        location.replace('/');
    }
    else if(response.status === 401) {
        let info = await response.json();
        
        if(info.erreur === 'mauvais_utilisateur') {
            formErreur.innerText = 'Courriel inexistant'
        }
        else if(info.erreur === 'mauvais_mot_passe') {
            formErreur.innerText = 'Mauvais mot de passe'
        }
    }
}

formAuth.addEventListener('submit', connexion)