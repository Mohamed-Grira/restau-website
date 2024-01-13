// Aller chercher les configurations de l'application
import 'dotenv/config';

// Importer les fichiers et librairies
import https from 'node:https'
import { readFile } from 'node:fs/promises'
import express, { json, urlencoded } from 'express';
import { engine } from 'express-handlebars';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cspOption from './csp-options.js'
import session from 'express-session'
import memorystore from 'memorystore'
import passport from 'passport'
import { getProduit } from './model/produit.js';
import { getPanier, addToPanier, removeFromPanier, emptyPanier } from './model/panier.js';
import { getCommande, getCommandeOfUser, soumettreCommande, modifyEtatCommande, getEtatCommande } from './model/commande.js';
import { validateId, validatePanier, isCourrielValid, isMotDePasseValid } from './validation.js';
import './authentification.js';
import { addUtilisateur } from './model/utilisateur.js'
import middlewareSse from './middleware-sse.js'

// Création du serveur
const app = express();

// Création de la base de données de session
const MemoryStore = memorystore(session);

// Configuration de l'engin de rendu
app.engine('handlebars', engine({
    helpers: {
        equals: (valeur1, valeur2) => valeur1 === valeur2
    }
}))
app.set('view engine', 'handlebars');
app.set('views', './views');

// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());
app.use(session({
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(middlewareSse());

// Routes
// Route de la page du menu
app.get('/', async (request, response) => {
    let produits = [];
    let status = 200;

    // On va chercher les produits dans la base de données
    try {
        produits = await getProduit();
    }
    catch(erreur) {
        // Si on a une erreur en allant chercher les produits, on va l'indiquer 
        // dans notre page
        status = 500;
    }

    response.status(status).render('menu', {
        titre: 'Menu',
        styles: ['/css/style.css'],
        scripts: ['/js/menu.js'],
        produit: produits,
        erreur: status !== 200,
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});

// Route pour la page d'inscription
app.get('/inscription', (requete, reponse) => {
    reponse.render('authentification', {
        titre: 'Inscription',
        styles: ['/css/style.css'],
        scripts: ['/js/inscription.js'],
        bouton: 'S\'inscrire',
        isInscription: true,
        user: requete.user,
        admin: requete.user && requete.user.id_type_utilisateur === 2
    });
});

// Route pour la page de connexion
app.get('/connexion', (requete, reponse) => {
    reponse.render('authentification', {
        titre: 'Connexion',
        styles: ['/css/style.css'],
        scripts: ['/js/connexion.js'],
        bouton: 'Connecter',
        user: requete.user,
        admin: requete.user && requete.user.id_type_utilisateur === 2
    });
});

// Route pour la page d'administration
app.get('/admin', async (requete, reponse) => {
    // Vérifier si l'utilisateur est connecté
    if(!requete.user) {
        return reponse.status(401).end();
    }

    // Vérifier si l'utilisateur est un administrateur
    if(requete.user.id_type_utilisateur !== 2) {
        return reponse.status(403).end();
    }

    // Rendre la page d'administration avec des données spécifiques
    reponse.render('admin', {
        titre: 'Admin',
        styles: ['/css/style.css'],
        scripts: [],
        commande: await getCommande(),
        etatCommande: await getEtatCommande(),
        user: requete.user,
        admin: requete.user && requete.user.id_type_utilisateur === 2
    });
});

// Route de la page du panier
app.get('/panier', async (request, response) => {
    if(!request.user) {
        return response.status(401).end();
    }

    let panier = await getPanier(request.user.id_utilisateur)
    response.render('panier', {
        title: 'Panier',
        produit: panier,
        estVide: panier.length <= 0,
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});

// Route pour ajouter un élément au panier
app.post('/panier', async (request, response) => {
    if (request.user ==  null) {
        return response.sendStatus(401).end();
    }
    if (validateId(request.body.idProduit)) {
        addToPanier(request.body.idProduit, 1, request.user.id_utilisateur); 
        response.sendStatus(201);
    }
    else {
        response.sendStatus(400);
    }
});

// Route pour supprimer un élément du panier
app.patch('/panier', async (request, response) => {
    if (request.user ==  null) {
        return response.sendStatus(401).end();
    }
    if (validateId(request.body.idProduit)) {
        removeFromPanier(request.body.idProduit);
        response.sendStatus(200);
    }
    else {
        response.sendStatus(400);
    }
});

// Route pour vider le panier
app.delete('/panier', async (request, response) => {
    emptyPanier();
    response.sendStatus(200);
});

// Route de la page des commandes
app.get('/commande', async (request, response) => {
    if(!request.user) {
        return response.status(401).end();
    }
    
    response.render('commande', {
        title: 'Commandes',
        commande: await getCommandeOfUser(request.user.id_utilisateur),
        etatCommande: await getEtatCommande(),
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});

// Route pour soumettre le panier
app.post('/commande', async (request, response) => {
    if (await validatePanier(request.user.id_utilisateur)) {
        try {
            let id = await soumettreCommande(); 
            response.sendStatus(201);
            response.pushJson({ 
                id: id,
                texte: request.body
            }, 'add-commande');
            response.status(201).json({ id: id });
        }
        catch(erreur) {
            response.status(500).end();
        }
    }
    else {
        response.sendStatus(400);
    }
});

// Route pour modifier l'état d'une commande
app.patch('/commande', async (request, response) => {
    if (validateId(request.body.idCommande) &&
        validateId(request.body.idEtatCommande)) {
        modifyEtatCommande(
            request.body.idCommande,
            request.body.idEtatCommande
        );
        response.sendStatus(200);
    }
    else {
        response.sendStatus(400);
    }
});

app.post('/api/inscription', async (request, response, next) => {

    if(isCourrielValid(request.body.courriel) && 
       isMotDePasseValid(request.body.motDePasse)) {
        try {
            await addUtilisateur(
                request.body.courriel, 
                request.body.motDePasse,
                request.body.prenom,
                request.body.nom
            );

            response.status(201).end();
        }
        catch(erreur) {
            if(erreur.code === 'SQLITE_CONSTRAINT') {
                response.status(409).end();
            }
            else {
                next(erreur);
            }
        }
    }
    else {
        response.status(400).end();
    }
});

app.post('/api/connexion', (request, response, next) => {
    // On vérifie le le courriel et le mot de passe
    // envoyé sont valides
    if (isCourrielValid(request.body.courriel) &&
        isMotDePasseValid(request.body.motDePasse)) {
        // On lance l'authentification avec passport.js
        passport.authenticate('local', (erreur, utilisateur, info) => {
            if (erreur) {
                // S'il y a une erreur, on la passe
                // au serveur
                next(erreur);
            }
            else if (!utilisateur) {
                // Si la connexion échoue, on envoit
                // l'information au client avec un code
                // 401 (Unauthorized)
                response.status(401).json(info);
            }
            else {
                // Si tout fonctionne, on ajoute
                // l'utilisateur dans la session et
                // on retourne un code 200 (OK)
                request.logIn(utilisateur, (erreur) => {
                    if (erreur) {
                        next(erreur);
                    }

                    response.status(200).end();
                });
            }
        })(request, response, next);
    }
    else {
        response.status(400).end();
    }
});

app.post('/api/deconnexion', (request, response, next) => {
    // Déconnecter l'utilisateur
    request.logOut((erreur) => {
        if(erreur) {
            next(erreur);
        }

        // Rediriger l'utilisateur vers une autre page
        response.redirect('/');
    });
});

app.get('/api/stream', (request, response) => {
    response.initStream();
});

// Renvoyer une erreur 404 pour les routes non définies
app.use(function (request, response) {
    // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
    response.status(404).send(request.originalUrl + ' not found.');
});

// Lancer le serveur
if(process.env.NODE_ENV === 'development') {
    let credentials = {
        key: await readFile('./security/localhost.key'),
        cert: await readFile('./security/localhost.cert')
    }

    https.createServer(credentials, app).listen(process.env.PORT);
    console.log('Serveur démarré: https://localhost:' + process.env.PORT);
}
else {
    app.listen(process.env.PORT);
    console.log('Serveur démarré: http://localhost:' + process.env.PORT);
}
