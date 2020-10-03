const express = require("express");
const morgan = require("morgan");

const PORT = 5678;

var app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(require("./routes"));
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(__dirname + "/"));

const server = app.listen(PORT, function () {
  console.info("🌍 Listening on port " + server.address().port);
});
