const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { pool: dbPool } = require("../database/db");
const {
  respondWithErrorMessage,
  deleteFile,
  checkFileValidation,
  updateTableById,
} = require("../utilities/utilities");

const currentRoute = express.Router();

const uploadFolder = path.join(__dirname, "../uploads/users");
const acceptedTypes = ["image/jpeg", "image/png"];
const saltRounds = 10;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const filenameArray = file.originalname.split(".");
    const extension = filenameArray[filenameArray.length - 1];

    cb(null, file.filename + Date.now() + uuidv4() + "." + extension);
  },
});

const fileFilter = (req, file, cb) => {
  req.fileValidationErrors = false;

  if (acceptedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationErrors = true;
    cb(null, false);
  }
};

const limits = {
  fileSize: 7000000,
};

const upload = multer({ storage, fileFilter, limits });

currentRoute
  .route("/")
  .get(async (req, res) => {
    try {
      const sqlQuery = "SELECT * FROM usuarios";
      const result = await dbPool.query(sqlQuery);
      const users = result.rows;

      res.json({
        ok: true,
        users,
      });
    } catch (err) {
      respondWithErrorMessage(res, err, 500);
    }
  })
  .post(upload.single("fotoPerfil"), async (req, res) => {
    if (req.file) {
      //chequea si el archivo es invalido
      let isValid = checkFileValidation(req, res, acceptedTypes);

      if (!isValid) return;
    }

    try {
      const { nombre, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      let sqlQuery = !req.file
        ? `INSERT INTO usuarios ( nombre, email, password)`
        : `INSERT INTO usuarios ( nombre, email, password, foto_perfil)`;
      sqlQuery += !req.file
        ? `VALUES ($1, $2, $3) RETURNING id`
        : `VALUES ($1, $2, $3, $4) RETURNING id`;
      const values = !req.file
        ? [nombre, email, hashedPassword]
        : [nombre, email, hashedPassword, req.file.filename];

      const result = await dbPool.query(sqlQuery, values);
      const userId = result.rows[0].id;

      res.status(201).json({
        ok: true,
        message: "Usuario registrado",
        idUsuario: userId,
      });
    } catch (err) {
      await deleteFile(req.file.path);
      respondWithErrorMessage(res, err, 500);
    }
  });

currentRoute
  .route("/:id")
  .get(async (req, res) => {
    const customError = "Usuario inexistente";

    try {
      const userId = req.params.id;
      const sqlQuery = `SELECT id, nombre, email, foto_perfil FROM usuarios WHERE id=$1`;
      const values = [userId];
      const result = await dbPool.query(sqlQuery, values);

      if (result.rowCount === 1) {
        res.json({
          ok: true,
          user: result.rows[0],
        });
      } else {
        throw new Error(customError);
      }
    } catch (err) {
      if (err.message != customError) respondWithErrorMessage(res, err, 500);
      else {
        respondWithErrorMessage(res, customError, 400);
      }
    }
  })
  .put(upload.single("fotoPerfil"), async (req, res) => {
    if (req.file) {
      //chequea si el archivo es invalido
      let isValid = checkFileValidation(req, res, acceptedTypes);

      if (!isValid) return;

      req.body.foto_perfil = req.file.filename;
    }

    const customError = "Usuario inexistente";

    try {
      let sqlQuery;
      let result;
      let values;
      const userId = req.params.id;

      if (req.file) {
        //borra su foto de perfil vieja del sistema de archivos
        let oldProfilePicturePath;

        sqlQuery = "SELECT foto_perfil FROM usuarios WHERE id = $1";
        values = [userId];

        result = await dbPool.query(sqlQuery, values);

        oldProfilePicturePath = result.rows[0].foto_perfil;

        oldProfilePicturePath =
          path.join(__dirname, "../uploads/users") +
          "/" +
          oldProfilePicturePath;

        await deleteFile(oldProfilePicturePath);
      }

      sqlQuery = updateTableById(userId, "usuarios", req.body);

      values = Object.keys(req.body).map((key) => req.body[key]);

      result = await dbPool.query(sqlQuery, values);

      if (result.rowCount === 1) {
        res.json({
          ok: true,
          user: result.rows[0],
        });
      } else {
        throw new Error(customError);
      }
    } catch (err) {
      if (err.message != customError) respondWithErrorMessage(res, err, 500);
      else {
        respondWithErrorMessage(res, customError, 400);
      }
    }
  })
  .delete(async (req, res) => {
    try {
      const userId = req.params.id;
      const sqlQuery = `DELETE FROM usuarios WHERE id=$1 RETURNING foto_perfil`;
      const values = [userId];
      const result = await dbPool.query(sqlQuery, values);
      const profilePictureFilename = result.rows[0].foto_perfil;

      if (profilePictureFilename !== "") {
        const profilePicturePath = `${uploadFolder}/${profilePictureFilename}`;

        await deleteFile(profilePicturePath);
      }

      if (result.rowCount === 1) {
        res.json({
          ok: true,
          message: "Usuario borrado",
        });
      } else {
        throw new Error("Usuario inexistente");
      }
    } catch (err) {
      if (err.message != "Usuario inexistente")
        respondWithErrorMessage(res, err, 500);
      else {
        const customError = { message: err.message };
        respondWithErrorMessage(res, customError, 400);
      }
    }
  });

module.exports = currentRoute;
