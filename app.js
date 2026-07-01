if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// Import the Express framework (used to build web apps & APIs)
const express = require("express");

// Create an Express application (your main app/server object)
const app = express();

// Import Mongoose (used to connect and work with MongoDB)
const mongoose = require("mongoose");

// Import Node.js 'path' module (helps manage file & folder paths safely)
const path = require("path");

// Import your Listing model (MongoDB schema for storing listings)
const Listing = require("./models/listing");

// Import method-override (lets you use PUT/DELETE in forms where only GET/POST are supported)
const methodOverride = require("method-override");

// Import ejs-mate (adds support for layouts/partials in EJS templates)
const ejsMate = require("ejs-mate");

// helper func to handle async route errors
const wrapAsync = require("./utils/wrapAsync");

// Import ExpressError class to create errors with a statusCode + message,
const ExpressError = require("./utils/ExpressError.js");

// models/review.js
const Review = require("./models/reviews.js");

// //learn about cookies
// const cookieParser = require("cookie-parser");
// const session = require("express-session");
const flash = require("connect-flash"); // to flash msg

//user authenticaion-authorisation
const User = require("./models/users.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { isLoggedIn } = require("./middleware.js");

//routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ------------------- EJS (Template Engine) Settings ------------------- //

// Set EJS as the default template engine
app.set("view engine", "ejs");

// Serve static files (CSS, JS, images) from the "public" folder
// Example: /public/style.css → accessible at http://localhost:3000/style.css
app.use(express.static(path.join(__dirname, "/public")));

// Serve static files from the root directory (for favicon)
app.use(express.static(path.join(__dirname)));

// Tell Express where your "views" (EJS templates) are located
// __dirname = current project folder
app.set("views", path.join(__dirname, "views"));

// Parse incoming form data (application/x-www-form-urlencoded)
// So you can use req.body to get form inputs
app.use(express.urlencoded({ extended: true }));

// Allow overriding HTTP methods using ?_method=PUT or ?_method=DELETE
// Example: <form method="POST" action="/listings/1?_method=DELETE">
app.use(methodOverride("_method"));

// Use ejs-mate as the template engine for rendering .ejs files
// This allows you to use and partials in your templates
app.engine("ejs", ejsMate);

// app.use(cookieParser("secretcode"));
// app.use(
//   session({ secret: "superString", resave: false, saveUninitialized: true })
// );

//mongoDB connection with js
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
main()
  .then(() => {
    console.log("server connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

//map token
app.use((req, res, next) => {
  res.locals.MAP_TOKEN = process.env.MAP_TOKEN;
  next();
});

// ------------------------ learn about cookies -------------------------------- \\
// A cookie is a small piece of data stored in the user’s browser.
const cookieParser = require("cookie-parser");
// "secretcode" = key used to protect / sign cookies
app.use(cookieParser("thisshouldbeabettersecret"));

//cookies
app.get("/cook", (req, res) => {
  // using res.cookies we set cookies on browser
  res.cookie("sona", "scientist");
  res.cookie("Car", "Toyota");
  res.send("Cookies are seted");
});

// app.get("/", (req, res) => {
//   console.dir(req.cookies); // it parse the seted cookies on terminal
//   res.send("Cookies are parsed");
// });

app.get("/greet", (req, res) => {
  let { name = "anonymous" } = req.cookies;
  res.send(`Hi ${name} to visit`);
});

app.get("/signedCookies", (req, res) => {
  // here cookie is signed using secretcode so that means you cannot temper(change) this cookie
  res.cookie("made-in", "India", { signed: true });
  // when you change values(India) only it shows false -> [Object: null prototype] { 'made-in': false }
  // otherwise it shows [Object: null prototype] { 'made-in': 'India' }
  // and if entire values get change it shows [Object: null prototype] {}
  res.send("Signed");
});

app.get("/verify", (req, res) => {
  console.log(req.signedCookies); // it show signed cookies using req.signedCookies
  res.send("verified");
});

// ------------------------ session -------------------------------- \\
// A session stores user data on the server, and the browser stores only a session id cookie.
const session = require("express-session");

const sessionOptions = {
  secret: "thisshouldbeabettersecret", // replace with a strong secret
  resave: false, // don’t save session if unmodified
  saveUninitialized: true, // don’t create session until something is stored
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 1000 * 60 * 60, // 1 hour
    secure: false, // true if using HTTPS
    httpOnly: true,
  },
};

app.get("/test", (req, res) => {
  res.send("tested");
});

app.use(session(sessionOptions));
app.use(flash());

//passport use here
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // use static authenticate method of model in LocalStrategy
passport.serializeUser(User.serializeUser()); // use static serialize and deserialize of model for passport session support
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//user login
// app.get("/users", async (req, res) => {
//   const userNm = new User({
//     email: "oyo.com",
//     username: "oyo",
//   });
//   let registeredUser = await User.register(userNm, "tavss");
//   res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// session id store in browser in the form of cookie
// app.use(session({ secret: "SonaMe", resave: false, saveUninitialized: true }));

//Express-Session
// app.get("/test", (req, res) => {
//   res.send("tested");
// });

// app.get("/reqcount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send(`You sent a request ${req.session.count} times`);
// });

// app.use((req, res, next) => {
//   res.locals.successMsg = req.flash("success");
//   res.locals.errorMsg = req.flash("error");
//   next();
// });

// app.get("/register", (req, res) => {
//   let { name = "anonymous" } = req.query; // http://localhost:8080/register?name=Tabassum
//   req.session.name = name;
//   if (name === "anonymous") {
//     req.flash("error", "user not registered");
//   } else {
//     req.flash("success", "user registered successfully");
//   }
//   res.redirect("/hello");
// });

// app.get("/hello", (req, res) => {
//   res.render("listings/flash", { name: req.session.name });
// });

// app.get("/", (req, res) => {
//   res.send("working database");
// });

// ------------------- SESSION CONFIG -------------------
// app.use(
//   session({
//     secret: "thisshouldbeabettersecret", // replace with a strong secret
//     resave: false, // don’t save session if unmodified
//     saveUninitialized: false, // don’t create session until something is stored
//     cookie: {
//       expires: Date.now() + 7 * 24 * 60 * 60 * 1000;
//       maxAge: 1000 * 60 * 60, // 1 hour
//       secure: false, // true if using HTTPS
//       httpOnly : true;
//     },
//   })
// );

// //passport use here
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate())); // use static authenticate method of model in LocalStrategy
// passport.serializeUser(User.serializeUser()); // use static serialize and deserialize of model for passport session support
// passport.deserializeUser(User.deserializeUser());

//user login
// app.get("/users", async(req, res) => {
//     const userNm = new User({
//         email : "tavs@gmail.com",
//         username : "tavs"
//     });
//     let registeredUser = await User.register(userNm, "tavss");
//     res.send(registeredUser);
// });

//signup
// app.get("/signup", (req, res) => {
//   res.render("users/signup.ejs");
// });

// app.post(
//   "/signup",
//   wrapAsync(async (req, res) => {
//     const { username, email, password } = req.body;
//     const newUser = new User({ email, username });
//     const registeredUser = await User.register(newUser, password);
//     console.log(registeredUser);
//     res.redirect("/listings");
//   })
// );

//login
// app.get("/login", (req, res) => {
//   res.render("users/login.ejs");
// });

// app.post(
//   "/login",
//   passport.authenticate("local", { failureRedirect: "/login" }),
//   async (req, res) => {
//     res.redirect("/listings");
//   }
// );

//Insert in mongoDB
// app.get("/enterData", async(req, res) => {
//     const list1 = new Listing({
//         title: "villa awesome",
//         description: "Buying own",
//         price: 1234,
//         location: "gorgea",
//         country: "Greenland",
//     });
//     await list1.save();
//     res.send("saved in database");
// });

// if request matching above routes it will executed but if not find route then it will prints "Page Not Found"
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//error handling
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // req.flash("error", message);
  // res.status(statusCode).redirect("back");
});

//server listening
app.listen(8080, () => {
  console.log(`Server is listening to Port 8080`);
});
