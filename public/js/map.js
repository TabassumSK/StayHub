// maptilersdk.config.apiKey = MAP_TOKEN;

// // 2️⃣ Create map AFTER page loads
// document.addEventListener("DOMContentLoaded", function () {
//   const map = new maptilersdk.Map({
//     container: "map",
//     style: maptilersdk.MapStyle.TOPO,
//     center: [16.62662018, 49.2125578],
//     zoom: 9,
//   });
// });


// new maptilersdk.Marker()
//     .setLngLat(coordinates)
//     .addTo(map);


if (typeof MAP_TOKEN !== "undefined" && typeof maptilersdk !== "undefined") {
  maptilersdk.config.apiKey = MAP_TOKEN;
}

document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  if (typeof MAP_TOKEN === "undefined" || !MAP_TOKEN) {
    console.error("MapTiler API key (MAP_TOKEN) is missing.");
    return;
  }

  if (typeof maptilersdk === "undefined") {
    console.error("MapTiler SDK library failed to load.");
    return;
  }

  maptilersdk.config.apiKey = MAP_TOKEN;

  const validCoordinates =
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number" &&
    !isNaN(coordinates[0]) &&
    !isNaN(coordinates[1])
      ? coordinates
      : [77.209, 28.6139];

  const map = new maptilersdk.Map({
    container: "map",
    apiKey: MAP_TOKEN,
    style: maptilersdk.MapStyle.STREETS,
    center: validCoordinates,
    zoom: 9,
  });

  const marker = new maptilersdk.Marker({ color: "#fe424d" })
    .setLngLat(validCoordinates)
    .addTo(map);

  if (typeof listingLocation !== "undefined" && listingLocation) {
    const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<h6>${listingTitle || "Stay Location"}</h6><p class="text-muted mb-0">${listingLocation}</p>`
    );
    marker.setPopup(popup);
  }
});

