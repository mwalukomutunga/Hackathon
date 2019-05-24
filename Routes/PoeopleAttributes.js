const express = require("express");
const PeopleAttributes = express.Router();
const Joi = require("joi");
var sql = require("mssql");
const config = require("./database");

PeopleAttributes.post("/", (req, res) => {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    height: Joi.string().required(),
    gender: Joi.string().required()
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
        .input("height", sql.VarChar, req.body.height)
        .input("gender", sql.VarChar, req.body.gender)
        .execute("spSavePeopleAttributes", (err, result) => {
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
module.exports = PeopleAttributes;
