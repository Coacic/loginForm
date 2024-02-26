const app = require("./app");

app.listen(5500, () => {
  console.log("server is listening to port 5500....");
});

app.get("/", function (req, res) {
  res.send(index.html);
  // res.render("index", { list: [], title: "salman" });
  // console.log(res.json);
});

app.get("/about", function (req, res) {
  res.send("About page");
  // res.render("index", { list: [], title: "salman" });
  // console.log(res.json);
});

// userInput = document.getElementsByClassName("username");
// userPassowrd = document.getElementsByClassName("password");
// loginButton = document.getElementsByClassName("login");
// registerButton = document.getElementsByClassName("register");

// loginButton.addEventListener(
//   "click",
//   login(userInput.value, userPassowrd.value)
// );
// registerButton.addEventListener(
//   "click",
//   register(userInput.value, userPassowrd.value)
// );

// function login(username, passowrd) {
//   console.log(username);
// }

// function register(params) {}
