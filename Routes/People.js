const express = require("express");
const People = express();
const fs = require("fs");
var sql = require("mssql");
const config = require("./database");

var request = require("request");
url = "https://swapi.co/api/people/1";

function RequestPeople(req, res, next) {
  request(
    {
      url: url
    },
    function(error, response, body) {
      let People = JSON.parse(body).results;
      People.forEach(v => {
        const pool = new sql.ConnectionPool(config);
        pool.connect(error => {
          if (error) {
            res.json({ success: false, message: error.message });
          }
          new sql.Request(pool)
            .input("name", sql.VarChar, v.name)
            .input("eyecolor", sql.VarChar, v.eye_color)
            .input("BirthYear", sql.VarChar, v.birth_year)
            .execute("spSavePeople", (err, result) => {
              if (err) {
                res.json({ success: false, message: err.message });
              } else {
                const pool = new sql.ConnectionPool(config);
                pool.connect(error => {
                  if (error) {
                    res.json({ success: false, message: error.message });
                  }
                  new sql.Request(pool)

                    .input("name", sql.VarChar, v.name)
                    .input("height", sql.VarChar, v.height)
                    .input("gender", sql.VarChar, v.gender)
                    .execute("spSavePeopleAttributes", (err, result) => {
                      if (err) {
                        res.json({ success: false, message: err.message });
                      } else {
                        res.json({ success: true, message: "saved" });
                      }
                    });
                });
              }
            });
        });
      });
    }
  );
}
module.exports = { RequestPeople };
