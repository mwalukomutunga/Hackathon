const express = require("express");
const router = express.Router();
var sql = require("mssql");
const config = require("./database");
var jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");

function validateToken(req, res, next) {
  var token = req.headers["x-access-token"];
  if (token) {
    jwt.verify(token, "steve", function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        res.locals.user = decoded.data;

        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
}

//
router.post("/", function(req, res) {
  const schema = Joi.object().keys({
    username: Joi.string()
      .min(3)
      .max(50)
      .required(),
    password: Joi.string().required()
  });

  Joi.validate(req.body, schema, function(err, value) {
    if (!err) {
      const pool = new sql.ConnectionPool(config);
      pool.connect(error => {
        if (error) {
          res.json({
            success: false,
            message: error.message
          });
        } else {
          const request = new sql.Request(pool);
          request.input("UserName", sql.VarChar, req.body.username);
          request.execute("spValidateUser", (error, result) => {
            if (error) {
              res.json({
                success: false,
                message: error.message
              });
            } else {
              if (result.recordset.length > 0) {
                let user = result.recordset[0].UserName;
                let Password = result.recordset[0].Password;

                bcrypt.compare(req.body.password, Password, function(
                  err,
                  data
                ) {
                  if (data) {
                    var token = jwt.sign(
                      {
                        exp: Math.floor(Date.now() / 1000) + 60 * 60,
                        data: user
                      },
                      "steve"
                    );
                    res.json({
                      success: true,
                      message: "Enjoy your token!",
                      token: token,
                      userdata: result.recordset
                    });
                  } else {
                    // if (err) {
                    res.status(404).json({
                      success: false,
                      message: "Wrong password. Please try again"
                    });
                  }
                });
              } else {
                res.status(404).json({
                  success: false,
                  message: "Sorry, user does not exist."
                });
              }
            }
          });
        }
      });
    } else {
      res.json({
        success: false,
        message: err.details[0].message
      });
    }
  });
});

module.exports = {
  validateToken,
  router
};
