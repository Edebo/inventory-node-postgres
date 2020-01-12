const express = require("express");
const { Client } = require("pg");
const mustacheExpress = require("mustache-express");
const app = express();

//template engine setup
const mustache = mustacheExpress();
mustache.cache = null;
app.engine("mustache", mustache);
app.set("view engine", "mustache");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//letting express know our static files are in pubic folder
app.use(express.static("public"));

//database

app.get("/add", (req, res) => {
  res.render("med-form");
});

app.post("/meds/add", async (req, res) => {
  try {
    const { name, count, brand } = req.body;
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "medical",
      port: 5432,
      password: "user"
    });
    await client.connect();
    const sql = "INSERT INTO meds(name,count,brand) VALUES($1,$2,$3)";
    const params = [name, count, brand];

    const result = await client.query(sql, params);

    res.redirect("/meds");
  } catch (err) {
    console.log(err);
  }
});

app.post("/meds/delete/:id", async (req, res) => {
  try {
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "medical",
      port: 5432,
      password: "user"
    });
    await client.connect();
    const sql = "DELETE FROM meds WHERE mid = $1";
    const params = [req.params.id];

    const result = await client.query(sql, params);

    res.render("/meds-edit", result);
  } catch (err) {
    console.log(err);
  }
});

app.post("/meds/edit/:id", async (req, res) => {
  console.log("i got here");
  const { name, count, brand } = req.body;
  try {
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "medical",
      port: 5432,
      password: "user"
    });
    await client.connect();
    const sql = "UPDATE meds SET name= $2,count=$3,brand=$4 WHERE mid = $1";
    const params = [req.params.id, name, count, brand];

    await client.query(sql, params);
    res.redirect("/meds");
  } catch (err) {
    console.log(err);
  }
});

app.get("/meds/edit/:id", async (req, res) => {
  try {
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "medical",
      port: 5432,
      password: "user"
    });
    await client.connect();
    const sql = "SELECT * FROM meds WHERE mid = $1";
    const params = [req.params.id];

    const result = await client.query(sql, params);

    res.render("meds-edit", { med: result.rows[0] });
  } catch (err) {
    console.log(err);
  }
});

app.get("/meds", async (req, res) => {
  try {
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "medical",
      port: 5432,
      password: "user"
    });
    await client.connect();
    const sql = "SELECT * FROM meds";

    const results = await client.query(sql);

    res.render("meds", results);
  } catch (err) {
    console.log(err);
  }
});
app.get("/dashboard", async (req, res) => {
  try {
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "medical",
      port: 5432,
      password: "user"
    });
    await client.connect();

    const sql1 = "SELECT SUM(count) FROM meds";
    const sql2 = "SELECT DISTINCT count(brand) FROM meds";

    const result1 = await client.query(sql1);
    const result2 = await client.query(sql2);

    res.render("dashboard", {
      n1: result1.rows[0],
      n2: result2.rows[0]
    });
  } catch (err) {
    console.log(err);
  }
});
app.listen(5000, () => {
  console.log(`Server started running on port ${5000}`);
});
