const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  database: "algothinker",
});

const connectToDatabase = async () => {
  try {
    await pool.connect();

    console.log(`CONECTADO A LA BASE DE DATOS`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  pool,
  connectToDatabase,
};
