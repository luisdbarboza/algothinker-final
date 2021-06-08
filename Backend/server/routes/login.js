const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const currentRoute = express.Router();

const { pool: dbPool } = require("../database/db");
const { respondWithErrorMessage } = require("../utilities/utilities");

currentRoute.post("/", async (req, res) => {
  const { email, password } = req.body;
  const customError = "Error, email o password invalidos";
  console.log(email);
  try {
    const sqlQuery = `SELECT nombre, email, foto_perfil, password FROM usuarios WHERE email = $1`;
    let params = [email];
    let results = await dbPool.query(sqlQuery, params);
    const user = results.rows[0];
    console.log(user);

    const arePasswordsEquivalent = await bcrypt.compare(
      password,
      user.password
    );

    if (!arePasswordsEquivalent) {
      throw new Error(customError);
    }

    delete user.password;

    const token = jwt.sign(
      {
        user,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "365d",
      }
    );

    res.json({
      ok: true,
      user,
      token,
    });
  } catch (err) {
    console.log(err);
    respondWithErrorMessage(res, err, 500);
  }
});

module.exports = currentRoute;
