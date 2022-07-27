const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
const functions = require("./functions");

// Nombre maximal de tentative de connexion
const MAX_LOGIN_ATTEMPTS = 5;

exports.signup = (req, res, next) => {
  // Méthode du hash pour sécuriser le mail
  let emailHashed = cryptoJS.MD5(req.body.email).toString();
  // Crypter l'e-mail avec crypto-js (la phrase secrète secrète doit être modifiée en production)
  let emailEncrypted = cryptoJS.AES.encrypt(
    req.body.email,
    "Secret Passphrase"
  );
  

  //  Vérification de la sécurité du mot de passe
  if (functions.checkPassword(req.body.password)) {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: emailEncrypted,
          emailHash: emailHashed,
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    return res.status(401).json({ error: "Password trop faible !" });
  }
};

exports.login = (req, res, next) => {
  // Hachez l'email pour le retrouver dans la base de données
  let emailHashed = cryptoJS.MD5(req.body.email).toString();
  //
  User.findOne({ emailHash: emailHashed })
    .then((user) => {
      // Si l'utilisateur n'est pas trouvé, retourne une erreur
      if (!user) {
        return res
          .status(401)
          .json({ error: "Nom d'utilisateur (ou mot de passe) incorrect" });
      }
      // Test pour savoir si le compte est déjà verrouillé
      if (functions.checkIfAccountIsLocked(user.lockUntil)) {
        let waitingTime = (user.lockUntil - Date.now()) / 1000 / 60;
        return res.status(401).json({
          error: "Compte bloqué, revenez dans: " + waitingTime + " minutes",
        });
      }

      // Si lockUntil est terminé => réinitialisation la tentative de connexion
      if (user.lockUntil && user.lockUntil <= Date.now()) {
        // Reset of loginAttempt
        functions
          .resetUserLockAttempt(emailHashed)
          //
          .then(() => {
            bcrypt
              .compare(req.body.password, user.password)
              .then((valid) => {
                // Si le mot de passe est erroné mais que le nombre maximal de tentatives de connexion n'est pas atteint, alors il faut implémenter la tentative de connexion de 1
                if (!valid) {
                  // Implémentation de la valeur pour la tentative de connexion
                  functions
                    .incrementLoginAttempt(emailHashed)
                    .catch((error) => console.log({ error }));
                  return res
                    .status(401)
                    .json({ error: "Mot de passe (ou email) incorrect !" });
                } else {
                  // Utilisateur connecté
                  functions.sendNewToken(user._id, res);
                  //.catch((error) => console.log({ error }));
                }
              })
              .catch((error) => res.status(500).json({ error }));
          })
          .catch((error) => console.log({ error }));
        //
      } else {
        // Si le compte n'a pas été bloqué, continuer
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            // Si c'est un mauvais mot de passe et que la tentative de connexion est atteinte, alors bloquez le compte
            if (!valid && user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
              console.log(
                "Limite d'essai de connection atteinte, blockage du compte"
              );
              functions
                .blockUserAccount(emailHashed)
                .catch((error) => console.log({ error }));
              return res.status(401).json({
                error:
                  "Mot de passe (ou email) incorrect ! Vous avez atteint le nombre maximum d'essai, votre compte est maintenant bloqué!",
              });
            }
            // Si le mot de passe est faux mais que le nombre de tentative de connexion n'a pas été atteint, on implémente le nombre de tentative de connexion à 1
            if (!valid && user.loginAttempts + 1 < MAX_LOGIN_ATTEMPTS) {
              // Implémentation de la valeur pour la tentative de connexion
              functions
                .incrementLoginAttempt(emailHashed)
                .catch((error) => console.log({ error }));
              //
              return res
                .status(401)
                .json({ error: "Mot de passe (ou email) incorrect !" });
            }
            // Si l'utilisateur est connecté mais a une tentative de connexion de 0 : reset try + send token
            if (user.loginAttempts > 0) {
              functions
                .resetUserLockAttempt(emailHashed)
                .then(() => {
                  functions.sendNewToken(user._id, res);
                })
                .catch((error) => console.log({ error }));
            } else {
              // Envoi simplement d'un nouveau token
              functions.sendNewToken(user._id, res);
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
