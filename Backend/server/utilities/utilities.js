const util = require("util");
const fs = require("fs");
const unlink = util.promisify(fs.unlink);

const respondWithErrorMessage = (res, err, statusCode = 500) => {
  return res.status(statusCode).json({
    ok: false,
    err,
  });
};

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.exists(filePath, async (exist) => {
      if (exist) {
        await unlink(filePath);
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
};

const checkFileValidation = (req, res, acceptedTypes) => {
  if (req.fileValidationErrors) {
    const customError = {
      message:
        "Solo se aceptan archivos de los siguientes formatos " +
        acceptedTypes.toString(),
    };

    respondWithErrorMessage(res, customError, 400);

    return false;
  }

  return true;
};

const updateTableById = (id, table, columns) => {
  // Establece el inicio de la consulta
  var query = [`UPDATE ${table}`];
  query.push("SET");

  // crea otro array almacenando cada comando set
  // y asignando un valor numerico para consultas parametrizadas
  let set = [];
  Object.keys(columns).forEach((key, i) => {
    set.push(key + " = ($" + (i + 1) + ")");
  });
  query.push(set.join(", "));

  // Add the WHERE statement to look up by id
  query.push(`WHERE id = ${id}`);

  //Crea otro array para regresar las columnas actualizadas
  set = [];
  Object.keys(columns).forEach((key, i) => {
    set.push(key);
  });
  query.push(`RETURNING ${set.join(", ")}`);

  // Return a complete query string
  return query.join(" ");
};

module.exports = {
  respondWithErrorMessage,
  deleteFile,
  checkFileValidation,
  updateTableById,
};
