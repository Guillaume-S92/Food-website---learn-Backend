const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const userCtrl = require("../controllers/user");


// Peut être utilisé avec Rate Limit Mongo pour stocker des données
// Limite le nombre de requêtes pour la route de connexion
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
//

// Limiter le nombre de demandes de routes d'inscription
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // fenêtre de 1 heure
  max: 5, // commencer à bloquer après 5 requêtes
  message:
    "Too many accounts created from this IP, please try again after an hour",
});
//
//

router.post("/signup", createAccountLimiter, userCtrl.signup);
router.post("/login", apiLimiter, userCtrl.login);

module.exports = router;
