require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const cors = require("cors");
const bodyParser = require("body-parser");
const { isValidUrl } = require("./src/utils");

const { Shortener } = require("./src/mongoose");

// -------------
//  Middlewares
// -------------
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

// -----
//  GET
// -----
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const { short_url } = req.params;

  if (!short_url) return res.json({ error: "Invalid shortener" });

  Shortener.findOne({ short_url: short_url })
    .then((q) => {
      if (!q) return res.json({ error: "Invalid shortener" });

      return res.redirect(301, q.original_url);
    })
    .catch((e) => console.error(e));
});

// ------
//  POST
// ------
app.post("/api/shorturl", function (req, res) {
  const { url } = req.body;

  // 1. Validar la URL
  if (!isValidUrl(url)) {
    return res.json({ error: "Invalid URL" });
  }

  // 2. Comprobar si existe, si existe lo retorno
  Shortener.findOne({ original_url: url })
    .then((q) => {
      if (q) return res.json({ original_url: q.original_url, short_url: q.short_url });

      // 3. Contar la cantidad de documentos de la colección para obtener el número de short
      Shortener.countDocuments()
        .then((counter) => {
          // 4. Guardar nueva url
          const short_url = counter + 1;

          const newShortener = new Shortener({ original_url: url, short_url: short_url });

          return newShortener.save();
        })
        .then((q) => {
          return res.json({ original_url: q.original_url, short_url: q.short_url });
        })
        .catch((e) => {
          console.error(e);
          res.json({ error: "Error save database" });
        });
    })
    .catch((e) => {
      console.error(e);
      res.json({ error: "Error find database" });
    });
});

// --------
//  LISTEN
// --------
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
