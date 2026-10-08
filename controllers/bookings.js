const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

const paymentMethods = [
  { value: "upi", label: "UPI", description: "Continue with your preferred UPI app." },
  { value: "card", label: "Credit or debit card", description: "Choose a card at the payment step." },
  { value: "pay_at_property", label: "Pay at the property", description: "Arrange payment with your host." },
];

function parseDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { date, timestamp: date.getTime() };
}

async function loadBookableListing(id) {
  const listing = await Listing.findById(id).populate("owner");

  if (!listing) {
    throw new ExpressError(404, "The listing you selected could not be found.");
  }

  if (typeof listing.price !== "number" || !Number.isFinite(listing.price) || listing.price < 0) {
    throw new ExpressError(400, "This listing does not have a valid nightly price.");
  }

  return listing;
}

module.exports.renderBookingForm = async (req, res) => {
  const listing = await loadBookableListing(req.params.id);

  if (listing.owner._id.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing.");
    return res.redirect(`/listings/${listing._id}`);
  }

  const now = new Date();
  const minDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  res.render("bookings/new", { listing, paymentMethods, minDate });
};

module.exports.createBooking = async (req, res) => {
  const listing = await loadBookableListing(req.params.id);

  if (listing.owner._id.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing.");
    return res.redirect(`/listings/${listing._id}`);
  }

  const bookingInput = req.body.booking;
  if (!bookingInput || typeof bookingInput !== "object") {
    throw new ExpressError(400, "Please enter your booking details.");
  }

  const checkIn = parseDateOnly(bookingInput.checkIn);
  const checkOut = parseDateOnly(bookingInput.checkOut);
  if (!checkIn || !checkOut) {
    throw new ExpressError(400, "Enter valid check-in and check-out dates.");
  }

  const now = new Date();
  const todayTimestamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  if (checkIn.timestamp < todayTimestamp) {
    throw new ExpressError(400, "Check-in cannot be in the past.");
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  if (checkOut.timestamp <= checkIn.timestamp) {
    throw new ExpressError(400, "Check-out must be after check-in.");
  }

  const nights = (checkOut.timestamp - checkIn.timestamp) / millisecondsPerDay;
  const guests = Number(bookingInput.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    throw new ExpressError(400, "Guest count must be between 1 and 20.");
  }

  const paymentMethod = paymentMethods.find(
    (method) => method.value === bookingInput.paymentMethod,
  );
  if (!paymentMethod) {
    throw new ExpressError(400, "Choose one of the available payment methods.");
  }

  const booking = await Booking.create({
    listing: listing._id,
    guest: req.user._id,
    checkIn: checkIn.date,
    checkOut: checkOut.date,
    guests,
    nightlyPrice: listing.price,
    totalPrice: listing.price * nights,
    paymentMethod: paymentMethod.value,
  });

  const savedBooking = await booking.populate("listing");

  res.render("bookings/confirmation", { booking: savedBooking, paymentMethods });
};
