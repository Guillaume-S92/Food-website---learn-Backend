const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Sauce = require("./models/sauce");
const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");
const path = require("path");
// Ajout du fichier configuraton
const config = require('./config');
// Rajout de mongoose-morgane pour la connexion à mongoDB
const mongooseMorgan = require("mongoose-morgan");
// Data Sanitization against XSS
const xss = require('xss-clean');
// Ajout de middleware pour prévenir du piratage
const helmet = require('helmet');
// protection des données contre les attaques par injection NoSQL
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
// Helmet
app.use(helmet());


// connexion to mongoDB
mongoose
  .connect(
    "mongodb+srv://project_6:Guillaume@atlascluster.ouvgbl1.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Ajout de CORS dans le headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

// protection des données contre les attaques par injection NoSQL
app.use(mongoSanitize());

// Prévenir les attaques DOS
app.use(express.json({ limit: '10kb' })); // La limite du body est de 10 Ko
//
// protection des données contre les attaques XSS
app.use(xss());

// Ajout de logs avec mongoose-morgan
// logs personnalisés => N'enregistrer que les demandes ayant une valeur inférieure à 400
mongooseMorgan.token('body', (req, res) => JSON.stringify(req.body));
mongooseMorgan.token('req', (req, res) => JSON.stringify(req.headers.authorization));
app.use(
  mongooseMorgan({
    connectionString:
      "mongodb+srv://project_6:Guillaume@atlascluster.ouvgbl1.mongodb.net/?retryWrites=true&w=majority",
  }, {skip: function (req, res) { return res.statusCode < 400 }}, 'date:date status::status method::method url::url body::body remote-addr::remote-addr referrer::referrer'
  )
);
//


app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", saucesRoutes);

module.exports = app;
