const express = require("express");
const route = express.Router();

route.use("/users", require("./users"));
route.use("/login", require("./login"));

module.exports = route;
