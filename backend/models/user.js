const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
// Ajout du plugin "history" pour mongoose
const diffHistory = require('mongoose-diff-history/diffHistory');


const userSchema = mongoose.Schema({
  //id: { type: String, required: true },
  email: { type: String, required: true },
  emailHash: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Nouvelles propriétés pour la sécurité
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
  //
  
});

userSchema.plugin(uniqueValidator);

// //Utilisation de mongoose history pour créer des logs dans la base de données 
userSchema.plugin(diffHistory.plugin);

//

module.exports = mongoose.model("User", userSchema);
