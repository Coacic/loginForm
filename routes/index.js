let mysql = require("mysql");
var express = require("express");
var router = express.Router();
let path = require("path");
const bodyParser = require("body-parser");
const { count } = require("console");
var passwordHash = require("password-hash");
let struct = ["user", "password"];

router.use(bodyParser.urlencoded({ extended: false }));

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

router.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "../main.html"));
});

router.get("/", (req, res) => {
  // res.send("<h1>Welcome to /</h1>");
  // res.send("Welcome to /")
  res.sendFile(path.join(__dirname, "../index.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

router.get("/loggedin", (req, res) => {
  res.sendFile(path.join(__dirname, "../loggedin.html"));
});

router.get("/errorPage", (req, res) => {
  res.sendFile(path.join(__dirname, "../errorPage.html"));
  setTimeout(() => {
    res.sendFile(path.join(__dirname, "../index.html"));
  }, 3000);
});

router.get("/returnPage", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

router.get("/badUsername", (req, res) => {
  res.send(`<html><head><meta http-equiv="refresh" content="3; url=http://localhost:5500/login/" /></head><body>
  <h1>Bad username, use only letters!</h1>
  </body>
</html>`);
});

router.get("/registered", (req, res) => {
  res.sendFile(path.join(__dirname, "../registered.html"));
});

router.get("/userRegisteredAlready", (req, res) => {
  res.sendFile(path.join(__dirname, "../userRegisteredAlready.html"));
});

router.post("/", async (req, pos) => {
  let user = req.body.username;
  if (!Boolean(user.match(/^[A-Za-z0-9]*$/))) {
    pos.redirect("/badUsername");
    return;
  }
  let pass = req.body.password;
  let submit = req.body.submit;
  console.log(`submit: ${submit}`);
  let retrievedPassowrd;
  let count;
  let date = new Date();
  let dateString =
    date.getFullYear() +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2);
  struct = [user, submit, count, dateString];
  console.log(dateString);

  //'SELECT COUNT(*) from loginform.user u, loginform.passwords p WHERE u.idUser = p.idPassword AND u.username="' +
  // user +
  // '" AND p.password="' +
  // pass +
  // '"'

  switch (submit) {
    case "login":
      let queryPromiseLogin = new Promise((resolve, reject) => {
        con.query(
          `SELECT password as password FROM loginform.users u, loginform.passwords p WHERE u.idUser = p.idPassword AND u.username="` +
            user +
            `"`,
          (err, result, fields) => {
            if (err) throw err;
            retrievedPassowrd = result[0].password;
            resolve();
          }
        );
      });

      let resLogin = await queryPromiseLogin;
      let isIt = passwordHash.verify(pass, retrievedPassowrd);

      console.log(`Username: ${user} Password: ${pass} and ${isIt}`);

      if (isIt == true) pos.redirect("/loggedin");
      else pos.redirect("/errorPage");
      break;

    case "register":
      let generatedPass = passwordHash.generate(pass);
      let queryPromiseRegister = new Promise((resolve, reject) => {
        con.query(
          'SELECT p.password as password FROM loginform.users u, loginform.passwords p WHERE u.idUser = p.idPassword AND u.username="' +
            user +
            '"',
          (err, result, fields) => {
            if (err) throw err;
            if (result[0]) retrievedPassowrd = result[0].password;
            resolve();
          }
        );
      });

      let resRegister = await queryPromiseRegister;
      console.log(retrievedPassowrd);
      if (retrievedPassowrd) {
        pos.redirect("/userRegisteredAlready");
      } else {
        //Count max users
        let QueryPromiseRegisterCountUsers = new Promise((resolve, reject) => {
          con.query(
            "SELECT COUNT(*) as count FROM loginform.users",
            (err, result, fields) => {
              if (err) throw err;
              if (result[0]) count = result[0].count + 1;
              resolve();
            }
          );
        });
        let promiseQueryPromiseRegisterCountUsers =
          await QueryPromiseRegisterCountUsers;

        //Register the user
        let QueryPromiseRegisterUser = new Promise((resolve, reject) => {
          con.query(
            `INSERT INTO loginform.users VALUES(` +
              count +
              `, "` +
              user +
              `", "` +
              dateString +
              `");`,
            (err, result, fields) => {
              if (err) throw err;
              if (result[0]) count = result[0].count;
              resolve();
            }
          );
        });
        //Register the password
        let QueryPromiseRegisterPassword = new Promise((resolve, reject) => {
          con.query(
            `INSERT INTO loginform.passwords VALUES(` +
              count +
              `, "` +
              generatedPass +
              `")`,
            (err, result, fields) => {
              if (err) throw err;
              resolve();
            }
          );
        });
        let promiseQueryPromiseRegisterPassword =
          await QueryPromiseRegisterPassword;
        //Add basic level for the user
        let QueryPromiseRegisterLevel = new Promise((resolve, reject) => {
          con.query(
            `INSERT INTO loginform.levels VALUES(` + count + `, ` + 1 + `)`,
            (err, result, fields) => {
              if (err) throw err;
              resolve();
            }
          );
        });
        let promiseQueryPromiseRegisterLevel = await QueryPromiseRegisterLevel;
        pos.render("registered", {
          user: user,
          date: dateString,
          count: count,
        });
        // pos.redirect("/registered");
      }
      break;

    default:
      pos.redirect("/errorPage");
      break;
  }
});

router.get("*", (req, res) => {
  res.send("<h1>Wrong url :/</h1>");
});

module.exports = struct;
module.exports = router;
