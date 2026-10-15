// MVC - implement design pattern for listings
//model - database, view - frontend, controllers - backend

const Listing = require("../models/listing.js");
const axios = require("axios");
const categoryOptions = require("../categories");
const ExpressError = require("../utils/ExpressError");

async function getCoordinates(location, country) {
  const mapToken = process.env.MAP_TOKEN;
  if (!mapToken) {
    throw new ExpressError(503, "Location lookup is not configured. Add MAP_TOKEN to the server environment.");
  }

  let response;
  try {
    response = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(`${location}, ${country}`)}.json`,
      { params: { key: mapToken } },
    );
  } catch (err) {
    if (!axios.isAxiosError(err)) {
      throw err;
    }
    if ([401, 403].includes(err.response?.status)) {
      throw new ExpressError(502, "MapTiler rejected MAP_TOKEN. Check that the token is valid and enabled for geocoding.");
    }
    if (err.response?.status === 429) {
      throw new ExpressError(503, "MapTiler's geocoding limit has been reached. Please try again later.");
    }
    throw new ExpressError(502, "MapTiler could not look up this location. Check the network connection and try again.");
  }

  const coordinates = response.data.features?.[0]?.center;
  if (
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    !coordinates.every(Number.isFinite)
  ) {
    throw new ExpressError(400, "MapTiler could not find this city or area. Check the location and country and try again.");
  }
  return coordinates;
}

//index listings
module.exports.index = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
  const requestedCategory = typeof req.query.category === "string" ? req.query.category : "";
  const category = categoryOptions.some((option) => option.value === requestedCategory)
    ? requestedCategory
    : "";
  const searchPattern = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = {};
  if (category) {
    const selectedCategory = categoryOptions.find((option) => option.value === category);
    const legacyCategoryMatch = {
      category: null,
      $or: selectedCategory.legacyKeywords.flatMap((keyword) =>
        ["title", "description", "services"].map((field) => ({
          [field]: { $regex: keyword, $options: "i" },
        })),
      ),
    };
    filter.$and = [{ $or: [{ category }, legacyCategoryMatch] }];
  }
  if (searchPattern) {
    const searchFilter = ["title", "description", "location", "country", "services"].map((field) => ({
      [field]: { $regex: searchPattern, $options: "i" },
    }));
    if (filter.$and) {
      filter.$and.push({ $or: searchFilter });
    } else {
      filter.$or = searchFilter;
    }
  }
  const allListings = await Listing.find(filter);
  res.render("listings/index", { allListings, q, category, categoryOptions });
};

// new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", { categoryOptions });
};

//show listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate({ path: "owner" });
  if (!listing) {
    // throw new ExpressError(404, "Listing not found");
    req.flash("error", "Listing you requested for does not exists");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

// create listing
module.exports.createListing = async (req, res) => {
  if (!req.file) {
    throw new ExpressError(400, "Please upload a listing photo.");
  }

  let url = req.file.path;
  let filename = req.file.filename;

  // Get coordinates from location
  const { location, country } = req.body.listing;
  const coords = await getCoordinates(location, country);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

   // Save geometry
  newListing.geometry = {
    type: "Point",
    coordinates: coords
  };

  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

//edit listing
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image?.url || "";
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }
  res.render("listings/edit", { listing, originalImageUrl, categoryOptions });
};

// update listing
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists");
    return res.redirect("/listings");
  }

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

//delete listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
