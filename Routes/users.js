const express = require("express");
const User = express.Router();
var sql = require("mssql");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const config = require("./database");

User.get("/", (req, res) => {
  const pool = new sql.ConnectionPool(config);
  pool.connect(error => {
    if (error) {
      res.json({
        success: false,
        message: error.message
      });
    } else {
      const request = new sql.Request(pool);
      request.input("UserID", sql.VarChar, res.locals.user);
      request.input("Terminus", sql.VarChar, req.ip[0]);
      request.execute("spSelectAllUsers", (err, result) => {
        if (err) {
          res.json({
            success: false,
            message: err.message
          });
        } else res.status(200).json(result.recordset);
      });
    }
  });
})
  .post("/", (req, res) => {
    const schema = Joi.object().keys({
      UserName: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      FullNames: Joi.string()
        .min(3)
        .required(),
      Password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
      ConfirmPassword: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .equal(req.body.Password),
      Telephone: Joi.number()
        .integer()
        .required(),
      ExpiryDate: Joi.date().required(),
      IsActive: Joi.bool().required(),
      Email: Joi.string().email({
        minDomainAtoms: 2
      })
    });

    const result = Joi.validate(req.body, schema);
    if (!result.error) {
      bcrypt.hash(req.body.Password, 10, function(err, hash) {
        if (err) {
          return res.json({
            success: false,
            message: "failed to bcyrpt the password"
          });
        } else {
          const pool = new sql.ConnectionPool(config);
          pool.connect(error => {
            if (error) {
              res.json({
                success: false,
                message: error.message
              });
            }
            new sql.Request(pool)
              .input("UserName", sql.VarChar, req.body.UserName)
              .input("FullNames", sql.VarChar, req.body.FullNames)
              .input("Password", sql.VarChar, hash)
              .input("ConfirmPassword", sql.VarChar, hash)
              .input("Email", sql.VarChar, req.body.Email)
              .input("Telephone", sql.VarChar, req.body.Telephone)
              .input("ExpiryDate", sql.Date, req.body.ExpiryDate)
              .input("IsActive", sql.Bit, req.body.IsActive)
              .input("UserID", sql.VarChar, res.locals.user)
              .input("Terminus", sql.VarChar, req.ip)
              .execute("spSaveUsers", (err, result) => {
                if (err) {
                  res.json({
                    success: false,
                    message: err.message
                  });
                } else {
                  res.json({
                    success: true,
                    message: "saved"
                  });
                }
              });
          });
        }
      });
    } else {
      res.json({
        success: false,
        message: result.error.details[0].message
      });
    }
  })
  .delete("/:username", (req, res) => {
    const username = req.params.username;
    const pool = new sql.ConnectionPool(config);
    pool.connect(error => {
      if (error) {
        res.json({
          success: false,
          message: error.message
        });
      } else {
        new sql.Request(pool)
          .input("UserName", sql.VarChar, username)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spDeleteUsers", (err, result) => {
            if (err) {
              res.json({
                success: false,
                message: err.message
              });
            } else {
              res.json({
                success: true,
                message: "deleted"
              });
            }
          });
      }
    });
  })
  .get("/:username", (req, res) => {
    const username = req.params.username;
    const pool = new sql.ConnectionPool(config);
    pool.connect(error => {
      if (error) {
        res.json({
          success: false,
          message: error.message
        });
      } else {
        new sql.Request(pool)
          .input("UserName", sql.VarChar, username)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spSelectUsers", (err, result) => {
            if (err) {
              res.json({
                success: false,
                message: err.message
              });
            } else {
              res.status(200).send(result.recordset);
            }
          });
      }
    });
  });

module.exports = User;
