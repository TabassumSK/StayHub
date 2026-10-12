// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false,
    );
  });
})();

const taxToggle = document.getElementById("taxToggle");
if (taxToggle) {
  taxToggle.addEventListener("click", () => {
    const showTax = taxToggle.getAttribute("aria-pressed") !== "true";
    taxToggle.setAttribute("aria-pressed", String(showTax));
    const taxInfo = document.querySelectorAll(".tax-info");
    taxInfo.forEach((info) => {
      info.style.display = showTax ? "inline" : "none";
    });
  });
}

// Liking function - toggle heart icon red on click
let cardLikes = document.querySelectorAll(".heart-icon");
cardLikes.forEach((cardLike) => {
  cardLike.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isSaved = cardLike.classList.toggle("is-saved");
    cardLike.setAttribute("aria-pressed", String(isSaved));
    cardLike.setAttribute(
      "aria-label",
      `${isSaved ? "Remove" : "Save"} ${cardLike.dataset.listingTitle || "stay"}`,
    );

    const heartIcon = cardLike.querySelector("i");
    if (heartIcon) {
      heartIcon.classList.toggle("fa-solid", isSaved);
      heartIcon.classList.toggle("fa-regular", !isSaved);
    }
  });
});
