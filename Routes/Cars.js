const express = require("express");
const Vehicles = express.Router();
const Joi = require("joi");
var sql = require("mssql");
const config = require("./database");

Vehicles.get("/", (req, res) => {
  const pool = new sql.ConnectionPool(config);
  pool.connect(error => {
    if (error) {
      res.json({ success: false, essage: error.message });
    } else {
      new sql.Request(pool)

        .input("UserID", sql.VarChar, res.locals.user)
        .input("Terminus", sql.VarChar, req.ip)
        .execute("spSelectAllVehicles", (err, result) => {
          if (err) {
            res.json({ success: false, message: err.message });
          } else {
            res.status(200).json(result.recordset);
          }
        });
    }
  });
})
  .get("/coloblue", (req, res) => {
    const pool = new sql.ConnectionPool(config);
    pool.connect(error => {
      if (error) {
        res.json({ success: false, essage: error.message });
      } else {
        new sql.Request(pool)
          .input("UserID", sql.VarChar, res.locals.user)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spSelectAllVehiclescolorblue", (err, result) => {
            if (err) {
              res.json({ success: false, message: err.message });
            } else {
              res.status(200).json(result.recordset);
            }
          });
      }
    });
  })
  .post("/", (req, res) => {
    // if (
    //   !(
    //     req.body.Color === "blue" ||
    //     req.body.Color === "red" ||
    //     req.body.Color === "white" ||
    //     req.body.Color === "yellow" ||
    //     req.body.Color === "green"
    //   )
    // ) {
    //   res
    //     .status(401)
    //     .json(
    //       JSON.parse("the colors has to be blue,red,white,yellow or green")
    //     );
    // }
    const schema = Joi.object().keys({
      RegNo: Joi.any().allow(["blue", "red", "white", "yellow", "green"]),
      CarMake: Joi.string().required(),
      Color: Joi.string().required(),
      YearOfManufuctring: Joi.string().required(),
      CarType: Joi.string().required(),
      Availability: Joi.boolean()
    });

    const result = Joi.validate(req.body, schema);
    if (!result.error) {
      const pool = new sql.ConnectionPool(config);
      pool.connect(error => {
        if (error) {
          res.json({ success: false, message: error.message });
        }
        new sql.Request(pool)
          .input("RegNo", sql.VarChar, req.body.RegNo)
          .input("CarMake", sql.VarChar, req.body.CarMake)
          .input("Color", sql.VarChar, req.body.Color)
          .input("YearOfManufuctring", sql.VarChar, req.body.YearOfManufuctring)
          .input("CarType", sql.VarChar, req.body.CarType)
          .input("Availability", sql.Bit, req.body.Availability)
          .input("UserID", sql.VarChar, res.locals.user)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spSaveVehicles", (err, result) => {
            if (err) {
              res.status(404).json({ success: false, message: err.message });
            } else {
              res.status(201).json({ success: true, message: "saved" });
            }
          });
      });
    } else {
      res.json({ success: false, message: result.error.details[0].message });
    }
  })
  .delete("/:RegNo", (req, res) => {
    const RegNo = req.params.RegNo;
    const pool = new sql.ConnectionPool(config);
    pool.connect(error => {
      if (error) {
        res.json({ success: false, message: error.message });
      } else {
        new sql.Request(pool)
          .input("RegNo", sql.VarChar, RegNo)
          .input("UserID", sql.VarChar, res.locals.user)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spDeleteVehicles", (err, result) => {
            if (err) {
              res.status(401).json({ success: false, message: err.message });
            } else {
              res.status(201).json({ success: true, message: "deleted" });
            }
          });
      }
    });
  })
  .get("/:RegNo", (req, res) => {
    const RegNo = req.params.RegNo;
    const pool = new sql.ConnectionPool(config);
    pool.connect(error => {
      if (error) {
        res.json({ success: false, message: error.message });
      } else {
        new sql.Request(pool)
          .input("RegNo", sql.VarChar, RegNo)
          .input("UserID", sql.VarChar, res.locals.user)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spSelectVehicles", (err, result) => {
            if (err) {
              res.status(404).json({ success: false, message: err.message });
            } else {
              res.status(200).send(result.recordset);
            }
          });
      }
    });
  })
  .get("/:make/:color", (req, res) => {
    const make = req.params.make;
    const color = req.params.color;
    const pool = new sql.ConnectionPool(config);
    pool.connect(error => {
      if (error) {
        res.json({ success: false, message: error.message });
      } else {
        new sql.Request(pool)
          .input("make", sql.VarChar, make)
          .input("Color", sql.VarChar, color)
          .input("UserID", sql.VarChar, res.locals.user)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spSelectAllVehiclesbymakeandcolor", (err, result) => {
            if (err) {
              res.status(404).json({ success: false, message: err.message });
            } else {
              res.status(200).send(result.recordset);
            }
          });
      }
    });
  })
  .put("/:regNo", (req, res) => {
    const schema = Joi.object().keys({
      Color: Joi.string().required(),
      Availability: Joi.boolean().required()
    });
    const result = Joi.validate(req.body, schema);
    if (!result.error) {
      const pool = new sql.ConnectionPool(config);
      pool.connect(error => {
        if (error) {
          res.json({ success: false, message: error.message });
        }
        new sql.Request(pool)

          .input("RegNo", sql.VarChar, req.params.regNo)
          .input("Color", sql.VarChar, req.body.Color)
          .input("Availability", sql.Bit, req.body.Availability)
          .input("UserID", sql.VarChar, res.locals.user)
          .input("Terminus", sql.VarChar, req.ip)
          .execute("spupdateVehicles", (err, result) => {
            if (err) {
              res.status(404).json({ success: false, message: err.message });
            } else {
              res.status(201).json({
                success: true,
                message: "record updated successfully"
              });
            }
          });
      });
    } else {
      res.json({ success: false, message: result.error.details[0].message });
    }
  });
module.exports = Vehicles;
