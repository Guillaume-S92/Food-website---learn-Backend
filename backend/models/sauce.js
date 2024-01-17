const mongoose = require("mongoose");
// Ajout du plugin "history" pour mongoose
const diffHistory = require('mongoose-diff-history/diffHistory');

const sauceSchema = mongoose.Schema({
  //Implémentation des types de données attendus 
  //id: { type: String, required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: [{ type: String }],
  usersDisliked: [{ type: String }],
});

//Utilisation de mongoose history pour créer des logs dans la base de données 
sauceSchema.plugin(diffHistory.plugin);


module.exports = mongoose.model("Sauce", sauceSchema);
