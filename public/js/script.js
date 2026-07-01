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

// toggle function working
let taxSwitch = document.getElementById("flexSwitchCheckDefault");
if (taxSwitch) {
  taxSwitch.addEventListener("click", () => {
    let taxInfo = document.getElementsByClassName("tax-info");
    for (info of taxInfo) {
      if (info.style.display != "inline") {
        info.style.display = "inline";
      } else {
        info.style.display = "none";
      }
    }
  });
}

// Liking function - toggle heart icon red on click
let cardLikes = document.querySelectorAll(".heart-icon");
cardLikes.forEach((cardLike) => {
  cardLike.addEventListener("click", (e) => {
    // Prevent the click from triggering the card link
    e.preventDefault();
    e.stopPropagation();

    // Toggle the red class on the heart icon
    cardLike.classList.toggle("red");
  });
});
