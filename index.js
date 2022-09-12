const path = require("path");
const express = require("express");
const fetchFromGithubGraphql = require("./controllers/get-repos");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile("index.html");
});

app.post("/", (_request, response) => {
  fetchFromGithubGraphql()
    .then((r) => {
      response.send(r.data.data);
    })
    .catch(() => {
      response.send({});
    });
});
app.listen(process.env.PORT || 3000);
module.exports = app;
