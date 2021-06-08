require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectToDatabase } = require("./database/db");
const app = express();

//middlewares nivel raiz
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use(cors());
app.use("/static", express.static(path.join(__dirname, "../public")));

//database connection
connectToDatabase();

//rutas
app.use(require("./routes/index"));

app.listen(8000, () => {
  console.log("Escuchando en el puerto 8000");
});
