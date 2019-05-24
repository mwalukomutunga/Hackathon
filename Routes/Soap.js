var { soap } = require("strong-soap");
const express = require("express");
const SoapEndpoint = express.Router();
var sql = require("mssql");
const config = require("./database");

var url = "http://www.dneonline.com/calculator.asmx?WSDL";

// Hardcoded request
var AddArgs = {
  intA: 5,
  intB: 8
};

var DivideArgs = {
  intA: 17,
  intB: 3
};
var MultiplyArgs = {
  intA: 1999999999999999999999999,
  intB: 3
};
var SubtractArgs = {
  intA: 21,
  intB: 13
};
//this route adds two integers and save into sql table
SoapEndpoint.get("/add", (req, res) => {
  soap.createClient(url, {}, (_, client) =>
    client.Add(
      AddArgs,
      (_, result) => {
        var results = result;
        //console.log(results);
        //seve to db

        const pool = new sql.ConnectionPool(config);
        pool.connect(error => {
          if (error) {
            res.json({
              success: false,
              message: error.message
            });
          }
          new sql.Request(pool)
            .input("Results", sql.Float, results.AddResult)
            .input("Action", sql.VarChar, "ADD")

            .execute("spsavesoapEndpointResults", (err, result) => {
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

        // end save to db
      }
      //save resulsts to db here
    )
  );
});

SoapEndpoint.get("/divide", (req, res) => {
  soap.createClient(url, {}, (_, client) =>
    client.Divide(
      DivideArgs,
      (_, result) => {
        var results = result;
        // console.log(results);
        //seve to db

        const pool = new sql.ConnectionPool(config);
        pool.connect(error => {
          if (error) {
            res.json({
              success: false,
              message: error.message
            });
          }
          new sql.Request(pool)
            .input("Results", sql.Float, results.DivideResult)
            .input("Action", sql.VarChar, "DIVIDE")

            .execute("spsavesoapEndpointResults", (err, result) => {
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

        // end save to db
      }
      //save resulsts to db here
    )
  );
});

SoapEndpoint.get("/multiply", (req, res) => {
  soap.createClient(url, {}, (_, client) =>
    client.Multiply(
      MultiplyArgs,
      (_, result) => {
        var results = result;
        // console.log(result);
        //seve to db

        const pool = new sql.ConnectionPool(config);
        pool.connect(error => {
          if (error) {
            res.json({
              success: false,
              message: error.message
            });
          }

          new sql.Request(pool)
            .input("Results", sql.Float, results.MultiplyResult)
            .input("Action", sql.VarChar, "Multiply")

            .execute("spsavesoapEndpointResults", (err, result) => {
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

        // end save to db
      }
      //save resulsts to db here
    )
  );
});

SoapEndpoint.get("/Subtract", (req, res) => {
  soap.createClient(url, {}, (_, client) =>
    client.Subtract(SubtractArgs, (_, result) => {
      var results = result;

      const pool = new sql.ConnectionPool(config);
      pool.connect(error => {
        if (error) {
          res.json({
            success: false,
            message: error.message
          });
        }
        new sql.Request(pool)
          .input("Results", sql.Float, results.SubtractResult)
          .input("Action", sql.VarChar, "Subtract")

          .execute("spsavesoapEndpointResults", (err, result) => {
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
    })
  );
});
module.exports = SoapEndpoint;

// http://localhost:5000/api/SoapEndpoint/add
// 2.subtract
// http://localhost:5000/api/SoapEndpoint/Subtract
// 3.devide
// http://localhost:5000/api/SoapEndpoint/divide
// 4.multiply
// http://localhost:5000/api/SoapEndpoint/multiply
