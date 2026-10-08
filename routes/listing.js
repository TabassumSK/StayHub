const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");
const bookingControllers = require("../controllers/bookings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingControllers.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.createListing),
  );

//new listing route
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing));

//index listings route
// router.get("/", wrapAsync(listingControllers.index));

//show route
// router.get("/:id", wrapAsync(listingControllers.showListing));

//create listing route
// router.post(
//   "/",
//   isLoggedIn,
//   validateListing,
//   wrapAsync(listingControllers.createListing),
// );

// edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm),
);

router
  .route("/:id/book")
  .get(isLoggedIn, wrapAsync(bookingControllers.renderBookingForm))
  .post(isLoggedIn, wrapAsync(bookingControllers.createBooking));

//update route
// router.put(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   validateListing,
//   wrapAsync(listingControllers.updateListing),
// );

//delete route
// router.delete(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingControllers.destroyListing),
// );

module.exports = router;
