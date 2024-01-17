// app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require('./config');
const Sauce = require("./models/sauce");
const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");
const path = require("path");
const mongooseMorgan = require("mongoose-morgan");
const xss = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
app.use(helmet());

// Connexion à MongoDB en utilisant les informations de configuration
mongoose
  .connect(
    config.mongoURI,
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

// Protection des données contre les attaques par injection NoSQL
app.use(mongoSanitize());

// Prévention des attaques DOS
app.use(express.json({ limit: '10kb' })); // La limite du body est de 10 Ko

// Protection des données contre les attaques XSS
app.use(xss());

// Ajout de logs avec mongoose-morgan
mongooseMorgan.token('body', (req, res) => JSON.stringify(req.body));
mongooseMorgan.token('req', (req, res) => JSON.stringify(req.headers.authorization));
app.use(
  mongooseMorgan({
    connectionString: config.mongoURI,
  }, { skip: function (req, res) { return res.statusCode < 400 }}, 'date:date status::status method::method url::url body::body remote-addr::remote-addr referrer::referrer'
  )
);

app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", saucesRoutes);

module.exports = app;
