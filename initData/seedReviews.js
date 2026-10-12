if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

async function seedReviews() {
  console.log("Sample review seeding is disabled. Only real user reviews are shown.");
}

seedReviews();
