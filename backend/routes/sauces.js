const express = require('express');
const router = express.Router();

const saucesCtrl = require('../controllers/sauces');
const likesCtrl = require('../controllers/likes');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


//Créer et modifier des sauces
router.get('/',auth, saucesCtrl.getAllSauces);
router.post('/',auth, multer, saucesCtrl.createSauce);
router.get('/:id',auth, saucesCtrl.getOneSauce);
router.put('/:id',auth, multer, saucesCtrl.modifySauce);
router.delete('/:id',auth, saucesCtrl.deleteSauce);

//Ajouter et supprimer des sauces
router.post('/:id/like',auth, likesCtrl.addLikeOrDislike);

module.exports = router;