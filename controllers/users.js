// -const Listing = require("../models/listing");
// -const User = require("../models/users");
// -
// -module.exports.renderSignupForm = (req, res) => {
// -  res.render("./users/signup.ejs");
// -};
// -
// -module.exports.signup = async (req, res) => {
// -  try {
// -    let { username, email, password } = req.body;
// -    const newUser = new User({ username, email });
// -    const registeredUser = await User.register(newUser, password);
// -    // this do for - if user new sign in it directly logined before it after sign up need again login now don't need it.
// -    console.log(registeredUser);
// -    req.login(registeredUser, (err) => {
// -      if (err) {
// -        return next(err);
// -      }
// -      req.flash("success", "Welcome to Wonderlust");
// -      res.redirect("/listings");
// -    });
// -  } catch (e) {
// -    req.flash("error", e.message);
// -    res.redirect("/signup");
// -  }
// -};
// -
// -module.exports.renderLoginForm = (req, res) => {
// -  res.render("users/login.ejs");
// -};
// -
// -module.exports.login = async (req, res) => {
// -  req.flash("success", "Welcome to Wonderlust You are logged in!");
// -  let redirectUrl = res.locals.redirect || "/listings";
// -  res.redirect(redirectUrl);
// -};
// -
// -module.exports.logout = (req, res, next) => {
// -  req.logout((err) => {
// -    if (err) {
// -      return next(err);
// -    }
// -    req.flash("success", "you are logged out!");
// -    res.redirect("/listings");
// -  });
// -};




const Listing = require("../models/listing");
const User = require("../models/users");

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    // this do for  if user new sign in it directly logined before it after sign up need again login now don't need it.
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wonderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Wonderlust You are logged in!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
