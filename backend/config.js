const user = require("./models/user");


// config.js
module.exports = {
    mongoURI: "mongodb+srv://user:password@cluster0.pfjuogp.mongodb.net/test",
    secretKey: "votre_clé_secrète_pour_les_jwt" // Assurez-vous de générer une clé sécurisée pour les tokens JWT
}
