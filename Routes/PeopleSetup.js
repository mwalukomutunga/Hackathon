const express = require("express");
const People = express.Router();
const Joi = require("joi");
var sql = require("mssql");
const config = require("./database");

People.post("/", (req, res) => {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    eyecolor: Joi.string().required(),
    BirthYear: Joi.string().required()
  });
  const result = Joi.validate(req.body, schema);
  if (!result.error) {
    const pool = new sql.ConnectionPool(config);
    pool.connect(error => {
      if (error) {
        res.json({ success: false, message: error.message });
      }
      new sql.Request(pool)

        .input("name", sql.VarChar, req.body.name)
        .input("eyecolor", sql.VarChar, req.body.eyecolor)
        .input("BirthYear", sql.VarChar, req.body.BirthYear)

        .execute("spSavePeople", (err, result) => {
          if (err) {
            res.json({ success: false, message: err.message });
          } else {
            res.json({ success: true, message: "saved" });
          }
        });
    });
  } else {
    res.json({ success: false, message: result.error.details[0].message });
  }
});

module.exports = People;
