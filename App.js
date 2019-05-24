const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const auth = require("./Routes/Auth");
const UserRoute = require("./Routes/users");
const CarsRoute = require("./Routes/Cars");
const SoapEndpoint = require("./Routes/Soap");
const People = require("./Routes/People");
const PeopleSetup = require("./Routes/PeopleSetup");
const PeopleAttributes = require("./Routes/PoeopleAttributes");
//const TwoSum = require("./Routes/TwoSum");
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

app.use(function(req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});

app.get("/", (req, res) =>
  res
    .status(200)
    .json(
      "Welcome to our master Api, proceed to route /api to access our resources"
    )
);
app.get("/api", (req, res) =>
  res.status(200).json("To access our resources proceed to /api/{resource}")
);
app.use("/api/SoapEndpoint", SoapEndpoint);
app.use("/api/people", People.RequestPeople);
app.use("/api/savepeople", PeopleSetup);
app.use("/api/peopleattributes", PeopleAttributes);
app.use("/api/login", auth.router);
app.use(auth.validateToken);
app.use("/api/users", UserRoute);
app.use("/api/cars", CarsRoute);
//end of app use routes
app.use((req, res, next) => {
  const error = new Error("resource not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
